use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Relevance,
    Downloads,
    Views,
    Likes,
    Newest,
    Updated
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryQuery {
    pub game_id: String,
    pub page: Option<u32>,
    pub page_size: Option<u32>,
    pub search: Option<String>,
    pub tags: Option<Vec<String>>,
    pub sort: Option<SortOrder>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationMeta {
    pub current: u64,
    pub page_size: u64,
    pub total_pages: Option<u64>,
    pub total_items: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryMeta {
    pub provider_id: String,
    pub game_id: String,
    pub pagination: PaginationMeta,
    pub applied_tags: Vec<String>,
    pub available_tags: Option<Vec<Tag>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveryResult {
    pub meta: DiscoveryMeta,
    pub mods: Vec<ModSummary>
}

#[derive(thiserror::Error, Debug, Clone, Serialize, Deserialize)]
pub enum DiscoveryError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Invalid query: {0}")]
    InvalidQuery(String),
    #[error("The required provider is unavailable")]
    ProviderUnavailable,
    #[error("Internal error: {0}")]
    Internal(String)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModSummary {
    pub id: String,
    pub name: String,
    pub description: String,
    pub short_description: String,
    pub downloads: u64,
    pub views: u64,
    pub likes: u64,
    pub thumbnail_image: String,

    // For now
    pub tags: Vec<String>,

    // TODO: Make this authors and use a modAuthors vec
    pub user_name: String,
    pub user_avatar: String,
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
    pub carousel_images: Vec<String>,
    pub version: String,
    pub installed: bool,
    pub description: String,
}
