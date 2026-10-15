---
schema_version: 1
schema_kind: bug
id: BUG-018
title: panel-window-trace.log startup line contains the Windows user name
status: OPEN
severity: Low
created_at: "2026-10-15T17:51:22+08:00"
updated_at: "2026-10-15T17:51:22+08:00"
related_workorder: T0067
affects_files:
  - src-tauri/src/panel_hit_test.rs
depends_on: []
---

# BUG-018 panel-window-trace.log Startup Line Contains The Windows User Name

## 問題描述（T0062 觀察 3）

`panel-window-trace.log` 每次啟動寫 `event=trace_ready path=C:\Users\<user>\…`（`panel_hit_test.rs:525` 附近），未經 redaction。BUG-009 只處理 `OpenUsage.log` / host_api。

## 驗收條件

- [ ] trace log 不出現實際使用者名稱（路徑走既有 `redact_paths` 或只寫相對 / 遮蔽形式）。
- [ ] 不改 subclass 邏輯（BUG-001 高風險區）。

## 回報區

### 修復狀態
OPEN（T0067，D105）
