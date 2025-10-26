use std::sync::Arc;

use async_trait::async_trait;
use tokio::sync::{watch, OnceCell};

use crate::{core::{Context, DownloadService}, traits::ModDownloadResult};

#[async_trait]
pub trait ProviderApi: Send + Sync {

    fn download_service(&self) -> Arc<dyn DownloadService>;
    fn context(&self) -> Arc<Context>;

    fn set_context(&self, ctx: Arc<Context>) -> ();

    fn get_current_game(&self) -> String {
        String::from("payday-2")
    }

   async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult>;

}

pub struct CoreProviderApi {
    download_service: Arc<dyn DownloadService>,
    context_cell: OnceCell<Arc<Context>>,
}

impl CoreProviderApi {
    pub fn new(download_service: Arc<dyn DownloadService>) -> Self {
        Self { download_service, context_cell: OnceCell::new() }
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

    fn context(&self) -> Arc<Context> {
        match self.context_cell.get() {
            Some(ctx) => Arc::clone(ctx),
            None => panic!("Context not set!"),
        }
    }

    fn set_context(&self, ctx: Arc<Context>) {
        if self.context_cell.set(ctx).is_err() {
            panic!("Cannot set context twice!");
        }
    }


    async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult> {
        self.download_service.queue_download(url).await
    }
}
