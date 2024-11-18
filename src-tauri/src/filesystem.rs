// Filesystem Operations
use std::fs;
use std::io::{BufRead, Write};
use std::env;
use std::path::Path;

// System Navigation

#[tauri::command]
pub fn scan_path(path:&str) -> Vec<String> {
    // return a vector containing the contents of a directory or file
    let path_meta = fs::metadata(path);
    
    match path_meta {
        Ok(path_meta) => {
            if path_meta.is_dir() {
                return list_dir(path);
            }

            return read_file(path);
        },
        Err(e) => vec![String::from("error"), e.to_string()],
        
    }   
}

fn read_file(path:&str) -> Vec<String> {
    let file = fs::read(path);
    match file {
        Ok(res) => { 
            let res_str = res.lines().map(
                |x| x.unwrap_or(String::from("unsupported file type"))
                ).collect::<Vec<String>>();
            
            if res_str[0] == "unsupported file type" {
                return vec![String::from("Unsupported file type"), ];
            } else {
                return res_str;
            }
        },
        Err(e) => {
            return vec![String::from(format!("File not found : {}", e)),]
        },
    }
}

fn list_dir(path:&str) -> Vec<String> {
    // list files & sub-directories for path 
    let entries = fs::read_dir(path);

    match entries {
        Ok(res) => {
            let files = res.filter_map(|entry| {
                let path = entry.ok()?.path();
                if path.is_file() || path.is_dir() {
                    path.file_name()?.to_str().map(|s| s.to_owned())
                } else {
                    None
                }
            }).collect();
        
            return files;
        },
        Err(e) => {return vec![String::from("error"), e.to_string(), ];},
    }
}

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

// File Saving

#[tauri::command]
pub fn save_file_as(path:&str, data:&str) -> String  {
    // Save data to file on path, if path is available & not currently occupied 
    let check_exists = fs::exists(path);

    match check_exists {
        // File exists
        Ok(true) => return String::from(format!("Cannot save as, file already exists on path : {}", path)),
        
        // File doesn't exist & path accessible
        Ok(false) => {
            return save_file(path, data);
        },

        // Path inaccessible
        Err(e) => return String::from(format!("Could not verify status of path : {}", e)),
    }
}

#[tauri::command]
pub fn save_file(path:&str, data:&str) -> String {
    // Create new file
    match fs::File::create(path) {
        // Try to write bytes data
        Ok(mut new_file) => {
            match new_file.write_all(data.as_bytes()) {
                Ok(_) => return String::from(format!("File saved to path : {}", path)),
                // Handle errors
                Err(e) => return String::from(format!("Error saving to path : {}", e)),
             }
        },
        Err(e) => return String::from(format!("Error creating file : {}", e)), 
    }
}

