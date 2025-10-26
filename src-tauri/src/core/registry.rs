use std::sync::Arc;
use log::trace;
use serde::{Deserialize, Serialize};
use crate::traits::{GameProvider, ModProvider};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ProviderSource {
    Core,
    Plugin(String) // plugin ID/name
}

pub struct ProviderEntry {
    pub id: String,
    pub source: ProviderSource,
    pub provider: Arc<dyn ModProvider>
}

#[derive(thiserror::Error, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum RegistryError {
    #[error("Invalid id: {0}")]
    InvalidId(String),
    #[error("Duplicate provider id: {0}")]
    ProviderAlreadyExists(String),
    #[error("Duplicate game provider: {0}")]
    GameAlreadyExists(String),
    #[error("Cannot use reserved identifier \"core\" for non core implementations ({0})")]
    ReservedCoreId(String),
    #[error("Cannot find id {0}")]
    NotFound(String)
}

pub fn normalize_id(raw: &str) -> Result<String, RegistryError> {
    let s = raw.trim().to_lowercase();
    if s.is_empty() || s.len() > 200 {
        return Err(RegistryError::InvalidId(format!("ID \"{}\" is invalid.", raw.to_owned())));
    }

    let mut seen_colon = false;
    for (i, ch) in s.chars().enumerate() {
        match ch {
            'a'..='z' | '0'..='9' | '.' | '_' | '-' => {}
            ':' if !seen_colon && i > 0 && i < s.len() - 1 => {
                seen_colon = true;
            }
            _ => return Err(RegistryError::InvalidId(format!("ID: \"{}\" contains invalid character \"{}\" at position {}",raw.to_owned(), ch, i))),
        }
    }

    trace!("Normalized Id! {}", {&s});
    Ok(s)
}

pub struct GameEntry {
    pub id: String,
    pub source: ProviderSource,
    pub game: Arc<dyn GameProvider + Send + Sync>,
    pub required_provider_id: String,
}
