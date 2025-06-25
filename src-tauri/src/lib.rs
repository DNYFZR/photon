// Tauri App Configuration

// Modules
mod filesystem;

// Components
use filesystem::{ get_cwd, set_cwd, scan_path, scan_fs, save_file, save_file_as, is_dir };


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
            scan_fs,
            save_file,
            save_file_as,
            is_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
