---
schema_version: 1
schema_kind: workorder
id: T0052
title: Hide panel on blur when only WM_NCACTIVATE(0) arrives
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-013
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0051
affects_files:
  - src-tauri/src/panel_blur.rs
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel.rs
---

# T0052 Hide panel on blur when only WM_NCACTIVATE(0) arrives

## 背景

BUG-013（T0044 觀察 1）：一次失焦未收起，trace 只有 `WM_NCACTIVATE(0)`（`message=0x0086 wparam=0x0`），沒有 `Focused(false)`。BUG-008 的收起只掛在 `Focused(false)`。

## ⚠️ 高風險區（BUG-001）

`panel_hit_test.rs` 的 native subclass（T0031）攔 `WM_NCACTIVATE` 並 return `1` 以避免 inactive title bar 重繪。**不得改變該 return 行為**；只能在攔截時「額外」排程既有的 150ms blur 檢查。

## 任務指令

1. 在 subclass 處理 `WM_NCACTIVATE` 且 `wParam == 0` 時（以及若適用 `WM_ACTIVATE` 的 `WA_INACTIVE`），呼叫 `panel_blur` 既有的延遲檢查入口（同一個 150ms + `GetForegroundWindow` / `GA_ROOTOWNER` 判斷 + tray debounce），讓兩條路徑走同一套邏輯；避免重複排程造成雙重 hide（可用既有狀態去重）。
2. subclass 在 wndproc 內，不可阻塞；用既有 main-thread 排程方式（`run_on_main_thread` 或等效）。
3. 先查 Microsoft 文件 `WM_NCACTIVATE` / `WM_ACTIVATE` 的 wParam 語意，回報引用。
4. 補純函式測試（例如 `should_schedule_blur_check(msg, wparam)`）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`
- PASS：`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`；控制滑鼠前先詢問使用者）：
  - 點工作列空白 / 溢位 chevron / 其他視窗 / 桌面：面板收起（每種 ≥3 次）。
  - tray 連點無閃爍、拖曳 / About / Settings 捲動不誤收、第二次啟動面板停留（BUG-004/008 不退步）。
  - trace：deactive 後 `has_chrome_bits=true` 0 次（BUG-001）；新增 log 證明 `WM_NCACTIVATE(0)` 路徑有觸發檢查。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：`fix(windows): also check blur on WM_NCACTIVATE(0) (T0052)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
