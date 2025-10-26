use std::sync::Arc;

use async_trait::async_trait;
use tokio::sync::watch;

use crate::{core::{download_service, DownloadService}, traits::ModDownloadResult};

#[async_trait]
pub trait ProviderApi: Send + Sync {

    fn download_service(&self) -> Arc<dyn DownloadService>;

    fn get_current_game(&self) -> String {
        String::from("payday-2")
    }

   async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult>;

}

pub struct CoreProviderApi {
    download_service: Arc<dyn DownloadService>,
}

impl CoreProviderApi {
    pub fn new(download_service: Arc<dyn DownloadService>) -> Self {
        Self { download_service }
    }

    pub fn into_arc(self) -> Arc<dyn ProviderApi> {
        Arc::new(self)
    }
}

#[async_trait]
impl ProviderApi for CoreProviderApi {
    fn download_service(&self) -> Arc<dyn DownloadService> {
        Arc::clone(&self.download_service)
    }

    async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult> {
        self.download_service.queue_download(url).await
    }
}
