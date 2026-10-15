---
schema_version: 1
schema_kind: workorder
id: T0055
title: Keep panel inside work area right after dragging low
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-016
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:29:08+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0054
affects_files:
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/panel_position.rs
---

# T0055 Keep panel inside work area right after dragging low

## 背景

BUG-016（T0053 觀察 1）：拖到偏下（top=1003）後，首頁高度維持 620，下緣到 1623，超出螢幕（1440），直到下次 show 才夾回。T0051 已讓高度上限依「工作區底 − 視窗 top」計算，但只在內容 resize 時重算，拖曳移動不會觸發。

## 任務指令

1. 視窗被使用者移動（非程式移動，沿用 T0051 的 `PROGRAMMATIC_MOVE` 判斷）後，重新計算高度上限並 `setSize`（前端可監聽 Tauri `onMoved`，加 debounce 例如 150ms，避免拖曳中頻繁 resize）。內容超出時面板內捲動。
2. **不移動視窗位置**、不改 `panelPosition` 規則（存使用者拖曳結果）。
3. macOS 行為：同一套上限計算，不另分平台。
4. 補測試（debounce / 觸發條件抽純函式）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（若動 Rust）、`bun run test --run`、`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`，控滑鼠前先問）：拖到偏下 → 放開後 ≤500ms 內面板下緣 ≤ 工作區底；`panelPosition` = 拖曳結束位置；拖回上方高度恢復；BUG-015 行為不退步。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(windows): refit panel height after drag (T0055)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、上游引用、驗證證據、偏差）
