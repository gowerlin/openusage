---
schema_version: 1
schema_kind: workorder
id: T0072
title: Toggle panel only on tray left-click
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-019
plan_id: PLAN-007
created_at: "2026-10-15T19:14:33+08:00"
updated_at: "2026-10-15T19:14:33+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0069
affects_files:
  - src-tauri/src/tray.rs
---

# T0072 Toggle Panel Only On Tray Left-Click

## 背景

BUG-019：`tray.rs:213` `TrayIconEvent::Click { button_state, rect, .. }` 只判斷 `Up`，右鍵也 toggle 面板，蓋住 tray 右鍵選單。

## 任務指令

1. 只在 `button == MouseButton::Left && button_state == MouseButtonState::Up` 時 `toggle_panel_at_tray_icon`。查 Tauri v2 `TrayIconEvent` 文件確認欄位，回報引用。
2. 確認 tray 選單（`menu_on_left_click` 等設定）仍只在右鍵出現；macOS 行為不變（macOS 若原本左鍵即 toggle、右鍵出選單，維持）。
3. 抽純函式（例如 `should_toggle_on_tray_click(button, state)`）補測試。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`、`bun run build`
- PASS：實機（release exe + `resources/`，cwd `%TEMP%`；控滑鼠前先問）：tray 右鍵 → 只出選單、面板不變（開著 / 關著兩種起始狀態各 3 次）；選單「Copy Log Path」「Quit」可點；左鍵連點開 / 關正常無閃爍（BUG-008）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(tray): toggle panel only on left-click (T0072)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、文件引用、實機結果、偏差）
