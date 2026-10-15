---
schema_version: 1
schema_kind: workorder
id: T0046
title: ccusage Windows process tree kill, skip yarn classic, remove dead code
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-010
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:48:39+08:00"
started_at: "2026-10-15T13:48:39+08:00"
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

### 狀態

DONE。所有 gate PASS。

### 落點檢查

- C-0：WARN — 工單無 `repo` 欄位（`absent`）；`basename(REPO_ROOT)` = `openusage`。依 C-3 + C-1 判定。
- C-1：PASS — 工單在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下。
- C-3：PASS — 4/4 `affects_files` 存在。
- C-2：N/A（無 `branch` 欄位），HEAD = `main`。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。`CT_MODE=yolo`。

### 改動

| 檔案 | 內容 |
|---|---|
| `src-tauri/src/plugin_engine/host_api.rs` | 1) `CcusageJob`：Windows Job Object（`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`），spawn 後 `AssignProcessToJobObject`；timeout 時 `TerminateJobObject`；正常結束時先 drop job（結束仍持有 pipe 的孫程序）再 join reader。非 Windows 為空 struct，unix 照舊 `kill(-pgid)`。job 建立失敗 → WARN + 退回 `child.kill()`。 2) `yarn_version_supports_dlx`：yarn 主版號 < 2 不算 runner；`ccusage_runner_available` 多帶 `kind`，只有 yarn 讀既有 `--version` 的 stdout（同一次 spawn）。 3) 刪除 `run_ccusage_with_runner`；unix 測試改直接呼叫 `run_ccusage_with_runner_deadline(..., ProbeDeadline::none())`。 4) `redact_paths()`：Windows 名稱段可含空白（需後接分隔符）；新增 `/Users\|home/<含空白名稱>/` 規則。 5) 新測試 4 個（見下）。 |
| `src-tauri/Cargo.toml` | `windows` features 加 `Win32_Security`（`CreateJobObjectW` 需要）、`Win32_System_JobObjects`、`Win32_System_Threading`（`JOBOBJECT_EXTENDED_LIMIT_INFORMATION` 需要）。 |
| `src-tauri/Cargo.lock` | 未變（只加 features，無新 crate）。 |
| `src-tauri/src/config.rs` | 新常數 `CONFIG_PATH_LABEL = "~/.openusage/config.json"`；`:62` debug 與 `:53` parse-fail warn 都改 log 這個字串，不再 `path.display()`。 |

### 方案選擇（Job Object vs taskkill）

選方案 1 Job Object。Microsoft 文件依據：

- AssignProcessToJobObject（https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-assignprocesstojobobject）："By default, all child processes are associated with the immediate job and every job in the parent job chain." → `cmd.exe` 之後產生的 node / ccusage 自動在 job 內。另：Windows 8+ 起 process 可屬於 nested jobs（app 本身在別的 job 下仍可指派）。
- JOBOBJECT_BASIC_LIMIT_INFORMATION（https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information）：`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` "Causes all processes associated with the job to terminate when the last handle to the job is closed. This limit requires use of a JOBOBJECT_EXTENDED_LIMIT_INFORMATION structure."
- TerminateJobObject（https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-terminatejobobject）："Terminates all processes currently associated with the job." "It is not possible for any of the processes associated with the job to postpone or handle the termination."
- taskkill（https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill）：`/t` "Ends the specified process and any child processes started by it."

理由：Job 不靠 parent PID 走樹（中間層先結束時 taskkill `/T` 會漏掉孤兒、且有 PID 重用風險），不需再 spawn 外部程式，KILL_ON_JOB_CLOSE 讓任何 return 路徑都會清掉樹。
已知限制：std `Command` 不能 CREATE_SUSPENDED 後再 resume，所以指派發生在 spawn 之後；空窗是微秒級，`cmd.exe` 讀批次檔、啟動 node 遠慢於此。

### 驗證證據

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| build/test | `cargo fmt --check` | PASS | exit 0 |
| build/test | `cargo check --all-targets` | PASS | 無 warning（只有 `cargo test` 時 MSVC linker 的「正在建立程式庫」`linker_messages` 雜訊，跟 dead_code 無關，之前就有） |
| build/test | `cargo test --locked` | PASS | 149 passed / 0 failed（新增 `redact_paths_masks_user_names_with_spaces`、`redact_paths_does_not_swallow_text_after_user_dir`、`yarn_dlx_requires_yarn_2_or_newer`、Windows-only `ccusage_timeout_kills_windows_job_tree_and_closes_pipes`） |
| build/test | 反向對照 | PASS | 暫時讓 job 建立失敗（不呼叫 assign）→ 新 Windows 測試 FAIL：`took 29.293813s`（背景 ping 孫程序持有 pipe，reader 卡住）；還原後 1.02s PASS，前後 `PING.EXE` 殘留 0。原始碼 hash 還原比對 True。 |
| build/test | `bun run test --run` | PASS | 68 files / 1196 tests |
| build/test | `bun run build` | PASS | exit 0（只有既有 chunk > 500 kB 提示） |
| runtime | 實機 timeout（暫時 build `CCUSAGE_TIMEOUT_SECS=1`，未 commit） | PASS | release exe，cwd `%TEMP%`，PATH 拿掉 `chocolatey\bin`（bun 太快，1s 不會 timeout）。Log：`[plugin:claude] ccusage timed out after 1s for npm exec` → `skipping fallback runners` → `probe claude completed ok (2 lines)`。程序樹 `cmd.exe`(42264) → `node.exe`(38248)：t+2s 還在，t+3s 之後 ccusage 相關程序 0；app 全程 `Responding=True`。 |
| runtime | 實機一般版：Usage Trend | PASS | release exe + bundled resources，cwd `%TEMP%`。bun 路徑：`probe claude completed ok (11 lines)`；UIA：`用量趨勢：25 天，最近 130M tokens（10/15），峰值 1.7B tokens。`、`今天 $50.62 · 130M tokens`、`昨天`、`過去 30 天`。 |
| runtime | yarn classic 跳過 | PASS | 本機 `yarn.cmd --version` = `1.22.22`。PATH 拿掉 bun 時 log 直接 `ccusage query via npm exec`，沒有 `yarn dlx`（T0042 同情境先試 `yarn.cmd` 失敗才 fallback）。 |
| runtime | 無 console（BUG-002） | PASS | npm.cmd 路徑（10 個 cmd/node/ccusage 程序）並行取樣 226 次，新可見 console 類視窗 0；bun 路徑 UIA 期間 200 次取樣 0；ccusage 程序底下 conhost 0。 |
| runtime | config 路徑遮罩 | PASS | 實機 log：`[config] no config file at ~/.openusage/config.json, using defaults`。 |
| runtime | 無殘留 | PASS | 收尾時 ccusage 相關程序 0。 |
| source | unix 分支 | 未在本機編譯 | 只裝 `x86_64-pc-windows-msvc` target。unix 程式碼路徑沒變（`kill_ccusage_process_group` 照舊；`CcusageJob` 在 unix 是空 struct，drop 不做事），由 CI 驗證。 |

### 環境 / 清理

- VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH` + `CI=false`，PowerShell `cmd.exe /c`。`bun tauri build --no-bundle` 兩次（一般版 / 暫時 timeout 版），exe 複製到 scratchpad 執行；沒覆蓋 `%LOCALAPPDATA%/OpenUsage/openusage.exe`（hash 前後一致）。
- 停過使用者的 OpenUsage（pid 29736）。`settings.json` 備份 SHA256 `1F5230ACA5040B2AA615EED1A77F363F6CA0896058999629450B3C965319D020`；smoke 時暫時加 `logLevel: "info"`。收尾已還原，SHA256 一致；已重啟已安裝版（pid 36284，cwd = 安裝目錄），重啟後 SHA256 仍一致。
- 沒改 registry。沒 push / tag / 發行。

### 偏差

1. 工單說「偵測結果放進既有 availability cache」：程式碼裡**沒有** runner availability cache（每次 query 都跑 `--version`）。改成重用既有 `--version` probe 的輸出判斷版本 → 不多 spawn、不增加 probe 延遲。沒有新加 cache（避免擴大範圍）。
2. 工單說「確認無呼叫端與測試依賴」：`run_ccusage_with_runner` 其實是 `#[cfg(test)]`，被 unix 測試 `ccusage_runner_retries_legacy_package_when_current_package_fails` 使用（Windows 上沒人用 → dead_code）。處理：刪除 wrapper，該測試改直接呼叫 `run_ccusage_with_runner_deadline(..., ProbeDeadline::none())`，測試涵蓋不變。
3. `config.rs:53`（parse 失敗的 warn）也印完整路徑，一併改成 `CONFIG_PATH_LABEL`（同檔、同一類問題）。
4. 實機 smoke 第一輪把 exe 單獨複製出去、沒帶 `resources/`，載入的是 AppData 裡已安裝版的舊 plugin（沒有 `barChart`，只有 5 lines）；補複製 `resources` 後重跑才是正確結果（上表）。
5. 收尾時第一次重啟已安裝版用了 `src-tauri` 當 cwd，`find_dev_plugins_dir` 撿到 repo `../plugins`（有 `mock`），讓 settings.json 被改寫；已停掉、重新還原、改用安裝目錄當 cwd 重啟，SHA256 一致。另：release 版啟動時 `remove_retired_bundled_plugins` 會刪 AppData 的 `windsurf` plugin 目錄，已安裝版重啟後已複製回來（`plugins\windsurf` 存在）。

### 給塔台的觀察（不在本單範圍）

- 從 repo 目錄（cwd 下有 `plugins/` 或 `../plugins/`）啟動**正式安裝版**也會進 dev plugins 模式並改寫使用者 settings。之後的 smoke 工單應寫明「已安裝版要用安裝目錄當 cwd 啟動」。
- 非 bundle 的 release exe 若搬離 `target/release`，要連 `resources/` 一起帶，不然 plugin 版本會是舊的。

### Commit

見 frontmatter `commit`。
