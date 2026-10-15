---
schema_version: 1
schema_kind: bug
id: BUG-007
title: Panel window shows a taskbar button on Windows
status: OPEN
severity: Low
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T13:18:05+08:00"
related_workorder: T0043
affects_files:
  - src-tauri/tauri.conf.json
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_hit_test.rs
depends_on: []
---

# BUG-007 Panel window shows a taskbar button on Windows

## 問題描述

T0040 觀察：Windows 面板視窗 exstyle `0x00040010`（含 `WS_EX_APPWINDOW`），工作列會出現 OpenUsage 按鈕。選單列 / tray 型 App 不應佔工作列。使用者決定修（2026-10-15，D074）。

## 驗收條件

- [ ] 面板顯示時工作列沒有 OpenUsage 按鈕。
- [ ] 不規則遮罩、deactive 無 native title bar（BUG-001）、single-instance（BUG-004）不退步。
- [ ] 使用者安裝新版後實測。

## 回報區

### 修復狀態
OPEN
