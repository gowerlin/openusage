/// WebView2 can report a blur/focus flip while the panel is being shown, so a blur is
/// only acted on if the panel still does not own the foreground after this delay.
#[cfg(windows)]
const BLUR_CONFIRM_DELAY: std::time::Duration = std::time::Duration::from_millis(150);

/// Pressing the tray icon blurs (and hides) the panel before the click arrives; a tray
/// click this soon after a blur-hide means "close", not "open again".
const TRAY_REOPEN_DEBOUNCE: std::time::Duration = std::time::Duration::from_millis(500);

fn should_hide_after_blur(visible: bool, panel_owns_foreground: bool) -> bool {
    visible && !panel_owns_foreground
}

fn is_recent_blur_hide(
    last_blur_hide: Option<std::time::Instant>,
    now: std::time::Instant,
) -> bool {
    last_blur_hide.is_some_and(|at| now.saturating_duration_since(at) < TRAY_REOPEN_DEBOUNCE)
}

#[cfg(windows)]
pub use blur::take_recent_blur_hide;

#[cfg(windows)]
pub fn hide_on_blur(window: &tauri::Window, event: &tauri::WindowEvent) {
    use tauri::Manager;

    if window.label() != "main" || !matches!(event, tauri::WindowEvent::Focused(false)) {
        return;
    }
    let app_handle = window.app_handle().clone();
    std::thread::spawn(move || {
        std::thread::sleep(BLUR_CONFIRM_DELAY);
        let handle = app_handle.clone();
        let result = app_handle.run_on_main_thread(move || {
            let Some(window) = crate::panel::main_window(&handle) else {
                return;
            };
            let visible = window.is_visible().unwrap_or(false);
            if should_hide_after_blur(visible, blur::panel_owns_foreground(&window)) {
                log::debug!("panel lost focus; hiding");
                blur::record_blur_hide();
                crate::panel::hide_panel(&handle);
            }
        });
        if let Err(error) = result {
            log::error!("failed to schedule blur-hide: {}", error);
        }
    });
}

#[cfg(windows)]
mod blur {
    use std::sync::Mutex;
    use std::time::Instant;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::WindowsAndMessaging::{GA_ROOTOWNER, GetAncestor, GetForegroundWindow};

    static LAST_BLUR_HIDE: Mutex<Option<Instant>> = Mutex::new(None);

    pub fn record_blur_hide() {
        if let Ok(mut last) = LAST_BLUR_HIDE.lock() {
            *last = Some(Instant::now());
        }
    }

    pub fn take_recent_blur_hide() -> bool {
        let Ok(mut last) = LAST_BLUR_HIDE.lock() else {
            return false;
        };
        super::is_recent_blur_hide(last.take(), Instant::now())
    }

    /// True when the foreground window is the panel or a popup it owns.
    pub fn panel_owns_foreground(window: &tauri::WebviewWindow) -> bool {
        let panel = match window.hwnd() {
            Ok(hwnd) => HWND(hwnd.0),
            Err(error) => {
                log::error!("failed to read main window handle: {}", error);
                return true;
            }
        };
        let foreground = unsafe { GetForegroundWindow() };
        if foreground.is_invalid() {
            return false;
        }
        foreground == panel || unsafe { GetAncestor(foreground, GA_ROOTOWNER) } == panel
    }
}

#[cfg(test)]
mod tests {
    use super::{TRAY_REOPEN_DEBOUNCE, is_recent_blur_hide, should_hide_after_blur};
    use std::time::{Duration, Instant};

    #[test]
    fn blur_hides_visible_panel_only_when_foreground_moved_away() {
        assert!(should_hide_after_blur(true, false));
        assert!(!should_hide_after_blur(true, true));
        assert!(!should_hide_after_blur(false, false));
    }

    #[test]
    fn tray_click_right_after_blur_hide_counts_as_close() {
        let now = Instant::now();
        assert!(is_recent_blur_hide(
            Some(now - Duration::from_millis(100)),
            now
        ));
        assert!(!is_recent_blur_hide(Some(now - TRAY_REOPEN_DEBOUNCE), now));
        assert!(!is_recent_blur_hide(None, now));
    }
}
