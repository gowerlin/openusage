---
schema_version: 1
schema_kind: bug
id: BUG-014
title: Long text metric values are truncated in provider detail
status: CLOSED
severity: Low
created_at: "2026-10-15T14:53:32+08:00"
updated_at: "2026-10-15T16:28:34+08:00"
related_workorder: T0050
target_version: "0.6.30"
affects_files:
  - src/components/provider-card-metric-line.tsx
depends_on: []
---

# BUG-014 Long text metric values are truncated in provider detail

## 問題描述（T0044 觀察 2）

Claude 詳細頁「昨天 $213.36 · 597M toke…」被截斷：text line value `max-w-[45%]` + `truncate`（T0042 截圖已如此）。

## 驗收條件

- [x] 一般金額 / token 值在 400px 面板完整顯示（放寬寬度、label 讓位或換行）。
- [x] 不影響其他 line 排版。

## 回報區

### 修復狀態
CLOSED（2026-10-15T16:28:34+08:00）：使用者安裝 `v0.6.30` 實測通過（D092）。
FIXED：T0050 `439a9d81`。text value `max-w-[45%]` → `max-w-[70%]`；browser dev 量測典型值皆完整。待 T0053 實機與使用者實測。
