#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod traits;
mod providers;
mod core;
mod binary;
mod ui;

use log::{info, trace, warn};
use traits::ModProvider;
use std::{env, sync::Arc};

use crate::{core::{ContextBuilder, CoreProviderApi, DefaultDownloadService, DownloadService, ProviderSource}, providers::{ModWorkShopProvider, Payday2Provider}};

#[tokio::main]
async fn main() {

    #[cfg(target_os = "linux")]
    {
        info!("Running under the penguin");
        if has_proprietary_linux_driver() && is_wayland() {
            warn!("Wayland + Nvidia doesn't play nicely with Tauri, applying workaround");

            env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

            let env_var = env::var("WEBKIT_DISABLE_DMABUF_RENDERER");
            // Check if the var applied
            if env_var.is_ok() {
                println!("Success!")
            } else {
                warn!("Workaround failed, goodluck")
            }
        }
    }

    let mut ctx_builder = ContextBuilder::new();


    let shared_download_service: Arc<dyn DownloadService> = Arc::new(DefaultDownloadService::new());
    let api = CoreProviderApi::new(shared_download_service).into_arc();

    let mwsprovider = Arc::new(ModWorkShopProvider::new(api.clone()));
    let _ = ctx_builder
        .register_mod_provider(&mwsprovider.register(), mwsprovider, ProviderSource::Core);

    let payday_2_game_provider = Arc::new(Payday2Provider::new());
    let _ = ctx_builder
        .register_game_provider(payday_2_game_provider, ProviderSource::Core);

    let ctx = Arc::new(ctx_builder.freeze());
    ctx.debug_dump();
    ui::run(ctx);

    // let shared_download_service: Arc<dyn DownloadService> = Arc::new(DefaultDownloadService::new());

    // let api = PApi::new(shared_download_service).into_arc();
    // let loaded_provider = ModWorkShopProvider::new(Arc::clone(&api));

    // run()

    // dbg!(loadedProvider.configure());
    // loaded_provider.download_mod("mod_id".to_string()).await;
}

#[cfg(target_os = "linux")]
fn has_proprietary_linux_driver() -> bool {
    match nvml_wrapper::Nvml::init() {
        Ok(_) => {
            trace!("Nvidia driver detected");
            true
        },
        Err(_) => {
            trace!("Nvidia not detected");
            false
        }
    }
}

#[cfg(target_os = "linux")]
fn is_wayland() -> bool {
    trace!("Wayland check");
    std::env::var("WAYLAND_DISPLAY").is_ok()
}
