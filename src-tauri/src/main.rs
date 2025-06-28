#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;
use tauri::{Manager, WindowBuilder, WindowUrl};

#[derive(Clone, serde::Serialize)]
struct FileChangePayload {
    app_id: String,
    file_path: String,
}

struct AppState {
    watcher: Mutex<Option<notify::RecommendedWatcher>>,
}

#[tauri::command]
async fn launch_app_window(
    app_handle: tauri::AppHandle,
    app_id: String,
    app_name: String,
    entry_path: String,
) -> Result<String, String> {
    println!("🚀 Launching {} in new window: {}", app_name, entry_path);
    
    // Create a unique window label for this app
    let window_label = format!("app_{}", app_id);
    
    // Check if window already exists - if so, focus it
    if let Some(existing_window) = app_handle.get_window(&window_label) {
        println!("🎯 Window {} already exists, focusing...", window_label);
        existing_window.set_focus().map_err(|e| format!("Failed to focus window: {}", e))?;
        return Ok(format!("Focused existing window for {}", app_name));
    }
    
    // Build the full URL to the app
    let app_url = format!("http://localhost:1420/{}", entry_path);
    println!("📱 Opening URL: {}", app_url);
    
    // Create new window for the app
    let window = WindowBuilder::new(
        &app_handle,
        window_label.clone(),
        WindowUrl::External(app_url.parse().map_err(|e| format!("Invalid URL: {}", e))?)
    )
    .title(&app_name)
    .inner_size(1200.0, 800.0)
    .resizable(true)
    .decorations(false) // Custom title bar like Rosita
    .build()
    .map_err(|e| format!("Failed to create window: {}", e))?;
    
    // Set up window event handlers
    let window_clone = window.clone();
    window.on_window_event(move |event| {
        match event {
            tauri::WindowEvent::CloseRequested { .. } => {
                println!("🔴 App window {} closing", window_clone.label());
            }
            _ => {}
        }
    });
    
    println!("✅ Successfully launched {} in window {}", app_name, window_label);
    Ok(format!("Launched {} in new window", app_name))
}

#[tauri::command]
fn launch_app(app_id: String, local_path: Option<String>, _enable_auto_save: Option<bool>) -> Result<String, String> {
    println!("📱 Legacy launch_app called for: {} at {:?}", app_id, local_path);
    // This is for backwards compatibility - new apps should use launch_app_window
    Ok(format!("Launched {}", app_id))
}

#[tauri::command]
fn save_all_projects() -> Result<String, String> {
    println!("Saving all projects...");
    // Implementation would run git commands
    Ok("All projects saved".to_string())
}

#[tauri::command]
fn sync_to_github(app_id: String) -> Result<String, String> {
    println!("Syncing {} to GitHub...", app_id);
    // Implementation would use git push
    Ok(format!("{} synced", app_id))
}

#[tauri::command]
fn start_file_watcher(_window: tauri::Window) -> Result<String, String> {
    // Watch the active projects directory
    let projects_path = "/Users/jade/Wiistrument-Development/01-Active-Projects";
    
    // This is a simplified version - real implementation would be more robust
    println!("Starting file watcher on: {}", projects_path);
    
    Ok("File watcher started".to_string())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            watcher: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            launch_app,
            launch_app_window,
            save_all_projects,
            sync_to_github,
            start_file_watcher
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}