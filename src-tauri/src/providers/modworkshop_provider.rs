use std::{string, sync::Arc};
use log::{info, kv::ToValue};
use reqwest::header::{CONTENT_TYPE, USER_AGENT};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::Url;
use crate::{core::ProviderApi, traits::{DiscoveryError, DiscoveryMeta, DiscoveryQuery, DiscoveryResult, ModProvider, PaginationMeta, SortOrder}};


pub struct ModWorkShopProvider {
    api: Arc<dyn ProviderApi>
}

impl ModWorkShopProvider {
    pub fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self { api }
    }

    // fn map_game_id(&self, game_id: &str) -> Result<u32, DiscoveryError> {
    //     match game_id {
    //         1 => Ok(1),
    //         other => Err(DiscoveryError::InvalidQuery(format!("Unsupported game_id '{}'", other)))
    //     }
    // }

    fn map_sort(sort: &SortOrder) -> &'static str {
        match sort {
            SortOrder::Relevance => "relevance",
            SortOrder::Downloads => "downloads",
            SortOrder::Views => "views",
            SortOrder::Likes => "likes",
            SortOrder::Newest => "created_desc",
            SortOrder::Updated => "updated_desc",
        }
    }

    fn build_url(&self, query: &DiscoveryQuery) -> Result<Url, DiscoveryError> {
        // let id = self.map_game_id(&query.game_id)?;

        let base = format!("https://api.modworkshop.net/games/{}/mods", query.game_id);
        let mut url = Url::parse(&base).map_err(|e| DiscoveryError::Internal(e.to_string()))?;

        {
            let mut qp = url.query_pairs_mut();

            if let Some(page) = query.page {
                let page = if page == 0 { 1 } else { page };
                qp.append_pair("page", &page.to_string());
            }
        }
        Ok(url)
    }

    fn build_body(&self, query: &DiscoveryQuery) -> Result<Value, DiscoveryError> {
        // TODO: harcoded
        let id = json!(1);
        let mut root = json!({ "game_id": id });
        let obj = root.as_object_mut().expect("Root must be an object");

        if let Some(page) = query.page {
            obj.insert("page".into(), Value::Number(page.into()));
        }

        Ok(root)
    }

}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenericMod {
    id: String,
    name: String,
    description: String,
    short_description: String,
    downloads: u64,
    views: u64,
    likes: u64,
    thumbnail_image: String,

    // TODO: Make this authors and use a modAuthors vec
    user_name: String,
    user_avatar: String,

}

pub struct ModDependency {
    id: String,
    name: String,
    icon: String,
    installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModExtendedMetadata {
    pub header_image: String,
    pub caoursel_images: Vec<String>,
    pub version: String,
    pub installed: bool,
    pub description: String,
}

#[async_trait::async_trait]
impl ModProvider for ModWorkShopProvider {

    async fn discover(&self, query: &DiscoveryQuery) -> Result<DiscoveryResult, DiscoveryError> {
        let target = self.build_url(&query)?;
        dbg!(&target);
        // We should probably move the calling URL logic to DownloadProvider, or rename it to NetworkProvider, but this is fine for now.
        let client = reqwest::Client::new();
        let body = self.build_body(&query).expect("Failed to build body");
        dbg!(&body);
        let response = client
            .get(target)
            .json(&body)
            .header(CONTENT_TYPE, "application/json")
            .header(USER_AGENT, "VoidModManager/0.1.0 (+https://github.com/NotGhoull/Void-Mod-Manager)")
            .send().await.expect("Failed to send request"); // <- We error for now until we finish the API
        // TODO replace error
        let txt = response.text().await.expect("Failed to read response");
        let parsed: Value = serde_json::from_str(&txt).expect("Failed to create reader");

        let mods = parsed["data"].as_array().unwrap();
        let meta = parsed["meta"].as_object().unwrap();
        let mut modInfos: Vec<GenericMod> = Vec::new();

        for v in mods {
            modInfos.push(
                GenericMod {
                    name: v["name"].as_str().unwrap_or("error").to_owned(),
                    id: v["id"].as_i64().unwrap_or(0).to_string().to_owned(),
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

        // return modInfos;
        let r = DiscoveryResult {
            meta: DiscoveryMeta {
                provider_id: self.register(),
                game_id: 1.to_string(),
                pagination: PaginationMeta {
                    current: meta["current_page"].as_u64().unwrap_or(1),
                    page_size: meta["per_page"].as_u64().unwrap_or(50),
                    total_pages: Some(meta["last_page"].as_u64().unwrap_or(1)),
                    total_items: Some(meta["total"].as_u64().unwrap_or(50)),
                },
                applied_tags: vec![],
                available_tags: Some(vec![]),
            },
            mods: modInfos
        };
        // dbg!(&r);
        Ok(r)
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
                    id: v["id"].as_i64().unwrap_or(0).to_string().to_owned(),
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

    /// This should really be an Option<ModExtendedMetadata> since the service could go down or something
    async fn get_extended_mod(&self, id: &str) -> ModExtendedMetadata {
        let target = format!("https://api.modworkshop.net/mods/{}", id);
        // We should probably move the calling URL logic to DownloadProvider, or rename it to NetworkProvider, but this is fine for now.
        let client = reqwest::Client::new();
        let response = client
            .get(target)
            .header(USER_AGENT, "VoidModManager/0.1.0 (+https://github.com/NotGhoull/Void-Mod-Manager)")
            .send().await.expect("Failed to send request"); // <- We error for now until we finish the API
        // TODO replace error
        let txt = response.text().await.expect("Failed to read response");
        let parsed: Value = serde_json::from_str(&txt).expect("Failed to create reader");

        ModExtendedMetadata {
            header_image: match parsed["banner"]["file"].as_str() {
                Some(file) if !file.is_empty() => format!("https://storage.modworkshop.net/mods/images/{}", file),
                _ => "https://modworkshop.net/assets/default-banner.webp".to_owned()
            },
            caoursel_images: parsed["images"]
                .as_array()
                .unwrap_or(&vec![])
                .iter()
                .filter_map(|img| img["file"].as_str())
                .filter(|file| !file.is_empty())
                .map(|file| format!("https://storage.modworkshop.net/mods/images/{}", file))
                .collect(),
            version: parsed["version"].as_str().unwrap_or_default().to_owned(),
            installed: false,
            description: parsed["description"].as_str().unwrap_or_default().to_owned()
        }
    }

    fn configure(&self) -> &crate::traits::ModProviderFeatures {
        todo!("Configure")
    }

    fn register(&self) -> String {
        "core:modworkshop".into()
    }
}
