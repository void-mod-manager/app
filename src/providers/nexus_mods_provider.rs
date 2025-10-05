use std::{env::temp_dir, fs::File, io::Write, sync::Arc};

use reqwest::get;

use crate::{core::ProviderApi, traits::{ModDownloadResult, ModProvider, ModProviderFeatures}};

#[deprecated(since = "v1", note = "Unusable due to issues with Nexus mods right now")]
pub struct NexusMods {
    api: Arc<dyn ProviderApi>,
    api_token: String,
    features: ModProviderFeatures
}

impl ModProvider for NexusMods {
    fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self {
            api,
            api_token: "default_token".to_string(),
            features: ModProviderFeatures {
                requires_api_token: true,
                ..ModProviderFeatures::default()
            }
        }
    }

    fn configure(&self) -> &ModProviderFeatures { &self.features }

    async fn download_mod(&self, mod_id: String) -> ModDownloadResult {
        let game = self.api.get_current_game();


        // Download logic
        // We'd want to move most of this downloading logic into
        // api.queue_download(), since then we can show it on the frontend, etc
        let currentDownload = ModDownloadResult::InProgress(0);
        // Hardcoded for now due to issues with nexusmods
        let target = "https://supporter-files.nexus-cdn.com/3333/1234/Rogue's Gloves for V-1234-1-10-1611602958.zip";
        let response = get(target).await.expect("Download failed");

        let mut dest = {
            let fname = response
                .url()
                .path_segments()
                .and_then(|segments| segments.last())
                .and_then(|name| if name.is_empty() { None } else { Some(name) })
                .unwrap_or("default.zip");

            println!("File to download: {}", fname);
            let fname = temp_dir().as_path().join(fname);
            println!("Will be located under: '{:?}'", fname);
            File::create(fname)
        };
        let content = response.bytes().await.expect("Should've been okay");
        dest.expect("Destitnation must exist!").write_all(&content).expect("Writing worked");

        println!("Download finished!");

        ModDownloadResult::Completed
    }

}
