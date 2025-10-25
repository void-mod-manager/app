use std::sync::Arc;
use tauri::{ipc::IpcResponse, State};

use crate::{core::{Context as AppContext, ProviderEntry, RegistryError}, providers::{GenericMod, ModExtendedMetadata}, traits::{DiscoveryQuery, DiscoveryResult, GameMetadata}};

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
    let provider_id = state.active_game_required_provider().expect("Select a game first");
    let provider = state.get_mod_provider(&provider_id)?;

    let result = provider.discover(&DiscoveryQuery {
        game_id: "1".into(),
        page: page,
        page_size: None,
        search: None,
        tags: None,
        sort: None
    }).await.map_err(|e| RegistryError::NotFound(format!("Discovery error: {}", e)));

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ctx: Arc<AppContext>) {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .targets(
                [
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                    file_name: Some(String::from("latest.log")),

                })
                ])
            .build(),
        )?;
      }
      Ok(())
    })
    .manage(ctx)
    .invoke_handler(tauri::generate_handler![greet, list_games, get_metadata_for, get_discovery_mods, set_active_game, get_active_game, get_extended_info])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
