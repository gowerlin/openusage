---
schema_version: 1
schema_kind: workorder
id: T0029
title: Enforce panel chrome after window state changes
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T18:48:05+08:00"
updated_at: "2026-05-24T18:48:05+08:00"
started_at: "2026-05-24T18:41:00+08:00"
completed_at: "2026-05-24T18:48:05+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0028
affects_files:
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_hit_test.rs
---

# T0029 Enforce Panel Chrome After Window State Changes

## 背景

使用者安裝 T0028 後成功復現 BUG-001 native title bar leak，並要求查詢 log。

## Log 位置

- Panel trace：`C:\Users\Gower\AppData\Roaming\com.sunstory.openusage\logs\panel-window-trace.log`
- 一般 app log：`C:\Users\Gower\AppData\Local\com.sunstory.openusage\logs\OpenUsage.log`

## 根因

T0028 trace 顯示：

- 啟動後初始 chrome pruning 有效，`style=0x04000000`。
- 面板失焦後，接著發生 `Resized(PhysicalSize { width: 600, height: 734 })`。
- 該 resize snapshot 中 `style=0x14CB0000`、`exstyle=0x00040110`，`has_chrome_bits=true`。
- 這代表 `WS_CAPTION` / `WS_SYSMENU` / frame bits 被 Tauri / Tao window state path 寫回。
- 背景 loop 約 3ms 後才 prune 回 `style=0x14000000`。
- 活體 HWND 檢查也顯示 hidden panel HWND 後來又回到 `style=0x04CB0000`。

因此問題不是 DWM paint 本身，而是 hidden/show/focus/resize state transition 會把 decorated style bits 寫回來，造成下一次顯示時短暫或殘留 native title bar。

## 修復摘要

- `show_panel` 在 `window.show()` 後立即重新 `configure_panel_window(...)`。
- `show_panel` 在 `window.set_focus()` 後再次重新 `configure_panel_window(...)`。
- `hide_panel` 在 `window.hide()` 後重新 `configure_panel_window(...)`，避免 hidden HWND 帶著 decorated style bits 等下一次 show。
- Windows panel window event trace 在非 `Moved` event 時：
  - 先記錄 before snapshot。
  - 立即 enforce panel chrome。
  - 再記錄 after snapshot。

## 驗證

- PASS：`cargo fmt --manifest-path src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，9 tests。
- PASS：`cargo test --lib`，109 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,288,954 bytes
- SHA256：`45101C85CE3359CDF4B631A75E317E03C5EFD405D59E5F2BAD755C25EFE930A7`
- LastWriteTime：2026-05-24 18:47:47

## 驗收狀態

- Source / Rust tests / package build：DONE。
- 安裝版視覺驗收：待使用者重新安裝後確認 focus/blur/hide/show 後不再出現 native title bar。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T18:48:05+08:00
