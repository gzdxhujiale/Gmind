use notify::{Error as NotifyError, Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::mpsc::channel;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Serialize)]
pub struct MarkdownFile {
    pub name: String,
    pub path: String,
    pub content: String,
    #[serde(rename = "lastModified")]
    pub last_modified: u64,
}

pub struct WatcherState {
    pub watcher: Arc<Mutex<Option<RecommendedWatcher>>>,
}

#[derive(Clone, Serialize)]
struct FileChangedEvent {
    action: String,
    #[serde(rename = "filePath")]
    file_path: String,
}

#[tauri::command]
pub async fn read_markdown_files(folder_path: String) -> Result<Vec<MarkdownFile>, String> {
    let path = Path::new(&folder_path);

    if !path.exists() {
        return Err(format!(
            "The folder \"{}\" does not exist. It may have been moved or deleted.",
            folder_path
        ));
    }

    if !path.is_dir() {
        return Err(format!(
            "\"{}\" is not a folder. Please select a valid folder.",
            folder_path
        ));
    }

    let mut markdown_files = Vec::new();

    let entries = std::fs::read_dir(path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            format!("Permission denied reading folder \"{}\". Please check folder permissions.", folder_path)
        } else {
            format!("Unable to read folder contents: {}", e)
        }
    })?;

    for entry in entries.filter_map(Result::ok) {
        let file_path = entry.path();
        if file_path.is_file() {
            if let Some(ext) = file_path.extension() {
                if ext == "md" {
                    if let Ok(content) = std::fs::read_to_string(&file_path) {
                        let name = entry.file_name().to_string_lossy().to_string();
                        let path_str = file_path.to_string_lossy().to_string();
                        let last_modified = std::fs::metadata(&file_path)
                            .and_then(|m| m.modified())
                            .ok()
                            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                            .map(|d| d.as_millis() as u64)
                            .unwrap_or(0);

                        markdown_files.push(MarkdownFile {
                            name,
                            path: path_str,
                            content,
                            last_modified,
                        });
                    }
                }
            }
        }
    }

    if markdown_files.is_empty() {
        return Err(format!("No Markdown files (.md) found in \"{}\". Please select a folder containing .md files.", folder_path));
    }

    Ok(markdown_files)
}

#[tauri::command]
pub async fn read_file_content(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);
    std::fs::read_to_string(path).map_err(|e| {
         if e.kind() == std::io::ErrorKind::NotFound {
            format!("File not found: \"{}\". It may have been moved or deleted.", file_path)
        } else if e.kind() == std::io::ErrorKind::PermissionDenied {
            format!("Permission denied reading file: \"{}\". Please check file permissions.", file_path)
        } else {
            format!("Unable to read file \"{}\": {}", file_path, e)
        }
    })
}

#[tauri::command]
pub async fn save_file_content(file_path: String, content: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    std::fs::write(path, content).map_err(|e| {
        if e.kind() == std::io::ErrorKind::PermissionDenied {
            format!("Permission denied writing to file: \"{}\".", file_path)
        } else {
            format!("Unable to write to file \"{}\": {}", file_path, e)
        }
    })
}

#[tauri::command]
pub async fn watch_folder(
    folder_path: Option<String>,
    app_handle: AppHandle,
    state: State<'_, WatcherState>,
) -> Result<(), String> {
    let mut watcher_guard = state.watcher.lock().unwrap();

    // Stop existing watcher
    if let Some(_) = watcher_guard.take() {
        println!("Stopped existing watcher");
    }

    let folder_path = match folder_path {
        Some(path) if !path.trim().is_empty() => path,
        _ => return Ok(()),
    };

    println!("Starting watcher for: {}", folder_path);

    let (tx, rx) = channel::<()>();
    let app_handle_clone = app_handle.clone();
    
    // Create new watcher
    let mut watcher = notify::recommended_watcher(move |res: Result<Event, NotifyError>| {
        match res {
            Ok(event) => {
                let action = match event.kind {
                    notify::EventKind::Create(_) => "add",
                    notify::EventKind::Modify(_) => "change",
                    notify::EventKind::Remove(_) => "unlink",
                    _ => return, // Ignore other events
                };

                for path in event.paths {
                    if path.extension().map_or(false, |ext| ext == "md") {
                        let file_path = path.to_string_lossy().to_string();
                        let _ = app_handle_clone.emit(
                            "file-changed",
                            FileChangedEvent {
                                action: action.to_string(),
                                file_path,
                            },
                        );
                    }
                }
            }
            Err(e) => println!("watch error: {:?}", e),
        }
    })
    .map_err(|e| e.to_string())?;

    watcher
        .watch(Path::new(&folder_path), RecursiveMode::NonRecursive)
        .map_err(|e| e.to_string())?;

    *watcher_guard = Some(watcher);

    // Keep rx alive by spawning a dummy thread or similar if needed
    // The channel is mainly to satisfy the recommended_watcher API structure

    Ok(())
}
