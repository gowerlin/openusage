---
schema_version: 1
schema_kind: bug
id: BUG-009
title: Log redaction does not mask Windows user paths
status: OPEN
severity: Medium
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:41:38+08:00"
related_workorder: T0045
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
depends_on: []
---

# BUG-009 Log redaction does not mask Windows user paths

## 問題描述

T0039 稽核發現：`host_api.rs` 的路徑 redaction regex 只涵蓋 Unix 路徑（`/Users/<name>/...`、`/home/<name>/...`），Windows 的 `C:\Users\<name>\...`（含正斜線與 JSON 跳脫雙反斜線形式）不會被遮。log 可能外洩 Windows 使用者名稱。

## 驗收條件

- [ ] Windows 使用者路徑（反斜線、正斜線、JSON 跳脫雙反斜線、不同磁碟代號）在 log / body redaction 中被遮蔽。
- [ ] 既有 Unix 路徑遮蔽不退步。
- [ ] 補測試。

## 回報區

### 修復狀態
OPEN
