use std::{path::PathBuf};
use async_trait::async_trait;
use futures_util::StreamExt;
use log::{debug, error, info};
use reqwest::Client;
use tokio::{fs::File, io::AsyncWriteExt, sync::{mpsc, watch::{self, Sender}}};

use crate::traits::ModDownloadResult;

pub struct QueuedDownload {
    #[allow(dead_code)]
    pub mod_id: String,
    pub url: String,
    pub progress: Sender<ModDownloadResult>
}

#[async_trait]
pub trait DownloadService: Send + Sync {
    // fn new() -> Self where Self: Sized;
    async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult>;

    // async fn process_download(download: QueuedDownload) where Self: Sized;
}

pub struct DefaultDownloadService {
    queue_tx: mpsc::Sender<QueuedDownload>
}

impl DefaultDownloadService {
    pub fn new() -> Self {
        let (queue_tx, mut queue_rx) = mpsc::channel::<QueuedDownload>(100);

        // Spawn a background task to process the queue
        tokio::spawn(async move {
            // emit `start_download` { mod_id }
            while let Some(download) = queue_rx.recv().await {
                Self::process_download(download).await;
            }
        });

        Self { queue_tx }
    }


    // This will be used to make it easier for Providers to download files, and so we can display them in the UI
    async fn process_download(download: QueuedDownload) {
        let QueuedDownload { mod_id: _, url, progress } = download;

        let client = Client::new();
        let resp = match client.get(&url).send().await {
            Ok(r) => r,
            Err(e) => {
                let _ = progress.send(ModDownloadResult::Failed(e.to_string()));
                error!("Download URL didn't respond: {}", e.to_string());
                return;
            }
        };

        let total_size = resp.content_length().unwrap_or(0);
        let fname = resp
            .url()
            .path_segments()
            .and_then(|seg| seg.last())
            .filter(|name| !name.is_empty())
            .unwrap_or("unknown.zip");

        // let mut path: PathBuf = temp_dir().into();
        let mut path: PathBuf = dirs::data_local_dir()
            .unwrap_or_else(|| PathBuf::from("/tmp"))
            .join("me.ghoul.void_mod_manager")
            .join("downloads");

        // Ensure the directory exists
        if let Err(e) = std::fs::create_dir_all(&path) {
            let _ = progress.send(ModDownloadResult::Failed(e.to_string()));
            error!("Error creating directory {}", e.to_string());
            return;
        }

        path.push(fname);

        let mut file = match File::create(&path).await {
            Ok(f) => f,
            Err(e) => {
                let _ = progress.send(ModDownloadResult::Failed(e.to_string()));
                error!("Error creating file {}", e.to_string());
                return;
            }
        };

        let mut downloaded: u64 = 0;
        let mut stream = resp.bytes_stream();

        while let Some(chunk) = stream.next().await {
            match chunk {
                Ok(bytes) => {
                    if let Err(e) = file.write_all(&bytes).await {
                        let _ = progress.send(ModDownloadResult::Failed(e.to_string()));
                        error!("Error writing to file {}", e.to_string());
                        return;
                    }
                    downloaded += bytes.len() as u64;
                    if total_size > 0 {
                        let percent = ((downloaded as f64 / total_size as f64) * 100.0).round() as u8;
                        // Emit here `download_progress` { progress: 0.23 }
                        let _ = progress.send(ModDownloadResult::InProgress(percent));
                        debug!("Downloaded {}!", percent);
                    }
                }
                Err(e) => {
                    let _ = progress.send(ModDownloadResult::Failed(e.to_string()));
                    error!("Error reading from stream {}", e.to_string());
                    return;
                }
            }
        }
        info!("Download completed, saved to {:#?}", file);
        // emit `resolve_download` { mod_id }
        let _ = progress.send(ModDownloadResult::Completed(path));
    }

}

#[async_trait]
impl DownloadService for DefaultDownloadService {

    async fn queue_download(&self, url: String) -> watch::Receiver<ModDownloadResult> {
        let (tx, rx) = watch::channel(ModDownloadResult::InProgress(0));
        let download = QueuedDownload { mod_id: "0".into(), url, progress: tx };
        self.queue_tx.send(download).await.expect("Queue should not be full");

        rx
    }
}
