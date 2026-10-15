---
schema_version: 1
schema_kind: bug
id: BUG-014
title: Long text metric values are truncated in provider detail
status: OPEN
severity: Low
created_at: "2026-10-15T14:53:32+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
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

- [ ] 一般金額 / token 值在 400px 面板完整顯示（放寬寬度、label 讓位或換行）。
- [ ] 不影響其他 line 排版。

## 回報區

### 修復狀態
OPEN（排入 v0.6.30，D083）
