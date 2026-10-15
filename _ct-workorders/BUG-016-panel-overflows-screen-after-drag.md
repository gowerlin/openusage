---
schema_version: 1
schema_kind: bug
id: BUG-016
title: Panel can extend below the screen right after dragging low
status: FIXED
severity: Low
created_at: "2026-10-15T16:08:42+08:00"
updated_at: "2026-10-15T18:15:37+08:00"
related_workorder: T0055, T0067
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

- [x] 拖曳結束後面板仍在工作區內（重算高度上限或夾位置），且 `panelPosition` 規則不變（存使用者拖曳結果）。

## 回報區

### 修復狀態
FIXED（2026-10-15T18:15:37+08:00）：T0067 `4331f8de`——subclass 觀察 `WM_ENTERSIZEMOVE`/`WM_EXITSIZEMOVE` 發 `panel:drag-started`/`drag-ended`，拖曳中零 setSize、放開後 40ms refit。實機立即 / 停頓 150 / 500ms、拖回上方各 ≥3 次全 PASS（放開後約 60ms B=1356；拖回恢復同位置原高）。待 T0068 與使用者實測。

前次：FIXING（2026-10-15T17:51:22+08:00，D105）：T0062 實機 FAIL——放開前停頓 ≥150ms 時，放開後 14ms 視窗被還原成拖曳前高度（外框 B=2053 > 1368）；先拖低再拖回上方停頓放開，rect 卡在 353 造成**可見面板截短**（T0055 引入的回歸）。推測：150ms debounce 在滑鼠按住時 setSize，Windows move loop 放開時套回拖曳開始尺寸，且放開不再觸發 refit。→ T0067 重做。

原紀錄：FIXED：T0055 `5ec8935b`。Rust 端非程式移動時 emit `panel:user-moved`，前端 150ms debounce 重算高度上限；實機拖低放開後 61ms 下緣 1356 ≤ 工作區 1368，`panelPosition` = 拖曳結束位置。待 T0062 與使用者實測。
