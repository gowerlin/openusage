---
schema_version: 1
schema_kind: workorder
id: T0042
title: Fix ccusage runner discovery on Windows (Usage Trend)
status: DONE
priority: High
type: bugfix
bug_id: BUG-006
plan_id: PLAN-004
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T13:28:45+08:00"
started_at: "2026-10-15T13:19:45+08:00"
completed_at: "2026-10-15T13:28:45+08:00"
commit: 1a439dcc
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

### 狀態

DONE — 全部 gate PASS。Windows 實機上 Claude 詳細頁出現 今天 / 昨天 / 過去 30 天 / 用量趨勢；log 沒有 `no package runner found`；bun.exe 與 `.cmd` 兩條路徑執行期間都沒有 console 視窗。

### Landing Zone

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage` → WARN "repo identity unavailable"，改用 C-3 + C-1。
- C-1：PASS。C-3：`src-tauri/src/plugin_engine/host_api.rs` 存在 → PASS。C-2：沒有 `branch` 欄位。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（只記錄）。`CT_MODE=yolo`。

### 改動（`src-tauri/src/plugin_engine/host_api.rs`）

- 新增 `ccusage_windows_runner_candidates`；`ccusage_runner_candidates` 在 `cfg!(windows)` 時改用它（runtime 判斷，函式兩平台都編譯，測試在 macOS 也會跑）。非 Windows 清單不變。
- Windows candidate 清單（依 runner 順序；裸檔名靠 enriched PATH 查找，含 `~/.bun/bin`；不寫死使用者路徑）：

  | Kind | Candidates |
  |---|---|
  | Bunx | `bunx.exe`, `bun.exe` |
  | PnpmDlx | `pnpm.cmd`, `pnpm.exe` |
  | YarnDlx | `yarn.cmd` |
  | NpmExec | `npm.cmd` |
  | Npx | `npx.cmd`, `npx.exe` |

- 新增 `ccusage_command_args`：Bunx kind 且 program 檔名 stem 是 `bun`（不分大小寫）時前置 `x` → `bun.exe x --silent ccusage@20.0.2 …`。`run_ccusage_with_runner_timeout` 改用它。`ccusage_runner_args` 本身不變。
- `cargo fmt` 順手修了同檔一行既有格式漂移（`redact_body_redacts_devin_request_metadata_api_key` 的 `let body =` 換行）。HEAD 上 `cargo fmt --check` 原本就會失敗，不修 gate 過不了。
- 新增測試（3 個在 Windows 跑，macOS 另有 1 個 `cfg(not(windows))`）：
  - `ccusage_windows_runner_candidates_use_shims`（全平台）
  - `ccusage_runner_candidates_use_windows_shims_on_windows`（Windows）
  - `ccusage_runner_candidates_keep_unix_names_off_windows`（非 Windows）
  - `ccusage_command_args_use_bun_x_for_bun_binary`（全平台；bun / bun.exe / `/tools/Bun.EXE` 前置 `x`，bunx 系不變，npx 不受影響）
- redaction 沒動；`redact_*` 測試全過。

### 第 3 步：`.cmd` 執行與 `CREATE_NO_WINDOW`

- Toolchain `rustc 1.98.0` ≥ 1.77 → std 對 `.cmd`/`.bat` 參數有安全跳脫（CVE-2024-24576 修正）。我們的參數只有套件 spec、旗標、`YYYYMMDD` 日期，沒有 `%` 或引號；home 路徑走 env 不走參數。
- 可用性檢查走 `background_command`、實際執行走 `configure_ccusage_command`，兩者都呼叫 `hide_background_command_window` → `CREATE_NO_WINDOW`。`.cmd` 由 std 透過 `cmd.exe /c` 啟動，同樣帶這個 flag。
- scratch Rust probe（`Command` + `0x08000000`，cwd `%TEMP%`）實測：
  - `npx` → `program not found`（就是 BUG-006 根因）
  - `npx.cmd` / `npm.cmd` / `yarn.cmd` / `bun.exe` `--version` → OK；`bunx.exe` / `pnpm.cmd` → not found（本機沒有）
  - `npx.cmd --yes ccusage@20.0.2 claude daily --json …` → exit 0，有 daily JSON（1635ms）
  - `npm.cmd exec --yes --package=ccusage@20.0.2 -- ccusage …` → exit 0，有 daily JSON（1112ms）
  - `bun.exe x --silent ccusage@20.0.2 …` → exit 0，有 daily JSON（806ms）

### 第 4 步：沒有 runner 時的前端行為（只回報，沒改）

- Host 回 `{"status":"no_runner"}` 並記 WARN。claude / codex plugin 收到 `no_runner` 就**不輸出** token 相關 lines（`plugins/claude/plugin.test.js:1519`、`plugins/codex/plugin.test.js:363`「omits token lines when ccusage reports no_runner」）。
- 所以現況是**靜默隱藏**：詳細頁只剩 工作階段 / 每週，沒有說明文字。依工單不擴大改 UI。

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `cargo test --locked` | PASS | 141 passed / 0 failed（原 138 + 新增 3） |
| `bun run test --run` | PASS | 68 files / 1196 tests passed |
| `bun run build` | PASS | exit 0（只有既有的 chunk > 500 kB 提示） |
| Windows 實機：詳細頁 | PASS | UIA：`今天 $37.98 · 97M tokens`、`昨天 $213.36 · 597M tokens`、`過去 30 天 $5165.74 · 13B tokens`、`用量趨勢：25 天，最近 97M tokens（10/15），峰值 1.7B tokens。`；截圖 `_ct-workorders/assets/T0042/claude-detail-usage-trend.png` |
| Windows 實機：log | PASS | 兩輪都沒有 `no package runner found`；見下方 |
| Windows 實機：console | PASS | 3 次取樣都沒有 console / conhost / cmd 視窗；見下方 |

### 實機 smoke 方法

- 環境：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，PowerShell `cmd.exe /c`。`bun tauri build --target x86_64-pc-windows-msvc --no-bundle` → `src-tauri\target\x86_64-pc-windows-msvc\release\openusage.exe`（20,582,400 bytes，0.6.29）。
- 先停使用者的 0.6.27（pid 17036），備份 `settings.json`（SHA256 `FEB5A18937EEF5F08ADB26BE168A0D5FBEFA7BB500DC63A9866ED5772110AD89`），暫時加 `logLevel: "info"` 讓 runner 的 INFO log 看得到。
- release exe cwd = `%TEMP%`。第二次啟動（single-instance）叫出面板，UIA Invoke 左側「Claude」進詳細頁，dump UIA 樹。
- Console 取樣：獨立 pwsh 跑 `EnumWindows`，每輪 sleep 50ms（含列舉開銷實際約 63ms/次），記錄新出現的可見頂層視窗與 process 名。

| 輪次 | Runner 路徑 | Log | 取樣 | 新可見視窗 |
|---|---|---|---|---|
| 1：一般 PATH | `bun.exe`（choco，沒有 bunx） | `ccusage query via bunx Current (bun.exe)` ×2 → `probe claude completed ok (11 lines)`、`probe codex completed ok (5 lines)` | 75s / 1189 次 | openusage ×3（siw、Tao event target、Tauri panel）、msedge ×2；沒有 console |
| 2：PATH 拿掉 `chocolatey\bin` | `yarn.cmd`（yarn classic 不支援 dlx，`Couldn't find a package.json`，快速失敗）→ `npm.cmd` | `ccusage query via npm exec Current (npm.cmd)` ×2 → claude 11 lines、codex 5 lines | 75s / 1186 次 | openusage ×3；沒有 console |
| 3：同輪 2，面板可見時按「重試」 | yarn.cmd → npm.cmd | `probe claude completed ok (11 lines)` | 25s / 396 次 | LINE tooltip、msedge；沒有 console |

- 輪 2 詳細頁 UIA 同樣有 今天 / 昨天 / 過去 30 天 / 用量趨勢。

### 清理

- 已停 release process；`settings.json` 從備份還原，SHA256 與備份一致；已重新啟動 0.6.27（`C:\Users\Gower\AppData\Local\OpenUsage\openusage.exe`，pid 2288）。
- 沒有殘留 ccusage process。沒改 registry。只停過 OpenUsage。
- 截圖已裁掉面板外的透明角（原圖角落透出背後終端機文字）。

### 偏離 / 觀察（不在本單範圍）

- 沒改 plugin JS、沒改 ccusage 版本。
- yarn classic（1.x）的 `yarn.cmd` 會被判定可用，但 `yarn dlx` 一定失敗，每次 probe 多 2 次快速失敗 + 2 行 WARN 才 fallback 到 npm。macOS 同樣行為（既有設計）。不影響結果。
- 風險：Windows timeout 時 `kill_ccusage_on_timeout` 只 `child.kill()` 掉 `cmd.exe`，`.cmd` 底下的 node 孫程序不會被殺，且它持有 stdout/stderr pipe，reader thread `join` 可能等到 node 自己結束。正常 ccusage 1–2 秒就完成，這次沒遇到。若要處理需 Job Object 或 `taskkill /T`，建議塔台另開單評估。

### Commit

- 見 frontmatter `commit`（`host_api.rs` + 本工單 + 截圖，未 push）。
