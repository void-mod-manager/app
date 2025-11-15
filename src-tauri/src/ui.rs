use std::sync::Arc;

use lib_vmm::{registry::RegistryError, runtime::Context as AppContext, traits::{discovery::{DiscoveryQuery, DiscoveryResult, ModExtendedMetadata}, game_provider::GameMetadata, mod_provider::ModDownloadResult}};
use taurpc::procedures;
use crate::{core::{DefaultDownloadService}};

#[procedures(export_to = "../src/generated/types.ts")]
pub trait ModService {
    async fn greet() -> String;

    async fn get_metadata_for(id: String) -> Result<GameMetadata, RegistryError>;

    async fn set_active_game(id: String) -> Result<(), RegistryError>;

    async fn get_active_game() -> Option<String>;

    async fn get_discovery_mods(page: Option<u32>) -> Result<DiscoveryResult, RegistryError>;

    async fn get_extended_info(id: String, ) -> Result<ModExtendedMetadata, RegistryError>;

    async fn list_games() -> Result<Vec<String>, ()>;

    async fn download_mod(id: String) -> Result<(), ()>;
}

#[derive(Clone)]
struct ModServiceImpl {
    ctx: Arc<AppContext>
}

#[taurpc::resolvers]
impl ModService for ModServiceImpl {
    async fn greet(self) -> String {
        "Hello, world from Rust!".into()
    }

    async fn get_discovery_mods(self, page: Option<u32>) -> Result<DiscoveryResult, RegistryError> {
        let ctx = self.ctx;
        let provider_id = ctx
            .active_game_required_provider()
            .ok_or_else(|| RegistryError::NotFound("No active game selected".into()))?;

        let provider = ctx.get_mod_provider(&provider_id)?;
        let game_id = ctx
            .active_game()
            .ok_or_else(|| RegistryError::NotFound("No active game selected".into()))?;


        let result = provider.discover(&DiscoveryQuery {
            game_id,
            page,
            page_size: None,
            search: None,
            tags: None,
            sort: None
        })
        .await.map_err(|e| RegistryError::NotFound(format!("Discovery error: {e}")));

        result
    }

    async fn get_extended_info(self, id: String) -> Result<ModExtendedMetadata, RegistryError> {
        Ok(self.ctx.get_extended_info(&id).await?)
    }

    async fn get_metadata_for(self, id: String) -> Result<GameMetadata, RegistryError> {
        self.ctx.get_metadata(&id)
    }

    async fn set_active_game(self, id: String) -> Result<(), RegistryError> {
        self.ctx.activate_game(&id)?;
        Ok(())
    }

    async fn get_active_game(self) -> Option<String> {
        self.ctx.active_game()
    }

    async fn list_games(self) -> Result<Vec<String>, ()> {
        Ok(self.ctx.list_games()
            .iter()
            .map(|g| g.0.clone())
            .collect())
    }

    async fn download_mod(self, id: String) -> Result<(), ()> {
        let provider_id = match self.ctx.active_game_required_provider() {
            Some(id) => id,
            None => return Err(())
        };

        let mod_provider = match self.ctx.get_mod_provider(&provider_id) {
            Ok(provider) => provider,
            Err(_) => return Err(())
        };

        let path = mod_provider.download_mod(id).await;

        let game_provider_id = match self.ctx.active_game() {
            Some(id) => id,
            None => return Err(())
        };

        let game_provider = match self.ctx.get_game_provider(&game_provider_id) {
            Ok(provider) => provider,
            Err(_) => return Err(())
        };


        match path {
            ModDownloadResult::Completed(ref p) => {
                if game_provider.install_mod(p).is_err() {
                    return Err(());
                }
            },
            _ => {
                println!("[dbg] Dropped mod result (fail)");
                return Err(());
            }
        }

        Ok(())
    }


}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ctx: Arc<AppContext>, download_service: Arc<DefaultDownloadService>) {
  tauri::Builder::default()
    .setup(move |app| {
        download_service.set_handle(app.handle().clone());
        Ok(())
    })
    .manage(ctx.clone())
    // .invoke_handler(tauri::generate_handler![get_metadata_for, get_discovery_mods, set_active_game, get_extended_info])
    .invoke_handler(taurpc::create_ipc_handler(ModServiceImpl{ ctx: ctx.clone() }.into_handler()))
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
