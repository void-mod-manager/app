use std::sync::Arc;
use tauri::{State};

use crate::{core::{Context as AppContext, DefaultDownloadService, RegistryError}, traits::{DiscoveryQuery, DiscoveryResult, GameMetadata, ModDownloadResult, ModExtendedMetadata}};
use crate::core::DownloadService;

#[tauri::command]
fn greet() -> String {
    "Hello, world from Rust!".into()
}

#[tauri::command]
fn get_metadata_for(id: String, state: State<'_, Arc<AppContext>>) -> Result<GameMetadata, RegistryError> {
    state.get_metadata(&id)
}

#[tauri::command]
fn set_active_game(id: String, state: State<'_, Arc<AppContext>>) -> Result<(), RegistryError> {
    state.activate_game(&id)?;
    Ok(())
}

#[tauri::command]
fn get_active_game(state: State<'_, Arc<AppContext>>) -> Option<String> {
    state.active_game()
}

#[tauri::command]
async fn get_discovery_mods(state: State<'_, Arc<AppContext>>, page: Option<u32>) -> Result<DiscoveryResult, RegistryError> {
    let provider_id = state
        .active_game_required_provider()
        .ok_or_else(|| RegistryError::NotFound("No active game selected".into()))?;

    let provider = state.get_mod_provider(&provider_id)?;
    let game_id = state
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

#[tauri::command]
async fn get_extended_info(id: String, state: State<'_, Arc<AppContext>>) -> Result<ModExtendedMetadata, RegistryError> {
    Ok(state.get_extended_info(&id).await?)
}

#[tauri::command]
async fn list_games(state: State<'_, Arc<AppContext>>) -> Result<Vec<String>, ()> {
    Ok(state.list_games()
        .iter()
        .map(|g| g.0.clone())
        .collect())
}

#[tauri::command]
async fn download_mod(state: State<'_, Arc<AppContext>>, id: String) -> Result<(), ()> {
    let provider_id = state.active_game_required_provider().expect("msg");
    let mod_provider = state.get_mod_provider(&provider_id).expect("msg");
    let path = mod_provider.download_mod(id).await;

    let game_prodiver_id = state.active_game().expect("msg");
    let game_provider = state.get_game_provider(&game_prodiver_id).expect("msg");

    dbg!(&path);

    match path {
        ModDownloadResult::Completed(ref p) => game_provider.install_mod(p).expect("msg"),
        _ => {
            println!("[dbg] Dropped mod result (fail)")
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ctx: Arc<AppContext>, download_service: Arc<DefaultDownloadService>) {
  tauri::Builder::default()
    .setup(move |app| {
        download_service.set_handle(app.handle().clone());
        Ok(())
    })
    .manage(ctx)
    // .manage(download_service)
    .invoke_handler(tauri::generate_handler![greet, list_games, get_metadata_for, get_discovery_mods, set_active_game, get_active_game, get_extended_info, download_mod])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
