---
schema_version: 1
schema_kind: workorder
id: T0069
title: Side-nav button to launch the TokenUsageInsights dashboard in the background
status: DONE
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-007
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T19:13:05+08:00"
started_at: "2026-10-15T18:49:19+08:00"
completed_at: "2026-10-15T19:13:05+08:00"
commit: 2de48d7b
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
3. 選執行檔：Windows `%USERPROFILE%\bin\token-usage-insights.cmd` 存在 → 用它；否則找 `npx.cmd`（沿用 T0042 的 Windows runner 查找方式）→ `npx.cmd --yes token-usage-insights@latest`（D111）。unix 對應 `~/.local/bin/token-usage-insights` / `npx`。都沒有 → `NotInstalled`（提示需要 Node.js 18.18+ 或安裝腳本，附 README 連結）。
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

## 塔台補充（2026-10-15T18:54:14+08:00，D111）— 執行中請立即套用

1. **npx 一律改用 `token-usage-insights@latest`**：`npx.cmd --yes token-usage-insights@latest`（unix `npx --yes token-usage-insights@latest`）。原因：不帶版本時 npx 可能沿用 `~/.npm/_npx` 快取而不取新版；使用者同意每次啟動多一次 registry 查詢。測試斷言命令字串含 `@latest`。
2. **已安裝版保留其內建自動更新**（README：`TOKEN_USAGE_INSIGHTS_AUTO_UPDATE` 預設 true，啟動時檢查，間隔預設 24h）——**不得**傳 `--no-auto-update`。
3. 驗證並回報：已安裝版若觸發自我更新會重新啟動 / re-exec 時，新程序仍在 OpenUsage 的 Job Object 內（關閉 OpenUsage 時一併結束）；若無法實機觸發更新，以 `token-usage-insights update --check` 與文件 / 程式行為說明，並註明「未實機觸發」。

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

### 結果：DONE

- 開始 `2026-10-15T18:49:19+08:00`（新執行，非 resume）；commit 見 frontmatter `commit`。
- Landing：**WARN**（C-0 frontmatter 無 `repo` 欄位 → repo identity unavailable；實際 `basename(REPO_ROOT)=openusage`）。C-1 PASS；C-3 部分存在（`token_dashboard.rs` 為新建，其餘存在）→ 繼續；C-2 無 `branch` 欄位（HEAD=`main`）。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`。`CT_MODE=yolo`、`CT_INTERACTIVE` 未設。
- 塔台補充 D111（執行中收到）已套用：npx 改 `token-usage-insights@latest`；已安裝版不帶任何參數（無 `--no-auto-update`）；自我更新與 Job Object 結論見下。

### 改動

| 檔案 | 內容 |
|---|---|
| `src-tauri/src/token_dashboard.rs`（新） | `launch_token_dashboard` → `Opened` / `Started` / `NotInstalled{hint}` / `Failed{reason}`（`#[serde(tag="kind")]`）；`token_dashboard_status` → `{running, managed}`；`shutdown()`。3003 已可連 → 只開瀏覽器、不納管。選擇：`~/bin/token-usage-insights.cmd`（unix `~/.local/bin/token-usage-insights`）→ 否則 `resolve_ccusage_runner_binary(Npx)`（T0042 的 `npx.cmd` / `npx.exe` + enriched PATH）→ `npx --yes token-usage-insights@latest`。`background_command`（CREATE_NO_WINDOW）+ `CcusageJob`（KILL_ON_JOB_CLOSE）/ unix process group；stdio 全 null。輪詢 500ms、上限 90s；子程序提前結束 / 逾時 → 結束程序樹回 `Failed`。防重入：`launch` mutex，第二呼叫等待並回傳同一結果（不重複 spawn / 開瀏覽器）。生產碼約 300 行 + 9 個單元測試。 |
| `src-tauri/src/lib.rs` | `mod token_dashboard`、`.manage(TokenDashboard::default())`、註冊 2 個 command、`RunEvent::ExitRequested` / `Exit` 呼叫 `token_dashboard::shutdown`（tray Quit 走 `app.exit(0)` 同一路徑）。 |
| `src-tauri/src/plugin_engine/host_api.rs` | 只改可見性：`background_command`、`CcusageRunnerKind`、`ccusage_enriched_path`、`resolve_ccusage_runner_binary`、`kill_ccusage_process_group`、`CcusageJob`（+`assign` / `terminate`）→ `pub(crate)`；Windows `CcusageJob` 加 `unsafe impl Send/Sync`（存 app state 用）。無行為變更。 |
| `src/components/side-nav.tsx` | ❓ 上方加 `TokenDashboardButton`（lucide `LayoutDashboard`、`currentColor` 跟主題）；`aria-label` = Token 戰情室 / Token Dashboard，`title` tooltip（執行中顯示「（執行中）」）；啟動中 `LoaderCircle` spin + disabled；`running` 小圓點；成功 → `hide_panel`；失敗 → `console.error` + 錯誤提示（`NotInstalled` 附「安裝說明」開 README）。掛載與 window focus 時查 status。 |
| `src/components/side-nav.test.tsx` | +4 測試：位置在 Help 上方 + 成功收面板、running 標記、NotInstalled 提示 + 安裝說明連結 + 關閉、Failed 原因。 |
| `src/lib/i18n.ts` | `nav.tokenDashboard*` 6 個 key（en / zh-TW）。 |
| `README.md` | What It Does 加一行 Token Dashboard（上游連結、MIT、`@latest`、Quit 時只結束自己啟動的）。 |
| `src-tauri/capabilities/default.json` | **未改**：app 自訂 command 在 Tauri v2 預設允許（`build.rs` 無 AppManifest 限制），實機 invoke 正常即證。 |

### 上游 README 引用（`gh api repos/doggy8088/TokenUsageInsights/readme`）

- 「已安裝 Node.js 18.18 或更新版本時，可直接執行……`npx --yes token-usage-insights`」
- 「從互動式終端機手動啟動時，程式會在連接埠監聽成功後，自動使用作業系統的預設瀏覽器開啟看板；以 systemd、launchd 或 Windows 背景 runner 執行服務時不會開啟瀏覽器。」→ 實測 stdio=null 時看板未自行開瀏覽器（每次只出現 OpenUsage 開的一個分頁）。
- Port 可設：環境變數表 `PORT`（預設 `3003`，「看板服務埠號」）、`HOST`（預設 `0.0.0.0`）。
- 健康檢查：README **無**專用 health 路徑（只有 `/api/:assistant/sync`、`/api/<assistant>/pricing`）→ 依工單用 TCP 連 `127.0.0.1:3003`。
- 自動更新：`TOKEN_USAGE_INSIGHTS_AUTO_UPDATE` 預設 `true`（「是否在啟動時自動檢查更新」）、`TOKEN_USAGE_INSIGHTS_UPDATE_INTERVAL_HOURS` 預設 `24`。

### D111-3：已安裝版自我更新後是否仍在 Job Object 內 —— 是（程式碼分析，**未實機觸發**）

- 本機無已安裝版（`%USERPROFILE%\bin\token-usage-insights.cmd` 不存在），無法實機觸發。`npx --yes token-usage-insights@latest update --check`（cwd `%TEMP%`）→ `目前版本: v1.3.2` / `最新版本: v1.3.2` / `✅ 目前已是最新版本。`（npx 環境本就不自我更新：上游 `src/updater.rs`「不支援在 npm / npx 環境中直接自我更新」）。
- 上游 `src/updater.rs`（main）Windows 重啟路徑：`restart_current_process` 非 service 模式以 `CREATE_NEW_PROCESS_GROUP` spawn 新程序後 `exit(0)`；deferred 移交為 `powershell.exe` + `CREATE_NO_WINDOW`；`restart_dashboard_instance` 為 `CREATE_NO_WINDOW`。**皆無 `CREATE_BREAKAWAY_FROM_JOB`**，且我們的 job 未設 `JOB_OBJECT_LIMIT_BREAKAWAY_OK` → 新程序必在 OpenUsage 的 job 內，Quit / 強殺時一併結束。唯一例外是 service 模式（`exit(75)` 交給工作排程器 / `schtasks`），只在父程序為 `run-service.ps1` 或 `TOKEN_USAGE_INSIGHTS_SERVICE=1` 時成立，OpenUsage 啟動的不符合。unix：`exec()` 同 pid、同 process group。
- **因此修了一個 bug**：已安裝版的 `.cmd` 內容是 `"...\token-usage-insights.exe" %*`，自我更新時舊 exe 退出 → 外層 `cmd.exe`（我們的直接 child）結束，但新 exe 仍在 job 內。原本 `token_dashboard_status` 看到 child 結束就 terminate job，會誤殺更新後的新版。已改為：status 不以直接 child 判斷（`managed = running && 有納管 job`）；只有 app 結束、或下次按鈕時 3003 已不通，才結束舊 job。

### 驗證

| 證據線 | Gate | 結果 | 證據 |
|---|---|---|---|
| build/test | `cargo fmt --check` | PASS | 最終版 `FMT_OK` |
| build/test | `cargo check --all-targets` | PASS | 最終版 `CHECK_OK`（只有既有 linker_messages warning） |
| build/test | `cargo test --locked` | PASS | `167 passed; 0 failed`；`token_dashboard::tests` 9 個（執行檔位置、選擇順序、固定參數含 `@latest`、hint、結果對映、就緒輪詢 ready / 提前結束 / 逾時、TcpListener 就緒判斷、serde tag） |
| build/test | `bun run test --run` | PASS | `70 files / 1258 tests passed` |
| build/test | `bun run build` | PASS | `✓ built`（既有 chunk >500 kB 警告） |
| runtime | A 預先有 3003（使用者自開的 npx 看板）→ 只開瀏覽器 | PASS | 按前後 tree 皆為 44040/39308/45764/32536，無新程序；Chrome 前景分頁網址 `localhost:3003`；按鈕 HelpText `Token 戰情室（執行中）` |
| runtime | A tray Quit 不結束使用者的看板 | PASS | 使用者手動 tray Quit 後測試 app 結束，32536 等 4 程序仍在、3003 仍 listen |
| runtime | B 按下 → 背景啟動 → 就緒 → 開瀏覽器 | PASS | 約 12.1s 就緒（npx 首跑）；取樣 31 次新可見頂層視窗 0；tree：`cmd.exe /c "npx.cmd" --yes token-usage-insights@latest` → node npx-cli → cmd → node cli.cjs → token-usage-insights.exe；conhost 1 個為 headless（`conhost.exe 0x4`），tree + conhost 可見視窗 0（無 console、無工作列按鈕） |
| runtime | B 再按 → 不重複啟動、開瀏覽器、顯示執行中 | PASS | PID 集合前後相同（2732,28420,38056,40292,45028）；Chrome 開 `localhost:3003`；HelpText 執行中 |
| runtime | B tray Quit → 全部結束 | PASS | 使用者手動 tray Quit 後 5 程序 + conhost 41244 全部結束，3003 關閉 |
| runtime | C `Stop-Process -Force` → Job 保底 | PASS | 5 程序 + conhost 25340 全部結束，3003 關閉 |
| runtime | D npx 不可用（只對測試 process 移除 `C:\nvm4w\nodejs`、`C:\Program Files\nodejs`） | PASS | 提示「Token 戰情室需要 Node.js 18.18 以上（npx）或 TokenUsageInsights 安裝腳本。」+「安裝說明」按鈕；無 spawn |
| runtime | E（額外）OpenUsage cwd = repo 根目錄 | PASS | 最終版：1.9s 就緒、可見視窗 0；強殺後 0 殘留 |
| runtime | 已安裝版路徑 / 自我更新 | 未實機 | 本機無已安裝版；見 D111-3 |

- 環境：release exe（`bun tauri build --no-bundle`）+ `resources/` 複製到 `%TEMP%\ou-t0069`，cwd `%TEMP%`（E 為 repo 根）。A–C 用前一版 build（與最終版差異僅錯誤提示定位 + spawn cwd，exit 清理碼相同）；D 版面複驗與 E 用最終版（19:09:49）。
- 瀏覽器：每次只在前景為 Chrome 且網址列 = `localhost:3003` 時送 Ctrl+W 關該分頁；未改瀏覽器設定。截圖只存 scratchpad 供版面檢查，未 commit。
- 還原：使用者 OpenUsage 以安裝目錄 `%LOCALAPPDATA%\OpenUsage` 為 cwd 重啟（pid 5408）；`settings.json` 測試期間被重寫（只有鍵順序改變，值相同），已還原，SHA256 `A7CC803B…F15E` 與測前一致。使用者自開的看板：經同意暫停測試；使用者之後表示已自行關閉、不必復原。

### 偏差

1. **toast → 面板內錯誤提示**：專案沒有任何 toast 函式庫（package.json 無 sonner 等），新增依賴超出 `affects_files`。改用既有 `ui/alert` 的 destructive Alert，放在 nav 旁的面板內（第一版 `fixed` 會超出面板圓角被裁，已改 `absolute`），有關閉按鈕；同時 `console.error`（fail loud）。
2. **spawn 環境固定值**：`PORT=3003`（確保輪詢的 port 正確）、`HOST=127.0.0.1`（上游預設 `0.0.0.0` 會對區網開放；OpenUsage 只需本機）。皆為常數，不含使用者輸入。
3. **spawn cwd = 使用者 home**：實測 npx 在含 `package.json` overrides 的目錄（如本 repo）失敗 `npm error code EOVERRIDE`；OpenUsage 的 cwd 不可控，故固定為 home。
4. **stdout / stderr 丟棄**（工單允許）而非寫入 log。
5. **tray Quit 由使用者手動執行**：自動化右鍵 tray 圖示時，既有 `on_tray_icon_event` 對任何按鍵 `Up` 都 `toggle_panel_at_tray_icon`，面板搶前景、選單沒出現（UIA 找不到 `#32768`）。經同意改請使用者手動右鍵 → Quit，我在前後取 `Get-Process` 證據。
6. **status 判斷改為不看直接 child**（見 D111-3）。
7. `token_dashboard.rs` 457 行（含約 150 行測試）；生產碼約 300 行 < 400。

### 互動紀錄

- Q1（3003 已被使用者自開的 npx 看板佔用）→「可暫停，測完重啟」。
- Q2（UIA Invoke + 關分頁）→「可以，用 UIA」。
- Q3（tray Quit 用滑鼠右鍵 + 鍵盤）→「可以動滑鼠/鍵盤」；自動右鍵兩次失敗（見偏差 5），滑鼠已移回原位。
- Q4 / Q5（請使用者手動 tray Quit，A / B）→「已按 Quit」。
- 執行中塔台補充 D111（npx `@latest`、不加 `--no-auto-update`、回報自我更新 + Job）→ 已套用。
- 使用者：「我關掉了, 不用再復原」（看板不必重啟）。

### 後續建議

- T0070：NSIS 安裝版 smoke 時，若能安裝 TokenUsageInsights 安裝腳本版，可實機驗證「已安裝版優先」與自我更新後仍被 Quit 結束。
- （可選，另開單）tray 右鍵目前也會 toggle 面板（`tray.rs` 的 `TrayIconEvent::Click` 未過濾 `MouseButton::Left`），可能讓右鍵選單被面板蓋掉；本單不改。
