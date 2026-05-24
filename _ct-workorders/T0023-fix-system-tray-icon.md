---
schema_version: 1
schema_kind: workorder
id: T0023
title: Fix Windows system tray icon
status: DONE
priority: Low
type: bugfix
bug_id: BUG-003
plan_id: null
created_at: "2026-05-24T17:03:28+08:00"
updated_at: "2026-05-24T17:03:28+08:00"
started_at: "2026-05-24T17:03:28+08:00"
completed_at: "2026-05-24T17:03:28+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on: []
affects_files:
  - src-tauri/src/tray.rs
---

# T0023 Fix Windows System Tray Icon

## 背景

使用者安裝測試發現 System Tray icon 顯示為空白 / 不明顯，應與 Desktop Icon 一致。

## 修復摘要

- `src-tauri/src/tray.rs` 不再從 resource path 載入 `icons/tray-icon.png`。
- 改用 `Image::from_bytes(include_bytes!("../icons/32x32.png"))`，與 desktop icon set 同源。
- `icon_as_template(false)`，避免 Windows tray 以 template icon 顯示成空白。

## 驗證

- PASS：`bun run test --run`，64 files / 1138 tests。
- PASS：`cargo test --lib`，108 tests。
- PASS：本機 Windows NSIS package build，產出 `src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`。

## 驗收狀態

- Source / tests / package build：DONE。
- 安裝版視覺驗收：待使用者用新 installer 確認。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T17:03:28+08:00
