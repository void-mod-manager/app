use std::{sync::Arc, time::Duration};
use log::info;
use reqwest::header::{CONTENT_TYPE, USER_AGENT};
use serde_json::{json, Value};
use reqwest::Url;
use tracing::trace;
use crate::{core::ProviderApi, traits::{DiscoveryError, DiscoveryMeta, DiscoveryQuery, DiscoveryResult, ModExtendedMetadata, ModProvider, ModSummary, PaginationMeta, SortOrder}};


pub struct ModWorkShopProvider {
    api: Arc<dyn ProviderApi>
}

impl ModWorkShopProvider {
    pub fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self { api }
    }

    // TODO
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
        let game = self.api.context()
            .get_game_provider(&query.game_id)
            .map_err(|e| DiscoveryError::InvalidQuery(format!("ID {} not loaded", query.game_id)))?;
        let game_id = game.get_external_id();

        let base = format!("https://api.modworkshop.net/games/{}/mods", game_id);
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

    // TODO, since modworkshop uses a mix of both body and URL parameters (according to their docs)
    fn build_body(&self, query: &DiscoveryQuery) -> Result<Value, DiscoveryError> {
        // TODO: harcoded
        let id = json!(1);
        let mut root = json!({ "game_id": id });
        let obj = root.as_object_mut().expect("Root must be an object");

        if let Some(page) = query.page {
            obj.insert("page".into(), json!(page));
        }

        Ok(root)
    }

}

#[async_trait::async_trait]
impl ModProvider for ModWorkShopProvider {

    async fn discover(&self, query: &DiscoveryQuery) -> Result<DiscoveryResult, DiscoveryError> {
        let target = self.build_url(&query)?;
        dbg!(&target);
        let body = self.build_body(&query).expect("Failed to build body");

        // We should probably move the calling URL logic to DownloadProvider, or rename it to NetworkProvider, but this is fine for now.
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| DiscoveryError::Internal(e.to_string()))?;

        let response = client
            .get(target)
            .json(&body)
            .header(CONTENT_TYPE, "application/json")
            .header(USER_AGENT, "VoidModManager/0.1.0 (+https://github.com/NotGhoull/Void-Mod-Manager)")
            .send()
            .await
            .map_err(|e| DiscoveryError::Network(e.to_string()))?;


        let txt = response
            .text()
            .await
            .map_err(|e| DiscoveryError::Network(e.to_string()))?;

        let parsed: Value = serde_json::from_str(&txt).map_err(|e| DiscoveryError::Internal(e.to_string()))?;

        let mods = parsed["data"]
            .as_array()
            .ok_or_else(|| DiscoveryError::Internal("Malformed response: Missing data[]".into()))?;

        let meta = parsed["meta"]
            .as_object()
            .ok_or_else(|| DiscoveryError::Internal("malformed response: Missing meta{}".into()))?;

        let mut mod_infos: Vec<ModSummary> = Vec::new();

        for v in mods {
            mod_infos.push(
                ModSummary {
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
                    user_avatar: match v["user"]["avatar"].as_str() {
                        Some(avatar) if avatar.starts_with("http://") || avatar.starts_with("https://") => avatar.to_owned(),
                        Some(avatar) => format!("https://storage.modworkshop.net/users/images/{}", avatar),
                        _ => "error".to_owned(),
                    },
                    tags: v["tags"].as_array().unwrap_or(&vec![])
                        .iter()
                        .filter_map(|tag| tag["name"].as_str().map(|s| s.to_string()))
                        .collect()
                }
            );
        }

        // return modInfos;
        let r = DiscoveryResult {
            meta: DiscoveryMeta {
                provider_id: self.register(),
                game_id: query.game_id.clone(),
                pagination: PaginationMeta {
                    current: meta["current_page"].as_u64().unwrap_or(1),
                    page_size: meta["per_page"].as_u64().unwrap_or(50),
                    total_pages: Some(meta["last_page"].as_u64().unwrap_or(1)),
                    total_items: Some(meta["total"].as_u64().unwrap_or(50)),
                },
                applied_tags: vec![],
                available_tags: Some(vec![]),
            },
            mods: mod_infos
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
                    trace!("Progress {}", p);
                }
                Completed(p) => return Completed(p.clone()),
                Failed(e) => return Failed(e.clone()),
                Cancelled => return Cancelled,
                _ => {}
            }
        }
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
            carousel_images: parsed["images"]
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
