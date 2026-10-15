---
schema_version: 1
schema_kind: workorder
id: T0042
title: Fix ccusage runner discovery on Windows (Usage Trend)
status: PENDING
priority: High
type: bugfix
bug_id: BUG-006
plan_id: PLAN-004
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T13:18:05+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0040
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
---

# T0042 Fix ccusage Runner Discovery On Windows

## 背景

BUG-006：T0040 smoke 發現 Windows 上 Usage Trend / Today / Yesterday / Last 30 Days 不顯示，log `no package runner found for ccusage query`。根因：`host_api.rs` `ccusage_runner_candidates`（約 L1849）只列 Unix 名稱；Windows `Command::new("npx")` 不會找 `npx.cmd`。本機實況：`C:\nvm4w\nodejs\npx.cmd`、choco `bun.exe`（無 `bunx.exe`）。

## 任務指令

1. 先讀現有 runner 偵測與執行流程（`CcusageRunnerKind`、availability check、實際 spawn），以及 fork 的 Windows 背景指令 helper（T0013 / BUG-002 `CREATE_NO_WINDOW`）。
2. Windows 補候選（`#[cfg(windows)]` 或 runtime 判斷，跟隨檔內既有寫法）：
   - npx：`npx.cmd`（及 `npx.exe` 若存在）。
   - bun：`bunx.exe`、以及 `bun.exe` + `x` 子命令（bun 沒有 bunx shim 時）。
   - pnpm / yarn 若檔內有對應 kind，同樣補 `.cmd`。
   - 不寫死使用者路徑（不加 `C:\nvm4w\...`）；依 PATH 查找即可。
3. `.cmd` / batch 執行：確認 Rust std 的 batch 參數跳脫行為（Rust ≥1.77 對 `.cmd`/`.bat` 有安全跳脫）適用本專案 toolchain；**必須**經既有 `CREATE_NO_WINDOW` helper 執行，不得跳 console（BUG-002）。
4. 找不到任何 runner 時：維持現行 WARN，但確認前端行為明確（不是空白卡片無說明）；若目前是靜默隱藏，回報現況即可，不擴大範圍改 UI。
5. 測試：補 Windows candidate 清單的單元測試（比照檔內現有 runner 測試）；redaction 不受影響。

## 明確排除

- 不改 ccusage 版本、不改 plugin JS（claude / codex）除非 runner 修正後發現必要（需在回報說明）。
- 不 push、不 tag、不發行。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（≥138）
- PASS：`bun run test --run`、`bun run build`
- PASS：**Windows 實機**：`bun tauri dev` 或 release build 執行（cwd `%TEMP%` 避免讀 repo plugins），Claude 詳細頁出現 Today / Yesterday / Last 30 Days / Usage Trend；log 不再出現 `no package runner found`；執行期間無 console 視窗（比照 T0040 每 50ms 取樣法）。
- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH` + `CI=false`，PowerShell `cmd.exe /c`。
- **不得**停止使用者正在執行的 OpenUsage 以外的程式；若需停 OpenUsage 0.6.27，事後重新啟動並還原 `settings.json`（比照 T0040）。不改 registry。

## 收尾

- Commit：`fix(windows): discover ccusage runners on Windows (T0042)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、candidate 清單、實機截圖或 UIA 證據、console 取樣結果）
