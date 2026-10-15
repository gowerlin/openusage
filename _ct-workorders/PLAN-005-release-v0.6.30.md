---
schema_version: 1
schema_kind: plan
id: PLAN-005
title: v0.6.30 Windows panel polish
status: DONE
priority: Medium
plan_type: maintenance
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T16:23:35+08:00"
completed_at: "2026-10-15T16:23:35+08:00"
affects_files: []
depends_on:
  - PLAN-004
---

# PLAN-005 v0.6.30 Windows Panel Polish

## 目標

修 T0044 觀察到、`v0.6.29` 已知問題中的 BUG-013 / 014 / 015，驗證後發行 `v0.6.30`（使用者 2026-10-15 要求「處理 v0.6.30」，D085）。

## 工單串接（前一張 DONE 才派下一張；非 DONE 停下問使用者）

1. T0050 BUG-014 數值截斷（前端，低風險）
2. T0051 BUG-015 面板高度超出工作區（前端 + 位置記憶）
3. T0052 BUG-013 只有 `WM_NCACTIVATE(0)` 時不收起（⚠️ BUG-001 高風險區）
4. T0053 Windows smoke + NSIS 0.6.30
5. T0054 版號 0.6.30 + 發行

## 進度

- 2026-10-15：建立 T0050–T0054，派發 T0050。
- 2026-10-15：T0050–T0054 完成，`v0.6.30` 發行（run `38703798990`，tag → `49754c2f`，Latest）。BUG-013/014/015 FIXED，待使用者與 BUG-006–012 一併安裝實測。BUG-016 留 v0.6.31 候選。
