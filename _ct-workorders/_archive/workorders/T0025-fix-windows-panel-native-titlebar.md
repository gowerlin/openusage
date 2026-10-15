---
schema_version: 1
schema_kind: workorder
id: T0025
title: Fix Windows panel native title bar leaking through region mask
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T18:02:58+08:00"
updated_at: "2026-05-24T18:02:58+08:00"
started_at: "2026-05-24T17:55:00+08:00"
completed_at: "2026-05-24T18:02:58+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0022
affects_files:
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_hit_test.rs
---

# T0025 Fix Windows Panel Native Title Bar Leaking Through Region Mask

## 背景

使用者新安裝包驗收：

- System Tray icon 正確。
- 不規則透明視窗遮罩有效。
- 但某些狀態下會出現 Windows native title bar / title controls。

## 根因

Tauri / Tao 在 Windows 上切換 native window state 時會重寫 HWND style。特別是 `set_ignore_cursor_events(...)` 用於 transparent padding passthrough 時，會更新 window style，可能把 `WS_CAPTION` / `WS_SYSMENU` / frame bits 寫回來。Region mask 擴到上緣後，這些 native title controls 就會被顯示出來。

## 修復摘要

- `src-tauri/src/panel_hit_test.rs` 新增 `strip_windows_panel_chrome`，移除 `WS_CAPTION`、`WS_SYSMENU`、`WS_THICKFRAME`、`WS_MINIMIZEBOX`、`WS_MAXIMIZEBOX`。
- 新增 `enforce_panel_chrome(...)`，透過 Win32 `GetWindowLongPtrW` / `SetWindowLongPtrW` / `SetWindowPos(SWP_FRAMECHANGED)` 強制刷新 borderless style。
- 在 panel init/show、套用 `SetWindowRgn` 前、`set_ignore_cursor_events(...)` 切換後都重新 enforce，避免 title bar 在 cursor passthrough 狀態切換後回來。

## 驗證

- RED：`cargo test strips_native_windows_title_bar_style_bits --lib`，先確認缺 `strip_windows_panel_chrome` 會失敗。
- PASS：`cargo test strips_native_windows_title_bar_style_bits --lib`。
- PASS：`cargo fmt --manifest-path src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，9 tests。
- PASS：`cargo test --lib`，109 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,273,772 bytes
- SHA256：`56266633E449C1110060D6315C0419E24479CFD83B5F8E709EDD7D812D80D0D9`
- LastWriteTime：2026-05-24 18:02:47

## 驗收狀態

- Source / Rust tests / package build：DONE。
- 安裝版視覺驗收：FAIL，使用者截圖顯示 native title bar 仍會出現。
- 後續：T0026 以可見期間持續 enforcement 補救 Tauri / Tao async style 覆寫。

## 回報區

### 完成狀態
DONE；installed verification failed, superseded by T0026

### 回報時間
2026-05-24T18:02:58+08:00
