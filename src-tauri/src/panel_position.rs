use serde::{Deserialize, Serialize};
use tauri::{Manager, PhysicalPosition, Position};
use tauri_plugin_store::StoreExt;

const MAIN_WINDOW_LABEL: &str = "main";
const PANEL_POSITION_STORE_KEY: &str = "panelPosition";

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoredPanelPosition {
    x: i32,
    y: i32,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct PhysicalWindowSize {
    width: u32,
    height: u32,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct MonitorBounds {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

impl MonitorBounds {
    fn from_monitor(monitor: &tauri::Monitor) -> Self {
        let work_area = monitor.work_area();
        Self {
            x: work_area.position.x,
            y: work_area.position.y,
            width: work_area.size.width,
            height: work_area.size.height,
        }
    }

    fn contains_position(self, position: StoredPanelPosition) -> bool {
        let x = i64::from(position.x);
        let y = i64::from(position.y);
        let min_x = i64::from(self.x);
        let min_y = i64::from(self.y);
        x >= min_x
            && x < min_x + i64::from(self.width)
            && y >= min_y
            && y < min_y + i64::from(self.height)
    }
}

pub fn persist_panel_position_from_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if window.label() != MAIN_WINDOW_LABEL {
        return;
    }

    let tauri::WindowEvent::Moved(position) = event else {
        return;
    };

    save_stored_position(
        window.app_handle(),
        StoredPanelPosition {
            x: position.x,
            y: position.y,
        },
    );
}

pub fn apply_stored_position(app_handle: &tauri::AppHandle) -> bool {
    let Some(position) = read_stored_position(app_handle) else {
        return false;
    };

    let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) else {
        log::error!("main webview window not found");
        return false;
    };

    let window_size = match window.outer_size() {
        Ok(size) => PhysicalWindowSize {
            width: size.width,
            height: size.height,
        },
        Err(error) => {
            log::warn!("failed to read panel window size: {}", error);
            return false;
        }
    };

    let target = clamp_position_for_window(&window, position, window_size);
    if let Err(error) = window.set_position(Position::Physical(PhysicalPosition::new(
        target.x, target.y,
    ))) {
        log::warn!("failed to restore panel position: {}", error);
        return false;
    }

    if target != position {
        save_stored_position(app_handle, target);
    }

    true
}

fn read_stored_position(app_handle: &tauri::AppHandle) -> Option<StoredPanelPosition> {
    let store = match app_handle.store("settings.json") {
        Ok(store) => store,
        Err(error) => {
            log::warn!(
                "failed to open settings store for panel position: {}",
                error
            );
            return None;
        }
    };

    let value = store.get(PANEL_POSITION_STORE_KEY)?;
    match serde_json::from_value::<StoredPanelPosition>(value.clone()) {
        Ok(position) => Some(position),
        Err(error) => {
            log::warn!("ignored invalid stored panel position: {}", error);
            None
        }
    }
}

fn save_stored_position(app_handle: &tauri::AppHandle, position: StoredPanelPosition) {
    let store = match app_handle.store("settings.json") {
        Ok(store) => store,
        Err(error) => {
            log::warn!(
                "failed to open settings store for panel position: {}",
                error
            );
            return;
        }
    };

    store.set(PANEL_POSITION_STORE_KEY, serde_json::json!(position));
    if let Err(error) = store.save() {
        log::warn!("failed to save panel position: {}", error);
    }
}

fn clamp_position_for_window(
    window: &tauri::WebviewWindow,
    position: StoredPanelPosition,
    window_size: PhysicalWindowSize,
) -> StoredPanelPosition {
    let monitors = match window.available_monitors() {
        Ok(monitors) => monitors,
        Err(error) => {
            log::warn!(
                "failed to read monitors for panel position clamp: {}",
                error
            );
            return position;
        }
    };

    let bounds = monitors
        .iter()
        .map(MonitorBounds::from_monitor)
        .find(|bounds| bounds.contains_position(position))
        .or_else(|| {
            window
                .primary_monitor()
                .ok()
                .flatten()
                .map(|monitor| MonitorBounds::from_monitor(&monitor))
        })
        .or_else(|| monitors.first().map(MonitorBounds::from_monitor));

    match bounds {
        Some(bounds) => clamp_position_to_bounds(position, window_size, bounds),
        None => position,
    }
}

fn clamp_position_to_bounds(
    position: StoredPanelPosition,
    window_size: PhysicalWindowSize,
    bounds: MonitorBounds,
) -> StoredPanelPosition {
    StoredPanelPosition {
        x: clamp_axis(position.x, bounds.x, bounds.width, window_size.width),
        y: clamp_axis(position.y, bounds.y, bounds.height, window_size.height),
    }
}

fn clamp_axis(value: i32, min: i32, bounds_size: u32, window_size: u32) -> i32 {
    let min = i64::from(min);
    let max = if bounds_size > window_size {
        min + i64::from(bounds_size - window_size)
    } else {
        min
    };

    i64::from(value).clamp(min, max) as i32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn clamps_position_inside_bounds() {
        let result = clamp_position_to_bounds(
            StoredPanelPosition { x: 1900, y: 1100 },
            PhysicalWindowSize {
                width: 400,
                height: 500,
            },
            MonitorBounds {
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
            },
        );

        assert_eq!(result, StoredPanelPosition { x: 1520, y: 580 });
    }

    #[test]
    fn allows_negative_monitor_origins() {
        let result = clamp_position_to_bounds(
            StoredPanelPosition { x: -2500, y: -200 },
            PhysicalWindowSize {
                width: 400,
                height: 500,
            },
            MonitorBounds {
                x: -1920,
                y: -300,
                width: 1920,
                height: 1080,
            },
        );

        assert_eq!(result, StoredPanelPosition { x: -1920, y: -200 });
    }
}
