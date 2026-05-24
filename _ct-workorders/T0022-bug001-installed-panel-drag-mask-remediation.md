---
schema_version: 1
schema_kind: workorder
id: T0022
title: Remediate BUG-001 installed panel drag and click-through mask
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T16:39:03+08:00"
updated_at: "2026-05-24T17:03:28+08:00"
started_at: "2026-05-24T16:39:03+08:00"
completed_at: "2026-05-24T17:03:28+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0011
affects_files:
  - src-tauri/capabilities/default.json
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/lib.rs
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src/components/app/app-shell.tsx
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src/index.css
---

# T0022 Remediate BUG-001 Installed Panel Drag And Click-Through Mask

## 背景

T0011 已完成 source-level draggable panel / position persistence，但使用者用安裝版驗收時回報兩個缺口：

1. 拖曳作用區游標與 tooltip 正常，但按住滑鼠左鍵拖曳沒有效果。
2. 視窗外圍透明 padding 會吃掉滑鼠事件，應做成穿透式視窗遮罩。
3. 後續驗收補充：拖曳已正常，但透明視窗仍有完整矩形細框，padding 不應屬於本視窗 focus 範圍，需採不規則去背視窗原理。

## 根因

- Tauri capability 缺 `core:window:allow-start-dragging`，導致前端 `getCurrentWindow().startDragging()` 在安裝版沒有權限執行。
- Windows transparent Tauri window 的透明像素仍會接收 hit-test；只靠 CSS `bg-transparent` 不會讓 OS 滑鼠事件穿透。
- Tauri / Tao Windows undecorated shadow 會造成完整矩形 1px 邊線；需關閉 native shadow，改用 app 內 panel shadow。

## 修復摘要

- `src-tauri/capabilities/default.json`：加入 `core:window:allow-start-dragging`。
- `src/components/app/app-shell.tsx` / `src/index.css`：拖曳把手加上 `data-tauri-drag-region` 與 app-region CSS，並避免內層 pill 攔截 pointer。
- `src/hooks/app/use-panel.ts`：同步 panel surface 與 arrow bounds 到 Tauri command。
- `src-tauri/src/panel_hit_test.rs`：新增 Windows native `SetWindowRgn` irregular mask，region 只涵蓋 panel / arrow / shadow 必要區域；padding 維持 cursor pass-through。
- `src-tauri/src/panel.rs`：Windows 顯示 panel 前關閉 native shadow。
- `src/hooks/app/use-panel.test.ts`：補 native window mask bounds sync regression test。

## 驗證

- PASS：`bun run test --run src/hooks/app/use-panel.test.ts`，10 tests。
- PASS：`bun run build`。
- PASS：`cargo test panel_hit_test --lib`，8 tests。
- PASS：`cargo test --lib`，108 tests。
- PASS：`bun run test --run`，64 files / 1138 tests。
- PASS：本機 Windows NSIS package build，產出 `src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`。

## 驗收狀態

- Source / unit / package build：DONE。
- 安裝版滑鼠實機驗收：待使用者用新 installer 確認。

## 回報區

### 完成狀態
DONE

### 產出摘要

BUG-001 已完成第二輪修復。T0022 不建立 commit；目前變更停留在工作區，等待使用者驗收後再決定是否 commit / release。

### 補充

- 2026-05-24T17:03:28+08:00：依使用者補充，將原本 cursor event mask 升級為 native `SetWindowRgn` 不規則視窗遮罩，並關閉 Windows native undecorated shadow。

### 回報時間
2026-05-24T17:03:28+08:00
