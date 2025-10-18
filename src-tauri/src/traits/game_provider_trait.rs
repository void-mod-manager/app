use std::sync::Arc;

use serde::{Deserialize, Serialize};

use crate::traits::ModProvider;

pub enum GameProviderError {
    MissingBuilder(String),
    BuildFailed(String),
    InvalidModProviderId(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GameIcon {
    Path(String),
    InlineSvg(String),
    Bytes {
        #[serde(skip_serializing)] data: Arc<Vec<u8>>,
        mime: String,
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameMetadata {
    pub id: String,
    pub display_name: String,
    pub short_name: String,
    pub icon: GameIcon,
    pub provider_source: String, // Core | Plugin
}

#[async_trait::async_trait]
pub trait GameProvider: Send + Sync {
    fn game_id(&self) -> &str;
    fn mod_provider_id(&self) -> &str;
    fn metadata(&self) -> GameMetadata;
}
