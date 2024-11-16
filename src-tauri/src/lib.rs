// Tauri App Configuration

// Modules
mod filesystem;

// Components
use filesystem::{ get_cwd, set_cwd, scan_path, save_file, save_file_as };


// Configuration
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_cwd,
            set_cwd,
            scan_path,
            save_file,
            save_file_as,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
