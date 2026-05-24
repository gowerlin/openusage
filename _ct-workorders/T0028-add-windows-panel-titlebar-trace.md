---
schema_version: 1
schema_kind: workorder
id: T0028
title: Add Windows panel title bar trace logging
status: DONE
priority: Medium
type: diagnostic
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T18:33:29+08:00"
updated_at: "2026-05-24T18:33:29+08:00"
started_at: "2026-05-24T18:26:00+08:00"
completed_at: "2026-05-24T18:33:29+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0027
affects_files:
  - src-tauri/src/lib.rs
  - src-tauri/src/panel_hit_test.rs
---

# T0028 Add Windows Panel Title Bar Trace Logging

## 背景

T0027 package 驗收仍失敗。使用者建議加 detail trace log 找問題。

## 診斷策略

這輪不再追加新的 title bar 修補假設，改收集安裝版 runtime 證據。

## 實作摘要

- 新增 Windows-only `panel-window-trace.log`。
- trace 檔案固定寫入 `%LOCALAPPDATA%\com.sunstory.openusage\logs\panel-window-trace.log`。
- 不依賴 tray 的 Debug Level；即使一般 log level 是 Error，也會寫入 panel trace file。
- 記錄 Tauri window events，排除高頻 `Moved` event。
- 記錄 focus/blur 等事件後的 HWND snapshot：
  - `GWL_STYLE`
  - `GWL_EXSTYLE`
  - style bits stripping 結果
  - 是否仍有 native chrome bits
  - `GetWindowRect`
  - `GetClientRect`
  - `DWMWA_EXTENDED_FRAME_BOUNDS`
  - `DWMWA_NCRENDERING_ENABLED`
- 記錄 `SetWindowRgn`、cursor passthrough 切換、native chrome style pruning、DWM attribute error。

## 驗證

- PASS：`cargo fmt --manifest-path src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，9 tests。
- PASS：`cargo test --lib`，109 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,291,378 bytes
- SHA256：`098DD274EEF9B6397377C89B1E0AEB73F5F5D85A7D0695C3E609F463C05D3B12`
- LastWriteTime：2026-05-24 18:33:14

## 驗收狀態

- Source / Rust tests / package build：DONE。
- Runtime diagnosis：待使用者安裝後重現問題，回收 `panel-window-trace.log`。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T18:33:29+08:00
