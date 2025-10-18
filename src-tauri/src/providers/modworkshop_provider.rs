use std::sync::Arc;
use log::info;
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use crate::{core::ProviderApi, traits::ModProvider};


pub struct ModWorkShopProvider {
    api: Arc<dyn ProviderApi>
}

impl ModWorkShopProvider {
    pub fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self { api }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenericMod {
    id: u64,
    name: String,
    description: String,
    short_description: String,
    downloads: u64,
    views: u64,
    likes: u64,
    thumbnail_image: String,

    user_name: String,
    user_avatar: String,

}

#[async_trait::async_trait]
impl ModProvider for ModWorkShopProvider {

    fn configure(&self) -> &crate::traits::ModProviderFeatures {
        todo!("Configure")
    }


    async fn download_mod(&self, _mod_id: String) -> crate::traits::ModDownloadResult {
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
    }

    async fn discover_mods(&self, game: String) -> Vec<GenericMod> {
        let target = "https://api.modworkshop.net/games/1/mods";
        // We should probably move the calling URL logic to DownloadProvider, or rename it to NetworkProvider, but this is fine for now.
        let client = reqwest::Client::new();
        let response = client
            .get(target)
            .header(USER_AGENT, "VoidModManager/0.1.0 (+https://github.com/NotGhoull/Void-Mod-Manager)")
            .send().await.expect("Failed to send request"); // <- We error for now until we finish the API
        // TODO replace error
        let txt = response.text().await.expect("Failed to read response");
        let parsed: Value = serde_json::from_str(&txt).expect("Failed to create reader");

        let mods = parsed["data"].as_array().unwrap();
        let mut modInfos: Vec<GenericMod> = Vec::new();

        for v in mods {
            modInfos.push(
                GenericMod {
                    name: v["name"].as_str().unwrap_or("error").to_owned(),
                    id: v["id"].as_u64().unwrap_or(0),
                    description: v["desc"].as_str().unwrap_or("error").to_owned(),
                    short_description: v["short_desc"].as_str().unwrap_or("error").to_owned(),
                    downloads: v["downloads"].as_u64().unwrap_or(0),
                    views: v["views"].as_u64().unwrap_or(0),
                    likes: v["likes"].as_u64().unwrap_or(0),
                    thumbnail_image: match v["thumbnail"]["file"].as_str() {
                        Some(file) if !file.is_empty() => format!("https://storage.modworkshop.net/mods/images/{}", file),
                        _ => "https://modworkshop.net/assets/no-preview.webp".to_owned(),
                    },
                    user_name: v["user"]["name"].as_str().unwrap_or("error").to_owned(),
                    user_avatar: format!("https://storage.modworkshop.net/users/images/{}", v["user"]["avatar"].as_str().unwrap_or("error").to_owned())
                }
            );
        }

        return modInfos;

    }

    fn register(&self) -> String {
        "core:modworkshop".into()
    }
}
