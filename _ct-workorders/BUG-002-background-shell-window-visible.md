---
schema_version: 1
schema_kind: bug
id: BUG-002
title: Background shell commands should not show terminal windows
status: FIXED
severity: Medium
created_at: "2026-05-24 09:42:46 +08:00"
updated_at: "2026-05-24T09:55:02+08:00"
related_workorder: T0013
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
depends_on: []
---

# BUG-002 Background Shell Commands Should Not Show Terminal Windows

## 元資料
- **編號**：BUG-002
- **標題**：Background shell commands should not show terminal windows
- **狀態**：FIXED
- **嚴重度**：🟡 Medium
- **建立時間**：2026-05-24 09:42:46 (UTC+8)
- **關聯工單**：T0013

## 問題描述

使用者回報：

> 背景跑 shell 會出現終端視窗，應該隱藏。

## 預期行為

- app 在背景執行 shell / child process 時，不應跳出可見終端視窗。
- Windows packaged app 中不應有 console window flash / popup。
- 背景工作仍需保留 stdout/stderr 捕捉與錯誤回報。
- 使用者明確要求開啟互動 terminal 的功能不在本 bug 範圍內，不應被隱藏。

## 實際行為

- 背景 shell 執行時會出現終端視窗，干擾使用者。

## 重現資訊

- 平台：Windows。
- 可重現性：依使用者回報，背景 shell path 會出現終端視窗。
- 需 Worker 進一步定位觸發來源。

## 修復策略

- 立即派發 T0013 修復工單。
- Worker 需先定位所有背景 shell / process 啟動 seam。
- Windows 背景 process 應使用隱藏視窗方式啟動，例如 Rust `CommandExt::creation_flags(CREATE_NO_WINDOW)` 或既有平台 helper。
- 不新增重型 process manager。

## 驗收條件

- [x] 背景 shell / child process 在 Windows 不顯示終端視窗。
- [x] stdout/stderr / exit status 仍可正確處理。
- [x] 錯誤仍 fail loud，不 silent fallback。
- [x] 不影響使用者主動開啟互動 terminal 的功能。
- [x] 有 regression test 或可維護的 helper-level test。

## 回報區

### 修復狀態
FIXED

### 驗證紀錄
- T0013 在 `src-tauri/src/plugin_engine/host_api.rs` 新增 Windows background command helper，使用 `CommandExt::creation_flags(CREATE_NO_WINDOW)`。
- 套用於 env shell stdout command、`ccusage` runner availability check、`ccusage` query command config。
- `cargo test windows_background_commands_use_create_no_window_flag --lib`：RED 後 GREEN。
- `cargo test plugin_engine::host_api::tests --lib`：PASS，67 tests。
- `cargo check`：PASS。
- `cargo test --lib`：PASS，100 tests。
- 未執行 packaged app 視覺 smoke；本次以 Windows-specific creation flag、helper-level regression test、Rust build/test 驗證。
- commit：待回填
