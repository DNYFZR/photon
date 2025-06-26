// Filesystem Operations
use std::{env, path::Path};

#[tauri::command]
pub fn get_cwd() -> String {
    let dir = env::current_dir();

    match dir {
        Ok(dir) => {
            if let Some(res) = dir.to_str() {
                return String::from(res);
            } else {
                return String::from("Error getting current directory");
            }
        },
        Err(e) => return e.to_string(),
    }
}

#[tauri::command]
pub fn set_cwd(path:&str) -> String {
    // Format path
    let path_formatted = path.replace("%USERPROFILE%", &env::var("USERPROFILE").unwrap());
    
    // Set CWD
    let dir = env::set_current_dir(Path::new(&path_formatted));

    match dir {
        Ok(_) => return String::from(format!("Directory updated : {}", path_formatted)),
        Err(e) => return e.to_string(),
    }
}

