---
schema_version: 1
schema_kind: bug
id: BUG-010
title: ccusage runner on Windows leaves child processes on timeout and tries yarn classic
status: OPEN
severity: Low
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:41:38+08:00"
related_workorder: T0046
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
depends_on: []
---

# BUG-010 ccusage runner on Windows leaves child processes on timeout and tries yarn classic

## 問題描述（T0042 回報）

1. Windows timeout 時 `kill_ccusage_on_timeout` 只 `child.kill()` 掉 `cmd.exe`，`.cmd` 底下的 node 孫程序不會被殺，且持有 stdout/stderr pipe，reader thread `join` 可能卡住直到 node 自行結束。
2. yarn classic（1.x）的 `yarn.cmd` 被判定可用，但 `yarn dlx` 必定失敗，每次 probe 多 2 次失敗 + 2 行 WARN 才 fallback（macOS 同樣行為）。
3. `run_ccusage_with_runner` dead_code 警告。

## 驗收條件

- [ ] Windows timeout 時整個 process tree 被結束，reader 不會卡住。
- [ ] yarn classic 不再被當作 dlx runner（不產生 WARN 噪音）。
- [ ] `cargo check --all-targets` 無 `run_ccusage_with_runner` dead_code 警告。
- [ ] 補測試。

## 回報區

### 修復狀態
OPEN
