use std::{collections::{HashMap, HashSet}, fs::{self, File}, path::{Path, PathBuf}};

use anyhow::{Context, Result};
use tracing_subscriber::fmt::format;
use zip::ZipArchive;

#[derive(Debug, Clone, Default)]
pub struct ArchiveInfo {
    pub files: Vec<PathBuf>,
    pub top_level_dirs: HashSet<PathBuf>,
    pub file_counts_by_extension: HashMap<String, usize>,
    pub total_files: usize,
}

impl ArchiveInfo {
    pub fn count_ext(&self, ext: &str) -> usize {
        self.file_counts_by_extension
            .get(&ext.to_ascii_lowercase())
            .copied()
            .unwrap_or(0)
    }

    pub fn single_top_level_dir(&self) -> Option<PathBuf> {
        if self.top_level_dirs.len() == 1 {
            self.top_level_dirs.iter().next().cloned()
        } else {
            None
        }
    }
}

pub fn inspect_zip(path: &Path) -> Result<ArchiveInfo> {
    let file = File::open(path).with_context(|| format!("opening archive {}", path.display()))?;
    let mut zip = ZipArchive::new(file).context("reading zip central directory")?;

    let mut files = Vec::new();
    let mut top_level_dirs: HashSet<PathBuf> = HashSet::new();
    let mut extension_counts: HashMap<String, usize> = HashMap::new();

    for i in 0..zip.len() {
        let entry = zip.by_index(i)
            .with_context(|| format!("access zip entry index {}", i))?;
        let enclosed = entry.enclosed_name()
            .context("zip entry had invalid (non-enclosed_ name")?;

        if let Some(first) = enclosed.components().next() {
            top_level_dirs.insert(PathBuf::from(first.as_os_str()));
        }

        if !entry.is_dir() {
            let path_buf = PathBuf::from(enclosed);
            if let Some(ext) = path_buf.extension().and_then(|e| e.to_str()) {
                *extension_counts.entry(ext.to_ascii_lowercase()).or_insert(0) += 1;
            }
            files.push(path_buf);
        }
    }

    Ok(ArchiveInfo {
        files,
        top_level_dirs,
        file_counts_by_extension: extension_counts,
        total_files: zip.len()
    })
}

pub fn extract_zip(path: &Path, dest: &Path) -> Result<ArchiveInfo> {
    let file = File::open(path).with_context(|| format!("opening archive {}", path.display()))?;
    let mut zip = ZipArchive::new(file).context("reading zip file")?;

    ensure_dir(dest)?;
    let mut info = ArchiveInfo::default();

    for i in 0..zip.len() {
        let mut entry = zip.by_index(i)
            .with_context(|| format!("accessing zip entry index {}", i))?;
        let enclosed = entry.enclosed_name()
            .context("zip entry had invalid (non-enclosed) name")?;

        if let Some(first) = enclosed.components().next() {
            info.top_level_dirs.insert(PathBuf::from(first.as_os_str()));
        }

        let out_path = dest.join(enclosed);
        if entry.is_dir() {
            ensure_dir(&out_path)?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            ensure_dir(parent)?;
        }

        {
            let mut f = File::create(&out_path)
                .with_context(|| format!("creating {}", out_path.display()))?;
            std::io::copy(&mut entry, &mut f)
                .with_context(|| format!("extracting {}", out_path.display()))?;
        }

        if let Some(ext) = out_path.extension().and_then(|e| e.to_str()) {
            *info.file_counts_by_extension.entry(ext.to_ascii_lowercase()).or_insert(0) += 1;
        }

        #[cfg(unix)]
        if let Some(mode) = entry.unix_mode() {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(&out_path, fs::Permissions::from_mode(mode))
                .with_context(|| format!("setting permissions on {}", out_path.display()))?;
        }

        info.files.push(out_path.strip_prefix(dest).unwrap().to_path_buf());
    }

    Ok(info)
}

pub fn determine_root_dir(info: &ArchiveInfo, extraction_root: &Path) -> PathBuf {
    if let Some(dir) = info.single_top_level_dir() {
        let candidate = extraction_root.join(&dir);
        if candidate.is_dir() {
            return candidate;
        }
    }
    extraction_root.to_path_buf()
}

pub fn ensure_dir(path: &Path) -> Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)
            .with_context(|| format!("creating directory {}", path.display()))?;
    }
    Ok(())
}

pub fn replace_symlink_dir(src: &Path, dest: &Path) -> Result<()> {
    if dest.exists() {
        // Remove directory OR symlink
        std::fs::remove_dir_all(dest)
            .with_context(|| format!("removing previous destination {}", dest.display()))?;
    }
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(src, dest)
            .with_context(|| format!("creating unix symlink {} -> {}", src.display(), dest.display()))
    }
    #[cfg(windows)]
    {
        std::os::windows::fs::symlink_dir(src, dest)
            .with_context(|| format!("creating windows symlink {} -> {}", src.display(), dest.display()))
    }
}
