mod traits;
mod providers;
mod core;
mod binary;

use async_trait::async_trait;
use log::{debug, info};
use tokio::sync::watch;
use traits::ModProvider;
use std::{sync::Arc, time::SystemTime};

use crate::{core::{DefaultDownloadService, DownloadService, ProviderApi}, providers::ModWorkShopProvider};

fn setup_logger() -> Result<(), fern::InitError> {


    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "({}) [{} -> {}] {}",
                humantime::format_rfc3339_seconds(SystemTime::now()),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .apply()?;

    Ok(())
}
#[tokio::main]
async fn main() {
    setup_logger().unwrap();

    info!("Welcome back to development hell");
    let shared_download_service: Arc<dyn DownloadService> = Arc::new(DefaultDownloadService::new());

    let api = PApi::new(shared_download_service).into_arc();

    let loaded_provider = ModWorkShopProvider::new(Arc::clone(&api));
    // dbg!(loadedProvider.configure());
    loaded_provider.download_mod("mod_id".to_string()).await;

}

pub struct PApi {
    download_service: Arc<dyn DownloadService>
}

impl PApi {
    fn new(download_service: Arc<dyn DownloadService>) -> Self {
        Self { download_service }
    }

    pub fn into_arc(self) -> Arc<dyn ProviderApi> {
        Arc::new(self)
    }
}

#[async_trait]
impl ProviderApi for PApi {
    fn download_service(&self) -> Arc<dyn DownloadService> {
        Arc::clone(&self.download_service)
    }

    async fn queue_download(&self, url: String) -> watch::Receiver<traits::ModDownloadResult> {
        let x = self.download_service.queue_download(url);
        x.await
    }
}
