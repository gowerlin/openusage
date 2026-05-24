---
schema_version: 1
schema_kind: workorder
id: T0027
title: Disable DWM non-client title bar rendering
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T18:21:09+08:00"
updated_at: "2026-05-24T18:24:47+08:00"
started_at: "2026-05-24T18:12:00+08:00"
completed_at: "2026-05-24T18:24:47+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0026
affects_files:
  - src-tauri/Cargo.toml
  - src-tauri/src/panel_hit_test.rs
---

# T0027 Disable DWM Non-Client Title Bar Rendering

## 背景

T0026 package 驗收失敗。使用者補充：native title bar 似乎是在面板曾 Active / Focus 後，再離開 focus 時才出現。

## 根因補充

這表示問題不只是 `WS_CAPTION` / frame style bits 被 async 寫回。focus 離開時 Windows 可能走 `WM_NCACTIVATE` / DWM non-client paint 路徑，重新繪製 inactive title bar。

## 修復摘要

- 在 Windows panel HWND chrome enforcement 中，先呼叫 `DwmSetWindowAttribute`。
- 設定 `DWMWA_NCRENDERING_POLICY = DWMNCRP_DISABLED`。
- 設定 `DWMWA_ALLOW_NCPAINT = 0`。
- 保留 T0025 / T0026 的 style bit pruning 與可見期間 enforcement。

## 驗證

- PASS：`cargo fmt --manifest-path src-tauri\Cargo.toml`。
- PASS：`cargo test panel_hit_test --lib`，9 tests。
- PASS：`cargo test --lib`，109 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,276,245 bytes
- SHA256：`73A34D52AEFCE048424795567C0CFA50C2162C9BE2C71D27A6B25F2C943269FF`
- LastWriteTime：2026-05-24 18:24:47

## 驗收狀態

- Source / Rust tests / package build：DONE。
- 安裝版視覺驗收：待使用者重新安裝後確認 focus / blur 後不再出現 Windows native title bar / title controls。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T18:24:47+08:00
