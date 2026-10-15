---
schema_version: 1
schema_kind: workorder
id: T0067
title: Refit panel only after the drag ends (WM_EXITSIZEMOVE) + redact trace log path
status: PENDING
priority: High
type: bugfix
bug_id: BUG-016, BUG-018
plan_id: PLAN-006
created_at: "2026-10-15T17:51:22+08:00"
updated_at: "2026-10-15T17:51:22+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
affects_files:
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel_position.rs
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
---

# T0067 Refit Panel Only After The Drag Ends + Redact Trace Log Path

## 背景

T0062（PARTIAL）實機：T0055 的「使用者移動 → 150ms debounce → setSize」在**放開前停頓 ≥150ms** 時失效：

- 拖低停頓放開：放開後 14ms 視窗被還原成拖曳前高度（外框 B=2053 > 工作區 1368），之後不再修正。
- 先拖低、再拖回上方停頓放開：rect 卡在 H=353，**可見面板下半被截掉**（回歸）。

推測：滑鼠仍按住時（Windows modal move loop 中）`setSize`，放開時 move loop 套回拖曳開始尺寸；放開不產生新的使用者移動事件，所以不再 refit。

另 BUG-018：`panel-window-trace.log` 的 `trace_ready` 行含使用者名稱。

## ⚠️ 高風險區

`panel_hit_test.rs` native subclass（BUG-001 / T0031 / T0052）。只能**新增觀察**訊息並發事件；**不得**改變既有訊息的 return 值或 style 處理。

## 任務指令

1. 先查 Microsoft 文件 `WM_ENTERSIZEMOVE` / `WM_EXITSIZEMOVE`（拖曳 modal loop 進出），回報引用。
2. subclass 觀察 `WM_ENTERSIZEMOVE` → 標記「拖曳中」；`WM_EXITSIZEMOVE` → 清除標記並 emit `panel:drag-ended`（照常 `DefSubclassProc`，不改 return）。
3. 前端 refit 改為：**拖曳中不 setSize**；收到 `panel:drag-ended` 後（可小延遲例如 30–50ms 讓 Windows 完成最後的 SetWindowPos）依目前 top 重算高度上限並 setSize。T0055 的 `panel:user-moved` debounce 路徑移除或改為只在非 move loop 情況（例如程式外的其他移動）使用——以「放開後一定 refit 一次、拖曳中零 setSize」為準。
4. `panelPosition` 規則不變（存使用者拖曳結束位置，T0051 / T0055 行為）。
5. BUG-018：`trace_ready` 行的路徑改走既有 `redact_paths`（或只寫遮蔽形式），只改 log 字串。
6. macOS：上述 Windows 訊息不存在，維持現行行為（不得退步）；若前端移除 `panel:user-moved` 影響 macOS，保留 macOS 路徑。
7. 補測試（refit 觸發條件純函式；trace 路徑遮蔽）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`、`bun run test --run`、`bun run build`
- PASS：實機（release exe + `resources/`，cwd `%TEMP%`；控滑鼠前先問並留互動紀錄），每情境 ≥3 次：
  - 拖低**立即放開**、拖低**停頓 150ms / 500ms 放開** → 放開後 ≤500ms 視窗 rect 下緣 ≤ 工作區底，之後穩定。
  - 先拖低，再拖回上方**停頓 500ms 放開** → 高度恢復完整（首頁 620），無截短。
  - `panelPosition` = 拖曳結束位置；BUG-015（偏下開 Settings）不退步。
  - trace：`has_chrome_bits=true` 0 次；`WM_NCACTIVATE(0)` 仍 `result=1`；有 `WM_EXITSIZEMOVE` / drag-ended 紀錄；`trace_ready` 行無使用者名稱。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(windows): refit panel after drag ends, redact trace path (T0067)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、MS 文件引用、實機逐情境結果、trace 證據、偏差）
