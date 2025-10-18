use std::sync::Arc;
use tauri::{State};

use crate::{core::{Context as AppContext, ProviderEntry, RegistryError}, providers::GenericMod, traits::GameMetadata};

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
async fn get_discovery_mods(state: State<'_, Arc<AppContext>>) -> Result<Vec<GenericMod>, RegistryError> {
    let provider_id = state.active_game_required_provider().expect("Select a game first");
    let provider = state.get_mod_provider(&provider_id)?;

    let x = provider.discover_mods("1".into()).await;

    Ok(x)
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
    .invoke_handler(tauri::generate_handler![greet, list_games, get_metadata_for, get_discovery_mods, set_active_game])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
