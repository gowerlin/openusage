---
schema_version: 1
schema_kind: workorder
id: T0026
title: Fix Windows title bar async style regression
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T18:10:49+08:00"
updated_at: "2026-05-24T18:10:49+08:00"
started_at: "2026-05-24T18:06:00+08:00"
completed_at: "2026-05-24T18:10:49+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0025
affects_files:
  - src-tauri/src/panel_hit_test.rs
---

# T0026 Fix Windows Title Bar Async Style Regression

## 背景

T0025 package 驗收失敗。使用者截圖顯示面板仍會出現完整 Windows native title bar，文字為 `OpenUsage`。

## 根因補充

T0025 在 init/show、`SetWindowRgn` 前、`set_ignore_cursor_events(...)` 後做一次性 HWND style enforcement。但 Tauri / Tao 的 window-state 更新可能是 async，會在這些呼叫點之後才寫回 HWND style，因此一次性 enforcement 仍可能被晚一步覆蓋。

## 修復摘要

- 延伸現有 Windows mask thread。
- main window 可見時，每 33ms 檢查 HWND style。
- 只有偵測到 `WS_CAPTION` / system menu / frame bits 回來時才重寫 style 並 `SetWindowPos(SWP_FRAMECHANGED)`。
- 保留 T0025 的 init/show、`SetWindowRgn` 前、cursor passthrough 切換後 enforcement。

## 驗證

- PASS：`cargo fmt --manifest-path src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，9 tests。
- PASS：`cargo test --lib`，109 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,274,604 bytes
- SHA256：`4AFDD10F1F30E0AF10A1FE3F2C7FE187BD361E64F128199DB60C4D5E6987BA72`
- LastWriteTime：2026-05-24 18:10:39

## 驗收狀態

- Source / Rust tests / package build：DONE。
- 安裝版視覺驗收：待使用者重新安裝後確認 Windows native title bar / title controls 不再出現。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T18:10:49+08:00
