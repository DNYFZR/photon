// Tauri App Configuration

// Modules
mod filesystem;
mod opsystem;
mod database;

// Components
use opsystem::{ get_cwd, set_cwd };
use filesystem::{ scan_fs, save_file, save_file_as };
use database::{ query, update, delete, };

// Configuration
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn app() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_cwd, set_cwd,
            scan_fs, save_file, save_file_as,
            query, update, delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
