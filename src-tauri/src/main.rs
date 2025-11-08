#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod traits;
mod providers;
mod core;
mod binary;
mod ui;

use log::{info, trace, warn};
use tracing_log::LogTracer;
use traits::ModProvider;
use std::{env, sync::Arc};

use crate::{core::{ContextBuilder, CoreProviderApi, DefaultDownloadService, DownloadService, ProviderSource}, providers::{ModWorkShopProvider, Payday2Provider}};

#[tokio::main]
async fn main() {
    LogTracer::init().expect("Failed to init logging");
    tracing_subscriber::fmt().with_max_level(tracing::Level::DEBUG).try_init().ok();
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

    let download_service = Arc::new(DefaultDownloadService::new());
    let api = CoreProviderApi::new(download_service.clone()).into_arc();

    let mwsprovider = Arc::new(ModWorkShopProvider::new(api.clone()));
    ctx_builder
        .register_mod_provider(&mwsprovider.register(), mwsprovider, ProviderSource::Core)
        .expect("failed to register Modworkshop provider!");

    let payday_2_game_provider = Arc::new(Payday2Provider::new());
    ctx_builder
        .register_game_provider(payday_2_game_provider, ProviderSource::Core)
        .expect("failed to register PAYDAY 2 game Provider!");

    let ctx = Arc::new(ctx_builder.freeze());
    api.set_context(Arc::clone(&ctx));
    ctx.debug_dump();
    ui::run(ctx, download_service);
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
