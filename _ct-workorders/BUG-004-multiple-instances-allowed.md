---
schema_version: 1
schema_kind: bug
id: BUG-004
title: App allows multiple running instances
status: CLOSED
severity: Medium
created_at: "2026-10-15T10:39:24+08:00"
updated_at: "2026-10-15T11:41:34+08:00"
related_workorder: T0032
affects_files:
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/src/lib.rs
depends_on: []
---

# BUG-004 App Allows Multiple Running Instances

## 問題描述

使用者要求 OpenUsage 不可重複執行（不可同時存在多個執行個體）。目前 `src-tauri/src/lib.rs` plugin 清單無 single-instance 保護，重複啟動會產生多個 process / 多個 tray icon / 重複 polling。

## 已確認需求（2026-10-15 使用者選擇）

- 第二次啟動：新 instance 立即結束，並叫出既有 instance 的面板（顯示 + 取得焦點）。
- 平台：全平台（Windows / macOS / Linux），使用 `tauri-plugin-single-instance`。

## 驗收條件

- [x] 已在執行時再次啟動，不會出現第二個 process / 第二個 tray icon。（T0032 Windows smoke）
- [x] 第二次啟動會讓既有面板顯示並取得焦點。（T0032 Windows smoke：前景視窗 pid = 既有 pid）
- [x] Updater relaunch、autostart 開機啟動不受影響。（T0032 原始碼路徑分析，未實機）
- [x] 使用者安裝新版後實測確認。（`v0.6.26`）

## 回報區

### 修復狀態
CLOSED（2026-10-15T11:41:34+08:00）：使用者安裝 `v0.6.26` 實測通過。

### 修復紀錄
- T0032 commit `2717631`：`tauri-plugin-single-instance ~2.4.5`（避免連帶升級 tauri 2.12），builder 第一個註冊，callback 經 `run_on_main_thread` 呼叫既有 `panel::show_panel`。
- 驗證：`cargo fmt --check`、`cargo test --lib`（110 passed）、`bun run build`、本機 NSIS build、Windows 手動 smoke（第二次啟動 exit 0、process 數 = 1、面板取得前景）。
- 未驗：macOS / Linux runtime。
