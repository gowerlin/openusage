---
schema_version: 1
schema_kind: bug
id: BUG-006
title: Usage Trend and ccusage history do not render on Windows
status: CLOSED
severity: Medium
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T16:28:34+08:00"
related_workorder: T0042
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
depends_on: []
---

# BUG-006 Usage Trend and ccusage history do not render on Windows

## 問題描述

T0040 smoke（0.6.29 本機 build）發現：Claude / Codex 詳細頁沒有 Today / Yesterday / Last 30 Days / Usage Trend。`OpenUsage.log`：`[WARN] [plugin:claude] no package runner found for ccusage query`。

## 根因（T0040 Worker 分析）

`src-tauri/src/plugin_engine/host_api.rs` 的 `ccusage_runner_candidates`（約 L1849）只列 Unix 名稱（`bunx`、`npx`、`/opt/homebrew/bin/...`）。Windows 上 `Command::new("npx")` 只補 `.exe`，找不到 `npx.cmd`；本機有 `C:
vm4w
odejs
px.cmd` 與 choco `bun.exe`（無 `bunx.exe`）。v0.6.27 同一段程式 → **既有問題，非 PLAN-004 退步**。

## 驗收條件

- [x] Windows 能找到 ccusage runner（`npx.cmd` / `bun.exe x` 等），Claude / Codex 顯示 Today / Yesterday / Last 30 Days / Usage Trend。
- [x] 背景執行不跳 console 視窗（BUG-002 回歸）。
- [ ] 找不到任何 runner 時行為明確（非靜默）。→ 現況：plugin 收到 `no_runner` 靜默省略 token 行（T0042 回報，未改 UI；後續候選）。
- [x] 使用者安裝新版後實測。（`v0.6.30`）

## 回報區

### 修復狀態
CLOSED（2026-10-15T16:28:34+08:00）：使用者安裝 `v0.6.30` 實測通過（D092）。
FIXED：T0042 `1a439dcc`。Windows candidate：`bunx.exe`/`bun.exe x`、`pnpm.cmd`/`pnpm.exe`、`yarn.cmd`、`npm.cmd`、`npx.cmd`/`npx.exe`；皆經 `CREATE_NO_WINDOW`。實機 Claude 詳細頁顯示 今天 / 昨天 / 過去 30 天 / 用量趨勢，3 輪 console 取樣無 console 視窗。待 T0044 re-smoke 與使用者安裝實測。
