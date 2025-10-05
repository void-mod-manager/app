use std::{env::temp_dir, path::PathBuf, sync::Arc};

use log::{error, info};
use reqwest::Client;
use tokio::{fs::File, io::AsyncWriteExt};

use crate::{core::ProviderApi, traits::{ModDownloadResult, ModProvider}};

pub struct ModWorkShopProvider {
    api: Arc<dyn ProviderApi>
}

impl ModProvider for ModWorkShopProvider {
    fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self { api }
    }

    fn configure(&self) -> &crate::traits::ModProviderFeatures {
        todo!("Configure")
    }

    async fn download_mod(&self, mod_id: String) -> crate::traits::ModDownloadResult {
        //let target = format!("https://api.modworkshop.net/mods/{}", mod_id);
        let target = String::from("https://storage.modworkshop.net/mods/files/53461_71246_ERjHBd1mwDsnSW70RlJ2meqkucPO3JtAsXfpyDU5.zip?filename=Rich%20Presence%20Musical.zip");
        let mut rx = self.api.queue_download(target).await;

        use crate::traits::ModDownloadResult::*;
        loop {
            if rx.changed().await.is_err() {
                return Failed("Download task ended unexpectedly".into());
            }
            match &*rx.borrow() {
                InProgress(p) => {
                    info!("Progress {}", p);
                }
                Completed => return Completed,
                Failed(e) => return Failed(e.clone()),
                Cancelled => return Cancelled,
                _ => {}
            }
        }
        // let client = Client::new();
        // let response = match client.get(&target).send().await {
        //     Ok(resp) => resp,
        //     Err(e) => {
        //         error!("Failed to download: {e}");
        //         return ModDownloadResult::Failed(e.to_string())
        //     }
        // };
        // // Everything below here should be moved into api.queue_download();
        // let fname = response
        //     .url()
        //     .path_segments()
        //     .and_then(|segmants| segmants.last())
        //     .filter(|name| !name.is_empty())
        //     .unwrap_or("default.zip");

        // let mut dest_path: PathBuf = temp_dir().into();
        // dest_path.push(fname);
        // info!("Downloading to: {:?}", dest_path);

        // let mut file = match File::create(&dest_path).await {
        //     Ok(f) => f,
        //     Err(e) => {
        //         error!("Failed to create file: {e}");
        //         return ModDownloadResult::Failed(e.to_string())
        //     }
        // };

        // let mut stream = response.bytes_stream();
        // use futures_util::StreamExt;
        // while let Some(chunk) = stream.next().await {
        //     let chunk = match chunk {
        //         Ok(c) => c,
        //         Err(e) => {
        //             error!("Error reading chunk {e}");
        //             return ModDownloadResult::Failed(e.to_string())
        //         }
        //     };

        //     if let Err(e) = file.write_all(&chunk).await {
        //         error!("Error writing to file: {e}");
        //         return ModDownloadResult::Failed(e.to_string())
        //     };
        //     info!("Download ticked..");
        // }

        // info!("Download success! {}", dest_path.display());
        // ModDownloadResult::Completed
    }

    fn register(&self) -> String {
        std::todo!("Here, we'd register the games for the provider");
    }
}
