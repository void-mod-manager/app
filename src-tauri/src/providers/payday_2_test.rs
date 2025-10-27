use std::path::{Path, PathBuf};

use tracing::{debug, info};

use crate::{core::{ArchiveInfo, determine_root_dir, ensure_dir, extract_zip, inspect_zip, replace_symlink_dir}, traits::{GameIcon, GameMetadata, GameProvider}};
use anyhow::{Result, anyhow};

pub struct Payday2Provider {

}

#[derive(Debug)]
enum ModKind {
    Lua,
    Override
}


impl Payday2Provider {
    pub fn new() -> Self {
        Self {}
    }

    fn install_path(&self) -> PathBuf {
        // Here we'd change it to use the steam implementation
        PathBuf::from("/home/<user>/.local/share/Steam/steamapps/common/PAYDAY 2/")
    }

    fn mods_folder(&self, base: &Path) -> PathBuf {
        base.join("mods")
    }

    fn overrides_folder(&self, base: &Path) -> PathBuf {
        base.join("assets").join("mod_overrides")
    }

    fn classify(info: &ArchiveInfo) -> ModKind {
        if info.count_ext("lua") > 1 {
            ModKind::Lua
        } else {
            ModKind::Override
        }
    }

}

#[async_trait::async_trait]
impl GameProvider for Payday2Provider {
    fn game_id(&self) ->  &str { "core:payday_2" }

    fn mod_provider_id(&self) ->  &str { "core:modworkshop" }

    fn metadata(&self) -> GameMetadata {
        GameMetadata {
            id: self.game_id().into(),
            display_name: "PAYDAY 2".into(),
            short_name: "PD2".into(),
            icon: GameIcon::Path("https://cdn2.steamgriddb.com/icon/fa6d3cc166fbfbf005c9e77d96cba283/32/256x256.png".into()),
            provider_source: "core".into()
        }
    }

    fn get_external_id(&self) -> &str { "1" }

    fn install_mod(&self, target: &PathBuf) -> Result<()> {
        info!("Starting mod installation for {:?}", target);

        // Ideally, this should be detected automatically (e.g., via Steam library detection)
        let game_install_path = self.install_path();
        debug!("Game install path: {:?}", game_install_path);

        let mod_folder = self.mods_folder(&game_install_path);
        let mod_asset_folder = self.overrides_folder(&game_install_path);

        debug!("Ensuring mod folder exists: {:?}", mod_folder);
        ensure_dir(&mod_folder)?;
        debug!("Ensuring mod asset folder exists: {:?}", mod_asset_folder);
        ensure_dir(&mod_asset_folder)?;

        info!("Inspecting zip archive: {:?}", target);
        let info = inspect_zip(&target)?;
        let inspected_root = info.single_top_level_dir();
        debug!("Inspected root: {:?}", inspected_root);

        let raw_name = inspected_root.as_ref()
            .and_then(|p| p.file_name().map(|s| s.to_owned()))
            .unwrap_or_else(|| std::ffi::OsString::from(
                target.file_stem().unwrap_or_default()
            ));

        debug!("Raw mod name: {:?}", raw_name);

        let extracted_root = dirs::data_local_dir()
            .ok_or_else(|| anyhow!("cannot resolve local data dir"))?
            .join("me.ghoul.void_mod_manager")
            .join("mods")
            .join("extracted")
            .join(self.game_id())
            .join(&raw_name);

        debug!("Extracted root path: {:?}", extracted_root);

        let staging = extracted_root.with_extension("staging");
        debug!("Staging path: {:?}", staging);

        if staging.exists() {
            info!("Removing existing staging directory: {:?}", staging);
            std::fs::remove_dir_all(&staging)?;
        }
        if extracted_root.exists() {
            debug!("Extracted root already exists, will keep until success: {:?}", extracted_root);
            // Keep until success
        }

        info!("Extracting zip to staging directory...");
        let extracted_info = extract_zip(target, &staging)?;

        let mod_kind = Self::classify(&extracted_info);
        info!("Classified mod kind: {:?}", mod_kind);

        if extracted_root.exists() {
            info!("Removing previous extracted root: {:?}", extracted_root);
            std::fs::remove_dir_all(&extracted_root)?;
        }
        info!("Renaming staging directory to extracted root...");
        std::fs::rename(&staging, &extracted_root)?;

        let resolved_root = determine_root_dir(&extracted_info, &extracted_root);
        let root_dir = if resolved_root.is_dir() { resolved_root } else { extracted_root };

        let dest_path = match mod_kind {
            ModKind::Lua => mod_folder.join(&raw_name),
            ModKind::Override => mod_asset_folder.join(&raw_name),
        };

        info!("Replacing symlink directory: {:?} -> {:?}", root_dir, dest_path);
        replace_symlink_dir(&root_dir, &dest_path)?;

        info!("Mod installation completed successfully for {:?}", target);
        return Ok(());
    }

}
