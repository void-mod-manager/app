use std::sync::Arc;

use async_trait::async_trait;
use tokio::sync::watch;

use crate::{core::{DownloadService}, traits::ModDownloadResult};

#[async_trait]
pub trait ProviderApi: Send + Sync {

    fn download_service(&self) -> Arc<dyn DownloadService>;

    fn get_current_game(&self) -> String {
        String::from("payday-2")
    }

   async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult>;

}
