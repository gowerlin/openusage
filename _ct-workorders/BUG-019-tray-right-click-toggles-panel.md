---
schema_version: 1
schema_kind: bug
id: BUG-019
title: Tray right-click also toggles the panel and can hide the context menu
status: CLOSED
severity: Low
created_at: "2026-10-15T19:14:33+08:00"
updated_at: "2026-10-15T19:52:46+08:00"
related_workorder: T0072
affects_files:
  - src-tauri/src/tray.rs
depends_on: []
---

# BUG-019 Tray Right-Click Also Toggles The Panel

## 問題描述（T0069 觀察）

`src-tauri/src/tray.rs:213` `TrayIconEvent::Click` 只判斷 `button_state == Up`，未過濾 `MouseButton::Left`；右鍵開選單時面板也 toggle、搶前景，右鍵選單被蓋住（T0069 自動化右鍵 2 次叫不出選單，需使用者手動 Quit）。

## 驗收條件

- [x] 只有左鍵 Up 才 toggle 面板；右鍵只顯示 tray 選單。
- [x] BUG-008 tray 左鍵連點無閃爍不退步；macOS 行為不變。

## 回報區

### 修復狀態
CLOSED（2026-10-15T19:52:46+08:00）：使用者安裝 `v0.6.32` 實測通過（D116）。
FIXED：T0072 `dcf6585f`（`should_toggle_on_tray_click`，只有 Left+Up toggle）。面板開著時右鍵 → 選單搶前景 → 依 BUG-008 失焦收起，屬預期（D113）。待 T0070 與使用者實測。
