---
schema_version: 1
schema_kind: bug
id: BUG-016
title: Panel can extend below the screen right after dragging low
status: OPEN
severity: Low
created_at: "2026-10-15T16:08:42+08:00"
updated_at: "2026-10-15T16:08:42+08:00"
related_workorder: null
target_version: "0.6.31"
affects_files:
  - src/hooks/app/use-panel.ts
  - src-tauri/src/panel_position.rs
depends_on: []
---

# BUG-016 Panel Can Extend Below The Screen Right After Dragging Low

## 問題描述（T0053 觀察 1）

拖到偏下（top=1003）後，首頁高度維持 620，下緣到 1623，超出螢幕（1440），直到下次 show 才夾回。拖曳後不重算高度 / 位置。

## 驗收條件

- [ ] 拖曳結束後面板仍在工作區內（重算高度上限或夾位置），且 `panelPosition` 規則不變（存使用者拖曳結果）。

## 回報區

### 修復狀態
OPEN（v0.6.31 候選，D090）
