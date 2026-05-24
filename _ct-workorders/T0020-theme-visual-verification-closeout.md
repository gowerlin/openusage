---
schema_version: 1
schema_kind: workorder
id: T0020
title: Theme visual verification closeout
status: PARTIAL
priority: Medium
type: verification
plan_id: PLAN-003
created_at: "2026-05-24T15:12:53+08:00"
updated_at: "2026-05-24T15:31:35+08:00"
started_at: "2026-05-24T15:15:00+08:00"
completed_at: "2026-05-24T15:31:35+08:00"
commit: 8fb84e04c31bfc12ab245a00372868a4f9c13628
agent: Codex
terminal_id: 384e603eb27165270d62dc82d269c9ae
intervention_type: fire-and-forget
depends_on:
  - T0018
  - T0019
affects_files:
  - _ct-workorders/PLAN-003-add-macaron-theme-presets.md
  - _ct-workorders/T0020-theme-visual-verification-closeout.md
  - src/lib/settings.ts
  - src/hooks/app/use-settings-theme.ts
  - src/pages/settings.tsx
  - src/index.css
  - src/lib/i18n.ts
  - screenshots/theme-visual-verification/**
---

# T0020 Theme Visual Verification Closeout

## 背景

T0019 已完成三個 macaron theme presets 實作，並回報 source tests / build 通過。PLAN-003 尚未完成的驗收項目是 visual smoke 與 screenshots。

## 任務

驗證 `macaron-pink`、`macaron-green`、`macaron-blue` 在主要 app surfaces 的視覺狀態，補齊 PLAN-003 closeout 所需 screenshots 與結論。

## 範圍

- 啟動 app，可用 browser dev server；若需要驗證 persistence，優先用 Tauri runtime。
- 在 Settings 切換三個 macaron themes。
- 驗證 reload / app restart 後 theme selection 仍保持；若 runtime 不可用，明確標記缺口。
- 擷取三個主題 screenshots，至少包含 Settings theme selector 與 app shell。
- 檢查 desktop viewport 與 compact viewport；若 compact viewport 無法跑，明確記錄原因。
- 檢查主要 UI surface：
  - app shell / side nav
  - Settings
  - overview / list-like surface
  - buttons / badges / focus ring / selected state
  - dialog / popover 若容易觸發
- 檢查是否有明顯文字重疊、低對比不可讀、互動狀態不清楚。

## 非範圍

- 不新增新的 theme preset。
- 不建立 theme editor。
- 不重做 layout。
- 不重構 design system。
- 若發現小型直接 regression，可修正並補測；若超出 visual closeout，建立後續工單並標記 PARTIAL。

## 驗證要求

- 若未修改 source code：
  - 不必重跑完整 test/build；記錄 T0019 已通過的 verification。
- 若修改 source code：
  - 至少跑相關 focused tests。
  - 視影響範圍跑 `bun run build`。
- 必須在工單回報中列出 screenshots 路徑與各主題結果。

## 收尾規則

- Visual smoke 全部通過：將 T0020 標記 DONE，並將 PLAN-003 收斂為 DONE。
- 有明確 visual regression 但已修復：標記 DONE，附 commit 與 verification。
- 有未解 visual regression 或 runtime gap：標記 PARTIAL / BLOCKED，保留 PLAN-003 IN_PROGRESS，並列出下一步。

## 回報區

### 完成狀態

PARTIAL

### 產出摘要

- 已用 Vite browser dev server 驗證 `macaron-pink`、`macaron-green`、`macaron-blue` 的 Settings、app shell、Home empty/list-like surface、selected button state。
- 發現 compact viewport 的 App Theme selector 文字重疊：`Macaron Pink / Green / Blue` 固定三欄時欄寬不足。
- 已修復 `src/pages/settings.tsx`：theme selector 改為 compact 2 欄、`sm` 以上 3 欄。
- 已補 `src/pages/settings.test.tsx` regression test：`uses two compact columns for theme options`。
- Source commit：`8fb84e04c31bfc12ab245a00372868a4f9c13628`

### Screenshots

- `screenshots/theme-visual-verification/openusage-macaron-pink-desktop-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-pink-desktop-home.png`
- `screenshots/theme-visual-verification/openusage-macaron-pink-compact-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-green-desktop-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-green-desktop-home.png`
- `screenshots/theme-visual-verification/openusage-macaron-green-compact-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-blue-desktop-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-blue-desktop-home.png`
- `screenshots/theme-visual-verification/openusage-macaron-blue-compact-settings.png`
- `screenshots/theme-visual-verification/openusage-macaron-blue-compact-about-dialog.png`
- Before fix：`screenshots/theme-visual-verification/openusage-macaron-blue-compact-theme-selector.png`
- After fix：`screenshots/theme-visual-verification/openusage-macaron-blue-compact-theme-selector-fixed.png`

### 各主題結果

- `macaron-pink`：desktop Settings / Home visual pass；root class `theme-macaron-pink`；tokens `--background #fff8fb`、`--primary #9d4668`。
- `macaron-green`：desktop Settings / Home visual pass；compact Settings no horizontal overflow；root class `theme-macaron-green`；tokens `--background #f8fffb`、`--primary #3f806c`。
- `macaron-blue`：desktop Settings / Home visual pass；compact Settings selector fixed；About dialog readable；root class `theme-macaron-blue`；tokens `--background #f7fbff`、`--primary #3d76a0`。

### 驗證

- PASS：`bun run test -- src/pages/settings.test.tsx --run`（22 tests）。
- PASS：`bun run build`（`tsc && vite build`；僅 Vite chunk size > 500 kB warning）。
- PASS：Playwright MCP visual smoke on `http://127.0.0.1:5173/` at desktop `1024x768` and compact `390x740`。
- PASS：Post-fix compact selector state：class `grid grid-cols-2 sm:grid-cols-3 gap-1`，`overflowX=false`。

### 遭遇問題

- Browser plugin Node REPL runtime unavailable in this session；改用 Playwright MCP fallback。
- Browser dev server is not Tauri runtime；console has expected Tauri API errors (`invoke`, `transformCallback`, Store save) outside WebView.
- 因上述 runtime gap，未驗證 Tauri reload / app restart 後 theme persistence；PLAN-003 保持 `IN_PROGRESS`。
- `bun test src/pages/settings.test.tsx --runInBand` 不是 repo runner，因無 jsdom 失敗；已改用 `bun run test -- ... --run`。

### 互動紀錄

無

### Renew 歷程

無

### 回報時間

2026-05-24T15:31:35+08:00
