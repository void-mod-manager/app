use std::sync::Arc;

use crate::core::ProviderApi;

// Temporary location
#[derive(Default, Debug)]
pub struct ModProviderFeatures {
    pub supports_endorsements: bool,
    pub requires_api_token: bool,
    pub mod_multi_file: bool, // <- Mods have more than one file that could be downloaded at a time, NexusMods
}

// Temporary location
pub enum ModDownloadResult {
    Failed(String), // An optional error message
    InProgress(u8), // Should be between 1 and 100, we don't need more than a u8 tho
    Completed,
    Cancelled,
     // This would be if the user is missing permisisons or something
    CannotComplete(String)
}

pub trait ModProvider {
    fn new(api: Arc<dyn ProviderApi>) -> Self;

    // Due to how this might be made, we may need a
    // `start_download` and a `tick_download` or `query_download`
    // since we're doing mutlithreading, and I don't think we can have a
    // "streamed" like return where it changes its return independently
    async fn download_mod(&self, mod_id: String) -> ModDownloadResult;

    // This is where we setup the plugin, here we'd end up returning:
    //  - The capabilities of the provider (ModProviderFeatures)
    //  - Plugin version
    //  - Plugin Author
    // We'd probably consolodate this into a ModProviderConfiguration
    fn configure(&self) -> &ModProviderFeatures;

    fn register(&self) -> String {
        todo!("Here, we'd register the games for the provider");
    }

    fn optional() -> String {
        log::warn!("Optional called, but not overriden");
        String::from("Optional")
    }
}
