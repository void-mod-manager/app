use std::{collections::HashMap, sync::{Arc, Mutex}};
use crate::{core::{normalize_id, GameEntry, ProviderEntry, ProviderSource, RegistryError}, traits::{GameMetadata, GameProvider, ModExtendedMetadata, ModProvider}};

pub struct ContextBuilder {
    mod_providers: HashMap<String, ProviderEntry>,
    games: HashMap<String, GameEntry>
}

impl ContextBuilder {
    pub fn new() -> Self {
        Self {
            mod_providers: HashMap::new(),
            games: HashMap::new(),
        }
    }

    pub fn register_mod_provider(&mut self, id: &str, provider: Arc<dyn ModProvider + Send + Sync>, source: ProviderSource) -> Result<(), RegistryError> {
        let id = normalize_id(id)?;
        if id.starts_with("core:") && !matches!(source, ProviderSource::Core) {
            return Err(RegistryError::ReservedCoreId(id),)
        }

        if self.mod_providers.contains_key(&id) {
            return Err(RegistryError::ProviderAlreadyExists(id));
        }

        self.mod_providers.insert(id.clone(), ProviderEntry {
            id,
            source,
            provider
        });

        Ok(())
    }

    pub fn register_game_provider(&mut self, provider: Arc<dyn GameProvider + Send + Sync>, source: ProviderSource) -> Result<(), RegistryError> {
        let id = normalize_id(provider.game_id())?;
        if self.games.contains_key(&id) {
            return Err(RegistryError::GameAlreadyExists(id));
        }

        let depends_on = normalize_id(provider.mod_provider_id())?;

        if !self.mod_providers.contains_key(&depends_on) {
            return Err(RegistryError::NotFound(depends_on));
        }

        self.games.insert(id.clone(), GameEntry {
            id,
            source,
            game: provider,
            required_provider_id: depends_on
        });

        Ok(())
    }

    pub fn freeze(self) -> Context {
        Context {
            mod_providers: Arc::new(self.mod_providers),
            game_providers: Arc::new(self.games),
            active_game: Mutex::new(None),
        }
    }
}

pub struct Context {
    mod_providers: Arc<HashMap<String, ProviderEntry>>,
    game_providers: Arc<HashMap<String, GameEntry>>,
    active_game: Mutex<Option<String>>
}


impl Context {
    pub fn get_mod_provider(&self, id: &str) -> Result<Arc<dyn ModProvider + Send + Sync>, RegistryError> {
        let id = normalize_id(id)?;
        self.mod_providers
            .get(&id)
            .map(|e| Arc::clone(&e.provider))
            .ok_or_else(|| RegistryError::NotFound(id))
    }

    pub fn list_mod_providers(&self) -> Vec<(String, ProviderSource)> {
        self.mod_providers
            .values()
            .map(|e| (e.id.clone(), e.source.clone()))
            .collect()
    }

    pub fn list_games(&self) -> Vec<(String, ProviderSource, String)> {
        self.game_providers
            .values()
            .map(|g| (g.id.clone(), g.source.clone(), g.required_provider_id.clone()))
            .collect()
    }

    pub fn activate_game(&self, id: &str) -> Result<(), RegistryError> {
        let id = normalize_id(id)?;
        if !self.game_providers.contains_key(&id) {
            return Err(RegistryError::NotFound(id));
        }
        let mut active = self.active_game.lock().unwrap();
        println!("Activated game {}", &id);
        *active = Some(id);
        Ok(())
    }

    pub fn active_game(&self) -> Option<String> {
        self.active_game.lock().unwrap().clone()
    }

    pub fn active_game_required_provider(&self) -> Option<String> {
        let active = self.active_game();
        active.and_then(|id| {
            self.game_providers
                .get(&id)
                .map(|g| g.required_provider_id.clone())
        })
    }

    pub fn get_metadata(&self, id: &str) -> Result<GameMetadata, RegistryError> {
        let id = normalize_id(id)?;
        match self.game_providers.get(&id) {
            Some(game_entry) => {
                let metadata = game_entry.game.metadata();
                Ok(metadata)
            }
            None => Err(RegistryError::NotFound(id)),
        }
    }

    pub async fn get_extended_info(&self, id: &str) -> Result<ModExtendedMetadata, RegistryError> {
            let id = normalize_id(&id)?;
            let provider = self.active_game_required_provider().unwrap();
            let provider_entry = self
                .mod_providers
                .get(&provider)
                .ok_or(RegistryError::NotFound(provider.clone()))?;
            let provider = Arc::clone(&provider_entry.provider);

            Ok(provider.get_extended_mod(&id).await)
        }

    #[cfg(debug_assertions)]
    pub fn debug_dump(&self) {
        println!("Context dump\n ---> Providers");
        for (id, provider) in self.mod_providers.iter() {
            println!("\t{} ({:?})", id, provider.source)
        }
        println!("\n ---> Games");
        for (id, game) in self.game_providers.iter() {
            println!("\t{} ({:?}) -> Depends on {}", id, game.source, game.required_provider_id)
        }
    }

}
