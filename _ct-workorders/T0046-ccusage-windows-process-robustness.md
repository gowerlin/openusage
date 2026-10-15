---
schema_version: 1
schema_kind: workorder
id: T0046
title: ccusage Windows process tree kill, skip yarn classic, remove dead code
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-010
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:48:15+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0045
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/src/config.rs
---

# T0046 ccusage Windows process tree kill, skip yarn classic, remove dead code

## 背景

BUG-010（T0042 回報）三項。

## 任務指令

1. **Process tree kill（Windows）**：timeout 時結束整個樹。
   - 方案 1（優先）：Windows Job Object（`windows` crate 已是依賴；`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`，spawn 後 `AssignProcessToJobObject`），timeout 時 `TerminateJobObject`。
   - 方案 2：`taskkill /T /F /PID <pid>`，經既有 `CREATE_NO_WINDOW` helper 執行。
   - 先查 Microsoft 文件，回報引用與選擇理由。確保 reader thread 不會因孫程序持有 pipe 而卡住。非 Windows 行為不變。
2. **yarn classic**：yarn 主版號 < 2 時不視為 dlx runner；偵測結果放進既有 availability cache，不得明顯增加 probe 延遲。
3. **Dead code**：移除未使用的 `run_ccusage_with_runner`（確認無呼叫端與測試依賴）。
4. **BUG-009 剩餘（D077）**：
   - `src-tauri/src/config.rs:62` 的 `log::debug!` 直接寫出完整 config 路徑（含使用者名稱）→ 改走 `redact_log_message`，或只 log `~/.openusage/config.json`。
   - `redact_paths()` 的 Windows / Unix 規則遇空白就停，`C:\Users\John Smith\...` 只遮到 `John`。讓使用者名稱這一段可含空白（例如名稱段比對到下一個路徑分隔符為止），Unix `/Users/<name>`、`/home/<name>` 同樣處理；`Users: 3 at 10:30` 這類一般文字不得誤遮。補測試。
5. 補測試（純函式部分；Job Object 以 Windows-only 測試或實機證據）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`（無 dead_code 警告）、`cargo test --locked`
- PASS：`bun run test --run`、`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`）：人為製造 timeout（暫時調整的測試 build 或會掛住的假 runner）→ timeout 後無殘留 ccusage node、app 不卡。暫時調整**不得 commit**。一般情況 Usage Trend 仍顯示、無 console 視窗（BUG-002）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`fix(windows): ccusage process tree kill and runner cleanup (T0046)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
