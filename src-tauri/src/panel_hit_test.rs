use serde::Deserialize;

const MAIN_WINDOW_LABEL: &str = "main";
const PANEL_RADIUS_LOGICAL_PX: f64 = 14.0;
const WINDOWS_STYLE_CAPTION: u32 = 0x00C0_0000;
const WINDOWS_STYLE_SYSMENU: u32 = 0x0008_0000;
const WINDOWS_STYLE_THICKFRAME: u32 = 0x0004_0000;
const WINDOWS_STYLE_MINIMIZEBOX: u32 = 0x0002_0000;
const WINDOWS_STYLE_MAXIMIZEBOX: u32 = 0x0001_0000;
const WINDOWS_WM_NCCALCSIZE: u32 = 0x0083;
const WINDOWS_WM_NCPAINT: u32 = 0x0085;
const WINDOWS_WM_NCACTIVATE: u32 = 0x0086;
const WINDOWS_WM_STYLECHANGING: u32 = 0x007C;
const WINDOWS_WM_STYLECHANGED: u32 = 0x007D;

#[derive(Debug, Clone, Copy, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PanelBounds {
    pub left: f64,
    pub top: f64,
    pub right: f64,
    pub bottom: f64,
}

impl PanelBounds {
    fn is_valid(self) -> bool {
        self.left.is_finite()
            && self.top.is_finite()
            && self.right.is_finite()
            && self.bottom.is_finite()
            && self.right > self.left
            && self.bottom > self.top
    }

    #[cfg(test)]
    fn contains(self, x: f64, y: f64) -> bool {
        x >= self.left && x <= self.right && y >= self.top && y <= self.bottom
    }
}

#[derive(Debug, Clone, Copy, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PanelWindowMask {
    pub panel_bounds: PanelBounds,
    pub arrow_bounds: Option<PanelBounds>,
}

impl PanelWindowMask {
    fn is_valid(self) -> bool {
        self.panel_bounds.is_valid()
            && self
                .arrow_bounds
                .map(|bounds| bounds.is_valid())
                .unwrap_or(true)
    }

    #[cfg(test)]
    fn contains(self, x: f64, y: f64) -> bool {
        self.panel_bounds.contains(x, y)
            || self
                .arrow_bounds
                .map(|bounds| bounds.contains(x, y))
                .unwrap_or(false)
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct PhysicalPoint {
    x: i32,
    y: i32,
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct PhysicalBounds {
    left: i32,
    top: i32,
    right: i32,
    bottom: i32,
}

impl PhysicalBounds {
    fn width(self) -> i32 {
        self.right.saturating_sub(self.left)
    }
}

fn physical_bounds_from_logical(bounds: PanelBounds, scale_factor: f64) -> Option<PhysicalBounds> {
    if !bounds.is_valid() || !scale_factor.is_finite() || scale_factor <= 0.0 {
        return None;
    }

    let physical = PhysicalBounds {
        left: (bounds.left * scale_factor).floor() as i32,
        top: (bounds.top * scale_factor).floor() as i32,
        right: (bounds.right * scale_factor).ceil() as i32,
        bottom: (bounds.bottom * scale_factor).ceil() as i32,
    };

    if physical.right <= physical.left || physical.bottom <= physical.top {
        None
    } else {
        Some(physical)
    }
}

fn arrow_points_from_bounds(bounds: PhysicalBounds) -> [PhysicalPoint; 3] {
    let center_x = bounds.left + bounds.width() / 2;
    [
        PhysicalPoint {
            x: center_x,
            y: bounds.top,
        },
        PhysicalPoint {
            x: bounds.right,
            y: bounds.bottom,
        },
        PhysicalPoint {
            x: bounds.left,
            y: bounds.bottom,
        },
    ]
}

fn strip_windows_panel_chrome(style: u32) -> u32 {
    style
        & !(WINDOWS_STYLE_CAPTION
            | WINDOWS_STYLE_SYSMENU
            | WINDOWS_STYLE_THICKFRAME
            | WINDOWS_STYLE_MINIMIZEBOX
            | WINDOWS_STYLE_MAXIMIZEBOX)
}

fn windows_panel_subclass_policy(message: u32, wparam: usize) -> Option<isize> {
    match message {
        WINDOWS_WM_NCCALCSIZE if wparam != 0 => Some(0),
        WINDOWS_WM_NCACTIVATE => Some(1),
        WINDOWS_WM_NCPAINT => Some(0),
        WINDOWS_WM_STYLECHANGING | WINDOWS_WM_STYLECHANGED => Some(0),
        _ => None,
    }
}

#[cfg(windows)]
mod platform {
    use super::{
        MAIN_WINDOW_LABEL, PANEL_RADIUS_LOGICAL_PX, PanelWindowMask, WINDOWS_WM_NCACTIVATE,
        WINDOWS_WM_NCCALCSIZE, WINDOWS_WM_NCPAINT, WINDOWS_WM_STYLECHANGED,
        WINDOWS_WM_STYLECHANGING, arrow_points_from_bounds, physical_bounds_from_logical,
        strip_windows_panel_chrome, windows_panel_subclass_policy,
    };
    use std::fs::{OpenOptions, create_dir_all};
    use std::io::Write;
    use std::path::PathBuf;
    use std::sync::{
        Mutex, OnceLock,
        atomic::{AtomicBool, Ordering},
    };
    use std::time::Duration;
    use tauri::{AppHandle, Manager};
    use windows::Win32::{
        Foundation::{HWND, POINT, RECT},
        Graphics::Dwm::{
            DWMNCRP_DISABLED, DWMWA_ALLOW_NCPAINT, DWMWA_EXTENDED_FRAME_BOUNDS,
            DWMWA_NCRENDERING_ENABLED, DWMWA_NCRENDERING_POLICY, DwmGetWindowAttribute,
            DwmSetWindowAttribute,
        },
        Graphics::Gdi::{
            CombineRgn, CreatePolygonRgn, CreateRoundRectRgn, DeleteObject, ERROR, HGDIOBJ, HRGN,
            RGN_OR, SetWindowRgn, WINDING,
        },
        UI::Shell::{DefSubclassProc, SetWindowSubclass},
        UI::WindowsAndMessaging::{
            GWL_EXSTYLE, GWL_STYLE, GetClientRect, GetWindowLongPtrW, GetWindowRect, STYLESTRUCT,
            SWP_FRAMECHANGED, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER,
            SetWindowLongPtrW, SetWindowPos,
        },
    };

    const PANEL_SUBCLASS_ID: usize = 0x4F_55_50_41;

    static MASK: OnceLock<Mutex<Option<PanelWindowMask>>> = OnceLock::new();
    static TRACE_FILE: OnceLock<Mutex<Option<PathBuf>>> = OnceLock::new();
    static SUBCLASSED_HWND: OnceLock<Mutex<Option<isize>>> = OnceLock::new();
    static STARTED: AtomicBool = AtomicBool::new(false);

    fn mask_slot() -> &'static Mutex<Option<PanelWindowMask>> {
        MASK.get_or_init(|| Mutex::new(None))
    }

    fn trace_file_slot() -> &'static Mutex<Option<PathBuf>> {
        TRACE_FILE.get_or_init(|| Mutex::new(None))
    }

    fn subclassed_hwnd_slot() -> &'static Mutex<Option<isize>> {
        SUBCLASSED_HWND.get_or_init(|| Mutex::new(None))
    }

    pub fn set_mask(app_handle: &AppHandle, mask: PanelWindowMask) -> Result<(), String> {
        if !mask.is_valid() {
            panel_trace("set_mask_invalid", format!("mask={mask:?}"));
            return Err("invalid panel window mask".to_string());
        }

        panel_trace("set_mask", format!("mask={mask:?}"));
        apply_window_region(app_handle, mask)?;

        let mut current = mask_slot()
            .lock()
            .map_err(|error| format!("failed to lock panel window mask: {error}"))?;
        *current = Some(mask);
        Ok(())
    }

    pub fn enforce_chrome(window: &tauri::WebviewWindow) -> Result<(), String> {
        let hwnd = window
            .hwnd()
            .map_err(|error| format!("failed to read main window handle: {error}"))?;
        install_hwnd_subclass(HWND(hwnd.0))?;
        enforce_hwnd_chrome(HWND(hwnd.0))
    }

    pub fn start_mask(app_handle: AppHandle) {
        init_trace_file(&app_handle);
        panel_trace("start_mask", "starting Windows panel mask monitor");
        if STARTED.swap(true, Ordering::SeqCst) {
            panel_trace("start_mask_skipped", "monitor already started");
            return;
        }

        if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
            if let Err(error) = window.set_decorations(false) {
                log::warn!("failed to disable native panel decorations: {error}");
            }
            if let Err(error) = window.set_shadow(false) {
                log::warn!("failed to disable native panel shadow: {error}");
            }
            if let Err(error) = install_panel_subclass(&window) {
                log::warn!("failed to install native panel subclass: {error}");
            }
            if let Err(error) = enforce_chrome(&window) {
                log::warn!("failed to enforce native panel chrome: {error}");
            }
            trace_window_snapshot(&window, "start_mask_initial_snapshot");
            panel_trace(
                "cursor_ignore_disabled",
                "native window region owns panel hit area",
            );
        }

        std::thread::spawn(move || {
            loop {
                if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
                    if window.is_visible().unwrap_or(false) {
                        if let Err(error) = enforce_chrome(&window) {
                            log::warn!("failed to enforce native panel chrome: {error}");
                        }
                    }
                }

                std::thread::sleep(Duration::from_millis(33));
            }
        });
    }

    fn apply_window_region(app_handle: &AppHandle, mask: PanelWindowMask) -> Result<(), String> {
        let window = app_handle
            .get_webview_window(MAIN_WINDOW_LABEL)
            .ok_or_else(|| "main window not found".to_string())?;
        let hwnd = window
            .hwnd()
            .map_err(|error| format!("failed to read main window handle: {error}"))?;
        let scale_factor = window
            .scale_factor()
            .map_err(|error| format!("failed to read main window scale factor: {error}"))?;

        install_hwnd_subclass(HWND(hwnd.0))?;
        enforce_hwnd_chrome(HWND(hwnd.0))?;

        let region = create_native_region(mask, scale_factor)?;
        let result = unsafe { SetWindowRgn(HWND(hwnd.0), Some(region), true) };
        panel_trace(
            "set_window_region",
            format!("scale_factor={scale_factor:.3} result={result} mask={mask:?}"),
        );
        if result == 0 {
            delete_region(region);
            panel_trace("set_window_region_error", "SetWindowRgn returned 0");
            return Err("failed to set panel window region".to_string());
        }

        Ok(())
    }

    fn install_panel_subclass(window: &tauri::WebviewWindow) -> Result<(), String> {
        let hwnd = window
            .hwnd()
            .map_err(|error| format!("failed to read main window handle: {error}"))?;
        install_hwnd_subclass(HWND(hwnd.0))
    }

    fn install_hwnd_subclass(hwnd: HWND) -> Result<(), String> {
        let hwnd_key = hwnd.0 as isize;
        let mut subclassed = subclassed_hwnd_slot()
            .lock()
            .map_err(|error| format!("failed to lock panel subclass state: {error}"))?;
        if *subclassed == Some(hwnd_key) {
            return Ok(());
        }

        let installed =
            unsafe { SetWindowSubclass(hwnd, Some(panel_subclass_proc), PANEL_SUBCLASS_ID, 0) };
        if !installed.as_bool() {
            panel_trace(
                "subclass_install_error",
                format!("hwnd=0x{:X}", hwnd.0 as usize),
            );
            return Err("failed to install native panel subclass".to_string());
        }

        *subclassed = Some(hwnd_key);
        panel_trace(
            "subclass_installed",
            format!("hwnd=0x{:X}", hwnd.0 as usize),
        );
        refresh_native_frame(hwnd)
    }

    unsafe extern "system" fn panel_subclass_proc(
        hwnd: HWND,
        message: u32,
        wparam: windows::Win32::Foundation::WPARAM,
        lparam: windows::Win32::Foundation::LPARAM,
        _subclass_id: usize,
        _reference_data: usize,
    ) -> windows::Win32::Foundation::LRESULT {
        if message == WINDOWS_WM_STYLECHANGING && wparam.0 as isize as i32 == GWL_STYLE.0 {
            let style = lparam.0 as *mut STYLESTRUCT;
            if let Some(style) = unsafe { style.as_mut() } {
                let next_style = strip_windows_panel_chrome(style.styleNew);
                if next_style != style.styleNew {
                    panel_trace(
                        "subclass_style_changing_pruned",
                        format!(
                            "hwnd=0x{:X} before_style=0x{:08X} after_style=0x{next_style:08X}",
                            hwnd.0 as usize, style.styleNew
                        ),
                    );
                    style.styleNew = next_style;
                }
            }
        }

        if matches!(
            message,
            WINDOWS_WM_NCCALCSIZE
                | WINDOWS_WM_NCACTIVATE
                | WINDOWS_WM_NCPAINT
                | WINDOWS_WM_STYLECHANGING
                | WINDOWS_WM_STYLECHANGED
        ) {
            if let Some(result) = windows_panel_subclass_policy(message, wparam.0) {
                panel_trace(
                    "subclass_message_handled",
                    format!(
                        "hwnd=0x{:X} message=0x{message:04X} wparam=0x{:X} result={result}",
                        hwnd.0 as usize, wparam.0
                    ),
                );
                return windows::Win32::Foundation::LRESULT(result);
            }
        }

        unsafe { DefSubclassProc(hwnd, message, wparam, lparam) }
    }

    fn enforce_hwnd_chrome(hwnd: HWND) -> Result<(), String> {
        disable_dwm_non_client_rendering(hwnd);

        let current_style = unsafe { GetWindowLongPtrW(hwnd, GWL_STYLE) as u32 };
        let next_style = strip_windows_panel_chrome(current_style);
        if next_style != current_style {
            panel_trace(
                "chrome_style_pruned",
                format!(
                    "hwnd=0x{:X} before_style=0x{current_style:08X} after_style=0x{next_style:08X}",
                    hwnd.0 as usize
                ),
            );
            unsafe {
                SetWindowLongPtrW(hwnd, GWL_STYLE, next_style as isize);
            }
            refresh_native_frame(hwnd)?;
            trace_hwnd_snapshot(hwnd, "chrome_style_pruned_snapshot");
        }

        Ok(())
    }

    fn refresh_native_frame(hwnd: HWND) -> Result<(), String> {
        unsafe {
            SetWindowPos(
                hwnd,
                None,
                0,
                0,
                0,
                0,
                SWP_FRAMECHANGED | SWP_NOACTIVATE | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER,
            )
            .map_err(|error| format!("failed to refresh native panel frame: {error}"))?;
        }
        Ok(())
    }

    fn disable_dwm_non_client_rendering(hwnd: HWND) {
        let policy = DWMNCRP_DISABLED.0;
        let policy_result = unsafe {
            DwmSetWindowAttribute(
                hwnd,
                DWMWA_NCRENDERING_POLICY,
                (&policy as *const i32).cast(),
                std::mem::size_of_val(&policy) as u32,
            )
        };
        if let Err(error) = policy_result {
            log::warn!("failed to disable DWM non-client rendering: {error}");
            panel_trace(
                "dwm_ncrendering_policy_error",
                format!("hwnd=0x{:X} error={error}", hwnd.0 as usize),
            );
        }

        let allow_nc_paint = 0i32;
        let paint_result = unsafe {
            DwmSetWindowAttribute(
                hwnd,
                DWMWA_ALLOW_NCPAINT,
                (&allow_nc_paint as *const i32).cast(),
                std::mem::size_of_val(&allow_nc_paint) as u32,
            )
        };
        if let Err(error) = paint_result {
            log::warn!("failed to disable DWM non-client paint: {error}");
            panel_trace(
                "dwm_allow_ncpaint_error",
                format!("hwnd=0x{:X} error={error}", hwnd.0 as usize),
            );
        }
    }

    pub fn trace_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
        if window.label() != MAIN_WINDOW_LABEL {
            return;
        }

        let event_debug = format!("{event:?}");
        if event_debug.starts_with("Moved") {
            return;
        }

        panel_trace("window_event", format!("event={event_debug}"));
        if let Some(webview) = window.app_handle().get_webview_window(MAIN_WINDOW_LABEL) {
            trace_window_snapshot(&webview, "window_event_snapshot_before_enforce");
            match enforce_chrome(&webview) {
                Ok(()) => trace_window_snapshot(&webview, "window_event_snapshot_after_enforce"),
                Err(error) => panel_trace(
                    "window_event_enforce_error",
                    format!("event={event_debug} error={error}"),
                ),
            }
        }
    }

    fn init_trace_file(app_handle: &AppHandle) {
        let trace_path = match app_handle.path().app_data_dir() {
            Ok(app_data_dir) => app_data_dir.join("logs").join("panel-window-trace.log"),
            Err(error) => {
                log::warn!("failed to resolve panel trace path: {error}");
                return;
            }
        };

        if let Some(parent) = trace_path.parent() {
            if let Err(error) = create_dir_all(parent) {
                log::warn!("failed to create panel trace directory: {error}");
                return;
            }
        }

        match trace_file_slot().lock() {
            Ok(mut slot) => {
                *slot = Some(trace_path.clone());
            }
            Err(error) => {
                log::warn!("failed to store panel trace path: {error}");
                return;
            }
        }

        panel_trace(
            "trace_ready",
            format!("path={}", trace_path.to_string_lossy()),
        );
    }

    fn panel_trace(event: &str, details: impl AsRef<str>) {
        let details = details.as_ref();
        log::trace!("[panel-window] {event} {details}");

        let trace_path = match trace_file_slot().lock() {
            Ok(slot) => slot.clone(),
            Err(_) => None,
        };
        let Some(trace_path) = trace_path else {
            return;
        };

        let timestamp = trace_timestamp();
        let line = format!("[{timestamp}] event={event} {details}\n");
        match OpenOptions::new()
            .create(true)
            .append(true)
            .open(&trace_path)
        {
            Ok(mut file) => {
                let _ = file.write_all(line.as_bytes());
            }
            Err(error) => {
                log::warn!("failed to write panel trace: {error}");
            }
        }
    }

    fn trace_timestamp() -> String {
        match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
            Ok(duration) => format!("{}.{:03}Z", duration.as_secs(), duration.subsec_millis()),
            Err(_) => "time-error".to_string(),
        }
    }

    fn trace_window_snapshot(window: &tauri::WebviewWindow, event: &str) {
        let hwnd = match window.hwnd() {
            Ok(hwnd) => HWND(hwnd.0),
            Err(error) => {
                panel_trace(event, format!("hwnd_error={error}"));
                return;
            }
        };
        trace_hwnd_snapshot(hwnd, event);
    }

    fn trace_hwnd_snapshot(hwnd: HWND, event: &str) {
        let style = unsafe { GetWindowLongPtrW(hwnd, GWL_STYLE) as u32 };
        let exstyle = unsafe { GetWindowLongPtrW(hwnd, GWL_EXSTYLE) as u32 };
        let stripped = strip_windows_panel_chrome(style);
        let has_chrome_bits = stripped != style;
        panel_trace(
            event,
            format!(
                "hwnd=0x{:X} style=0x{style:08X} exstyle=0x{exstyle:08X} stripped=0x{stripped:08X} has_chrome_bits={has_chrome_bits} window_rect={} client_rect={} extended_frame_bounds={} dwm_nc_rendering_enabled={}",
                hwnd.0 as usize,
                read_window_rect(hwnd),
                read_client_rect(hwnd),
                read_extended_frame_bounds(hwnd),
                read_dwm_nc_rendering_enabled(hwnd)
            ),
        );
    }

    fn read_window_rect(hwnd: HWND) -> String {
        let mut rect = empty_rect();
        match unsafe { GetWindowRect(hwnd, &mut rect) } {
            Ok(()) => format_rect(rect),
            Err(error) => format!("err={error}"),
        }
    }

    fn read_client_rect(hwnd: HWND) -> String {
        let mut rect = empty_rect();
        match unsafe { GetClientRect(hwnd, &mut rect) } {
            Ok(()) => format_rect(rect),
            Err(error) => format!("err={error}"),
        }
    }

    fn read_extended_frame_bounds(hwnd: HWND) -> String {
        let mut rect = empty_rect();
        let result = unsafe {
            DwmGetWindowAttribute(
                hwnd,
                DWMWA_EXTENDED_FRAME_BOUNDS,
                (&mut rect as *mut RECT).cast(),
                std::mem::size_of_val(&rect) as u32,
            )
        };
        match result {
            Ok(()) => format_rect(rect),
            Err(error) => format!("err={error}"),
        }
    }

    fn read_dwm_nc_rendering_enabled(hwnd: HWND) -> String {
        let mut enabled = 0i32;
        let result = unsafe {
            DwmGetWindowAttribute(
                hwnd,
                DWMWA_NCRENDERING_ENABLED,
                (&mut enabled as *mut i32).cast(),
                std::mem::size_of_val(&enabled) as u32,
            )
        };
        match result {
            Ok(()) => enabled.to_string(),
            Err(error) => format!("err={error}"),
        }
    }

    fn empty_rect() -> RECT {
        RECT {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        }
    }

    fn format_rect(rect: RECT) -> String {
        format!(
            "({},{} {}x{})",
            rect.left,
            rect.top,
            rect.right.saturating_sub(rect.left),
            rect.bottom.saturating_sub(rect.top)
        )
    }

    fn create_native_region(mask: PanelWindowMask, scale_factor: f64) -> Result<HRGN, String> {
        let panel = physical_bounds_from_logical(mask.panel_bounds, scale_factor)
            .ok_or_else(|| "invalid physical panel bounds".to_string())?;
        let radius = PANEL_RADIUS_LOGICAL_PX * scale_factor;
        let diameter = (radius * 2.0).ceil() as i32;

        let panel_region = unsafe {
            CreateRoundRectRgn(
                panel.left,
                panel.top,
                panel.right,
                panel.bottom,
                diameter,
                diameter,
            )
        };
        if panel_region.is_invalid() {
            return Err("failed to create panel region".to_string());
        }

        if let Some(arrow_bounds) = mask.arrow_bounds {
            let Some(arrow) = physical_bounds_from_logical(arrow_bounds, scale_factor) else {
                delete_region(panel_region);
                return Err("invalid physical arrow bounds".to_string());
            };
            let arrow_points = arrow_points_from_bounds(arrow);
            let arrow_points = [
                POINT {
                    x: arrow_points[0].x,
                    y: arrow_points[0].y,
                },
                POINT {
                    x: arrow_points[1].x,
                    y: arrow_points[1].y,
                },
                POINT {
                    x: arrow_points[2].x,
                    y: arrow_points[2].y,
                },
            ];
            let arrow_region = unsafe { CreatePolygonRgn(&arrow_points, WINDING) };
            if arrow_region.is_invalid() {
                delete_region(panel_region);
                return Err("failed to create panel arrow region".to_string());
            }

            let combine_result = unsafe {
                CombineRgn(
                    Some(panel_region),
                    Some(panel_region),
                    Some(arrow_region),
                    RGN_OR,
                )
            };
            delete_region(arrow_region);
            if combine_result.0 == ERROR {
                delete_region(panel_region);
                return Err("failed to combine panel window regions".to_string());
            }
        }

        Ok(panel_region)
    }

    fn delete_region(region: HRGN) {
        unsafe {
            let _ = DeleteObject(HGDIOBJ::from(region));
        }
    }
}

#[cfg(not(windows))]
mod platform {
    use super::PanelWindowMask;

    pub fn set_mask(_app_handle: &tauri::AppHandle, _mask: PanelWindowMask) -> Result<(), String> {
        Ok(())
    }

    pub fn enforce_chrome(_window: &tauri::WebviewWindow) -> Result<(), String> {
        Ok(())
    }

    pub fn start_mask(_app_handle: tauri::AppHandle) {}

    pub fn trace_window_event(_window: &tauri::Window, _event: &tauri::WindowEvent) {}
}

pub fn set_mask(app_handle: &tauri::AppHandle, mask: PanelWindowMask) -> Result<(), String> {
    platform::set_mask(app_handle, mask)
}

pub fn enforce_panel_chrome(window: &tauri::WebviewWindow) -> Result<(), String> {
    platform::enforce_chrome(window)
}

pub fn start_mask(app_handle: tauri::AppHandle) {
    platform::start_mask(app_handle)
}

pub fn trace_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    platform::trace_window_event(window, event)
}

#[cfg(test)]
mod tests {
    use super::{
        PanelBounds, PanelWindowMask, PhysicalBounds, PhysicalPoint, WINDOWS_WM_NCACTIVATE,
        WINDOWS_WM_NCCALCSIZE, WINDOWS_WM_NCPAINT, WINDOWS_WM_STYLECHANGED,
        WINDOWS_WM_STYLECHANGING, arrow_points_from_bounds, physical_bounds_from_logical,
        strip_windows_panel_chrome, windows_panel_subclass_policy,
    };

    const MASK: PanelWindowMask = PanelWindowMask {
        panel_bounds: PanelBounds {
            left: 24.0,
            top: 13.0,
            right: 376.0,
            bottom: 476.0,
        },
        arrow_bounds: Some(PanelBounds {
            left: 193.0,
            top: 6.0,
            right: 207.0,
            bottom: 13.0,
        }),
    };

    #[test]
    fn excludes_transparent_padding_from_mask() {
        assert!(!MASK.contains(10.0, 250.0));
    }

    #[test]
    fn includes_panel_bounds_in_mask() {
        assert!(MASK.contains(50.0, 250.0));
    }

    #[test]
    fn includes_arrow_bounds_in_mask() {
        assert!(MASK.contains(200.0, 10.0));
    }

    #[test]
    fn rejects_invalid_mask_bounds() {
        assert!(
            !(PanelWindowMask {
                panel_bounds: PanelBounds {
                    left: 24.0,
                    top: 13.0,
                    right: 24.0,
                    bottom: 476.0,
                },
                arrow_bounds: None,
            })
            .is_valid()
        );
    }

    #[test]
    fn converts_logical_bounds_to_physical_bounds() {
        assert_eq!(
            physical_bounds_from_logical(
                PanelBounds {
                    left: 24.2,
                    top: 13.1,
                    right: 376.4,
                    bottom: 476.6,
                },
                2.0,
            ),
            Some(PhysicalBounds {
                left: 48,
                top: 26,
                right: 753,
                bottom: 954,
            })
        );
    }

    #[test]
    fn builds_arrow_polygon_from_bounds() {
        assert_eq!(
            arrow_points_from_bounds(PhysicalBounds {
                left: 193,
                top: 6,
                right: 207,
                bottom: 13,
            }),
            [
                PhysicalPoint { x: 200, y: 6 },
                PhysicalPoint { x: 207, y: 13 },
                PhysicalPoint { x: 193, y: 13 },
            ]
        );
    }

    #[test]
    fn strips_native_windows_title_bar_style_bits() {
        let decorated_style = 0x00C00000 | 0x00080000 | 0x00040000 | 0x00020000 | 0x00010000;
        assert_eq!(strip_windows_panel_chrome(decorated_style), 0);
    }

    #[test]
    fn subclass_policy_removes_standard_non_client_frame() {
        assert_eq!(
            windows_panel_subclass_policy(WINDOWS_WM_NCCALCSIZE, 1),
            Some(0)
        );
    }

    #[test]
    fn subclass_policy_blocks_non_client_activation_and_paint() {
        assert_eq!(
            windows_panel_subclass_policy(WINDOWS_WM_NCACTIVATE, 0),
            Some(1)
        );
        assert_eq!(
            windows_panel_subclass_policy(WINDOWS_WM_NCPAINT, 0),
            Some(0)
        );
    }

    #[test]
    fn subclass_policy_marks_style_messages_for_native_chrome_pruning() {
        assert_eq!(
            windows_panel_subclass_policy(WINDOWS_WM_STYLECHANGING, 0),
            Some(0)
        );
        assert_eq!(
            windows_panel_subclass_policy(WINDOWS_WM_STYLECHANGED, 0),
            Some(0)
        );
    }
}
