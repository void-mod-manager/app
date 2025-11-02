use std::path::{Path, PathBuf};

use std::fs;
use tracing::{debug, info, instrument};

use crate::{core::{ArchiveInfo, determine_root_dir, ensure_dir, extract_zip, inspect_zip, replace_symlink_dir}, traits::{GameIcon, GameMetadata, GameProvider}};
use anyhow::{Context, Result, anyhow};

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

    fn resolve_install_path(&self) -> Option<PathBuf> {
        let steam_dir = steamlocate::SteamDir::locate().ok()?;
        let app_id = 218_620; // PAYDAY 2 app ID
        let (game, lib) = steam_dir.find_app(app_id).ok()??;
        Some(lib.resolve_app_dir(&game))
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

    #[instrument(skip(self, target))]
    fn install_mod(&self, target: &PathBuf) -> Result<()> {
        info!(mod_path = %target.display(), "Starting mod installation");

        // Ideally, this should be detected automatically (e.g., via Steam library detection)
        let game_install_path = self.resolve_install_path()
            .context("Failed to resolve game install path")?;

        debug!(game_install_path = %game_install_path.display(), "Game install path resolved");

        let mod_folder = self.mods_folder(&game_install_path);
        let mod_asset_folder = self.overrides_folder(&game_install_path);

        // Ensure mod and asset folders exist
        ensure_dir(&mod_folder).context("Failed to create mod folder")?;
        ensure_dir(&mod_asset_folder).context("Failed to create mod asset folder")?;

        info!(mod_path = %target.display(), "Inspecting zip archive");
        let info = inspect_zip(&target).context("Failed to inspect zip archive")?;
        let inspected_root = info.single_top_level_dir();
        debug!(
            inspected_root = %inspected_root
                .as_deref()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|| "None".to_string()),
            "Zip archive inspection result"
        );

        let raw_name = inspected_root
            .as_ref()
            .and_then(|p| p.file_name().map(|s| s.to_owned()))
            .unwrap_or_else(|| target.file_stem().unwrap_or_default().to_os_string());

        debug!(raw_name = %raw_name.to_string_lossy(), "Extracted raw mod name");

        let extracted_root = dirs::data_local_dir()
            .ok_or_else(|| anyhow::anyhow!("Cannot resolve local data dir"))?
            .join("me.ghoul.void_mod_manager")
            .join("mods")
            .join("extracted")
            .join(self.game_id())
            .join(&raw_name);

        debug!(extracted_root = %extracted_root.display(), "Calculated extracted root path");

        let staging = extracted_root.with_extension("staging");
        debug!(staging_path = %staging.display(), "Staging path resolved");

        // Clean up old staging directory if it exists
        if staging.exists() {
            info!(staging_path = %staging.display(), "Removing existing staging directory");
            fs::remove_dir_all(&staging).context("Failed to remove staging directory")?;
        }

        if extracted_root.exists() {
            debug!(extracted_root = %extracted_root.display(), "Keeping previous extracted root until success");
        }

        // Extract the mod
        info!(mod_path = %target.display(), "Extracting zip to staging directory...");
        let extracted_info = extract_zip(target, &staging).context("Failed to extract zip archive")?;

        let mod_kind = Self::classify(&extracted_info);
        info!(mod_kind = ?mod_kind, "Classified mod kind");

        // Remove previous extracted root and rename the staging directory to the extracted root
        if extracted_root.exists() {
            info!(extracted_root = %extracted_root.display(), "Removing previous extracted root");
            fs::remove_dir_all(&extracted_root).context("Failed to remove previous extracted root")?;
        }

        info!(extracted_root = %extracted_root.display(), "Renaming staging directory to extracted root");
        fs::rename(&staging, &extracted_root)
            .context("Failed to rename staging directory to extracted root")?;

        // Determine the root directory and resolve the destination path
        let resolved_root = determine_root_dir(&extracted_info, &extracted_root);
        let root_dir = if resolved_root.is_dir() { resolved_root } else { extracted_root.clone() };

        let dest_path = match mod_kind {
            ModKind::Lua => mod_folder.join(&raw_name),
            ModKind::Override => mod_asset_folder.join(&raw_name),
        };

        info!(root_dir = %root_dir.display(), dest_path = %dest_path.display(), "Replacing symlink directory");
        replace_symlink_dir(&root_dir, &dest_path)
            .context("Failed to replace symlink directory")?;

        info!(mod_path = %target.display(), "Mod installation completed successfully");
        Ok(())
    }

}
