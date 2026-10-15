---
schema_version: 1
schema_kind: workorder
id: T0069
title: Side-nav button to launch the TokenUsageInsights dashboard in the background
status: PENDING
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-007
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T18:42:22+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0063
affects_files:
  - src-tauri/src/token_dashboard.rs
  - src-tauri/src/lib.rs
  - src-tauri/src/plugin_engine/host_api.rs
  - src-tauri/capabilities/default.json
  - src/components/side-nav.tsx
  - src/components/side-nav.test.tsx
  - src/lib/i18n.ts
  - README.md
---

# T0069 Side-Nav Button To Launch The TokenUsageInsights Dashboard

## 背景

PLAN-007。[doggy8088/TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights)（MIT）：
- 一行啟動：`npx --yes token-usage-insights`（Node.js ≥ 18.18），看板在 `http://localhost:3003`。
- Windows 安裝腳本會建立 `%USERPROFILE%\bin\token-usage-insights.cmd`；unix 為 `$HOME/.local/bin/token-usage-insights`。
- README：以背景 runner 執行時**不會**自動開瀏覽器 → 由 OpenUsage 開。
先讀其 README（`gh api repos/doggy8088/TokenUsageInsights/readme`）確認 port 是否可設定、是否有健康檢查路徑，回報引用。

## 使用者決策（不得更改）

見 PLAN-007：已安裝優先否則 npx；不自動跑遠端安裝腳本；未執行 → 啟動 + 等就緒 + 開瀏覽器，已執行 → 開瀏覽器；無終端視窗、不佔工作列；關閉 OpenUsage 時結束自己啟動的背景程式。

## 任務指令

### Rust（新模組 `src-tauri/src/token_dashboard.rs`，保持 <~400 LOC）

1. Tauri command `launch_token_dashboard` → 回傳結果型別（`Opened` / `Started` / `NotInstalled{hint}` / `Failed{reason}`，AGENTS.md：預期問題用 explicit result type）。
2. 就緒判斷：連 `127.0.0.1:3003`（TcpStream，短 timeout）。已可連 → 視為已執行（可能是使用者自己開的），**不 spawn、不納入管理**，直接開 `http://localhost:3003`。
3. 選執行檔：Windows `%USERPROFILE%\bin\token-usage-insights.cmd` 存在 → 用它；否則找 `npx.cmd`（沿用 T0042 的 Windows runner 查找方式）→ `npx.cmd --yes token-usage-insights`。unix 對應 `~/.local/bin/token-usage-insights` / `npx`。都沒有 → `NotInstalled`（提示需要 Node.js 18.18+ 或安裝腳本，附 README 連結）。
4. 啟動：沿用既有背景指令 helper（`CREATE_NO_WINDOW`，BUG-002）+ **T0046 的 Job Object（`KILL_ON_JOB_CLOSE`）**；把 job 與 child 存在 app state（`Mutex<Option<…>>`）。unix 用既有 process group 方式。stdout / stderr 導到 OpenUsage log（遮蔽路徑，BUG-009）或丟棄，不得造成 pipe 阻塞。
5. 等就緒：輪詢 3003，上限 90 秒（npx 首次下載可能慢）；逾時 → 結束剛啟動的程序樹、回 `Failed`。期間若子程序提前結束 → 回 `Failed`（含 exit code）。
6. 開瀏覽器：沿用既有 opener（`tauri-plugin-opener`）開 `http://localhost:3003`。
7. 第二個 command `token_dashboard_status` → `{ running: bool, managed: bool }` 供按鈕顯示「執行中」。
8. **結束清理**：`RunEvent::Exit`（及 app 結束路徑，例如 tray Quit、updater relaunch 前）主動 `TerminateJobObject` / kill process group；Job Object 的 `KILL_ON_JOB_CLOSE` 作為當機時的保底。只結束 OpenUsage 自己啟動的。
9. 防重入：啟動中再按一次 → 不重複 spawn，等待同一個啟動結果。

### 前端

10. `side-nav.tsx`：在 ❓ 上方加按鈕（lucide 看板類圖示，例如 `LayoutDashboard` / `ChartColumnBig`，跟隨主題色），`aria-label` / tooltip「Token 戰情室」（en：`Token Dashboard`）；啟動中顯示 spinner / disabled；`running` 時顯示小圓點標記。
11. 結果處理：`NotInstalled` / `Failed` → `toast.error`（fail loud）並在 console.error；`NotInstalled` 提示附「安裝說明」連結（開 README）。成功開瀏覽器後收起面板（比照 ❓ 的 `hide_panel` 行為）。
12. i18n：新增 key（zh-TW / en）。

### 其他

13. capabilities：若新 command 需要權限宣告，照專案既有做法加入。
14. README：在功能說明加一行 Token 戰情室按鈕（附上游連結與授權 MIT）。
15. 安全：不執行任何遠端腳本；只執行固定的兩種命令；參數固定不含使用者輸入。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`（純函式：執行檔選擇、結果對映、就緒判斷 mock）
- PASS：`bun run test --run`（side-nav 按鈕、各結果 toast）、`bun run build`
- PASS：實機（release exe + `resources/`，cwd `%TEMP%`；本機若有 Node / npx）：
  - 按下 → 背景啟動（無 console 視窗，比照 BUG-002 取樣法；工作列無新按鈕）→ 3003 就緒 → 預設瀏覽器開 `localhost:3003`。
  - 再按 → 不重複啟動，直接開瀏覽器；按鈕顯示執行中。
  - 關閉 OpenUsage（tray Quit）→ token-usage-insights 及其 node 子程序全部結束（`Get-Process` 證據）；強制結束 OpenUsage（`Stop-Process`）→ Job Object 保底也全部結束。
  - 預先手動開一個 3003 看板 → OpenUsage 只開瀏覽器，關閉 OpenUsage **不**結束該程序。
  - 讓 npx 不可用（只對測試 process 改 PATH）→ toast 顯示需要 Node.js 的提示。
- 瀏覽器分頁測後只關該分頁；不改使用者瀏覽器設定。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`feat: launch TokenUsageInsights dashboard from side nav (T0069)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、上游 README 引用、實機逐項結果、偏差）
