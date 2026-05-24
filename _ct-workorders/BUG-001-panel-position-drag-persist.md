---
schema_version: 1
schema_kind: bug
id: BUG-001
title: Panel window position should be draggable and persisted
status: FIXED
severity: Medium
created_at: "2026-05-24 09:17:34 +08:00"
updated_at: "2026-05-24T09:34:45+08:00"
related_workorder: T0011
affects_files:
  - src/components/app/app-shell.tsx
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_position.rs
depends_on: []
---

# BUG-001 Panel Window Position Should Be Draggable And Persisted

## 元資料
- **編號**：BUG-001
- **標題**：Panel window position should be draggable and persisted
- **狀態**：FIXED
- **嚴重度**：🟡 Medium
- **建立時間**：2026-05-24 09:17:34 (UTC+8)
- **關聯工單**：T0011

## 問題描述

使用者回報：

> 面版視窗顯示後要能拖曳移動位置，並記住位置，下次開起在記憶位置。

## 預期行為

- 指揮塔 / 工單面板類型的浮動視窗開啟後，可以拖曳移動。
- 使用者關閉後再次開啟，視窗出現在上次位置。
- 重新整理或重啟 app 後仍使用記憶位置。
- 若視窗大小或螢幕尺寸改變，位置需 clamp 到可見範圍，避免開到畫面外。

## 實際行為

- 面板開啟後固定在預設位置，不能拖曳移動。
- 下次開啟不會回到使用者期望位置。

## 重現資訊

- 可重現性：100%（依目前 UI 行為）
- Workaround：無穩定 workaround；使用者只能接受預設位置。

## 修復策略

- 立即派發 T0011 修復工單。
- BUG 狀態先設為 FIXING。

## 驗收條件

- [x] 面板顯示後可用標題列 / 明確拖曳區移動位置。
- [x] 拖曳不干擾 tab、按鈕、checkbox、scrollbar、輸入欄位等互動元素。
- [x] 關閉再開啟後使用上次位置。
- [x] app reload / restart 後仍可使用記憶位置。
- [x] 位置資料異常或超出 viewport 時會回到可見範圍。
- [x] 有合適的 regression test；若 UI/E2E 測試成本過高，至少補 helper/storage/clamp 單元測試。

## 回報區

### 修復狀態
FIXED

### 驗證紀錄
- 明確拖曳區：`use-panel.test.ts` 驗證 primary pointer 呼叫 `startDragging()`，非 primary pointer 不觸發。
- 位置記憶：Rust move event 監聽將 `{ x, y }` 存到既有 `settings.json`；show/toggle 時優先套用已存位置。
- 邊界保護：`panel_position` 單元測試覆蓋超出 work area clamp 與負座標螢幕。
- 驗證命令：`bun run test --run`、`bun run build`、`cargo fmt --check`、`cargo test` 均通過。
