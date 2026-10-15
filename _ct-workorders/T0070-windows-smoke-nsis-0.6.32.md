---
schema_version: 1
schema_kind: workorder
id: T0070
title: Windows smoke + NSIS for 0.6.32 (token dashboard button)
status: DONE
priority: High
type: verification
plan_id: PLAN-007
bug_id: null
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T19:42:40+08:00"
started_at: "2026-10-15T19:23:57+08:00"
completed_at: "2026-10-15T19:42:40+08:00"
commit: 43bcd216
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0069
  - T0072
affects_files: []
---

# T0070 Windows Smoke + NSIS For 0.6.32

## 任務指令

1. 打 NSIS（版號仍 0.6.31 屬預期），7-Zip 解出測試（不執行 installer）。
2. Token 戰情室按鈕（確認 npx 命令為 `token-usage-insights@latest`，D111；若 T0069 未套用則回報 FAIL）：T0069 實機項目全部重跑（啟動 / 已執行 / Quit 清理 / 強制結束清理 / 外部已開不關 / 無 npx 提示 / 無 console / 無工作列按鈕）。
3. BUG-019：tray 右鍵只出選單、面板不被 toggle（關著起始保持關；開著起始依 BUG-008 失焦收起屬預期，D113）；選單項目可用；**改用 tray 右鍵選單 Quit 實機驗證 Token 戰情室程序全部結束**（T0069 曾需使用者手動）。
4. 回歸精簡（各 1 次）：BUG-001 trace、BUG-002、BUG-004、BUG-007、BUG-008/013 點外收起、BUG-012 `mock` 404、BUG-016 拖低停頓 500ms 放開、側邊欄 ❓ / 設定仍正常、i18n。
5. 截圖存 `_ct-workorders/assets/T0070/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.32 (T0070)`。不 push。

## 回報區

### 狀態

DONE — NSIS PASS；Token 戰情室 8 項實機全 PASS（D111 `@latest` 已套用）；BUG-019 PASS（tray 右鍵 Quit 實機證明看板程序全結束，不需使用者手動）；回歸 9 項全 PASS。HEAD `270a4913`（含 T0069 `2de48d7b`、T0072 `dcf6585f`）。

- 開始 `2026-10-15T19:23:57+08:00`（新執行）。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。
- 落點：WARN — C-0 `repo` absent（`basename(REPO_ROOT)` = `openusage`，repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 not applicable（`affects_files` 空）；C-2 無 `branch`（HEAD = `main`）。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。

### Installer

- VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`（重建前端、`Bundled 18 plugins`）。
- `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/OpenUsage_0.6.31_x64-setup.exe`（版號 0.6.31 屬預期）
- Size 5,478,594 bytes；SHA256 `B7B4EA74CE72F51A44651C736D096942B78C5C38C9F08BC454C6EE77DF6577E0`；2026-10-15 19:24:51
- CLI exit 1：`A public key has been found, but no private key…`（預期，只少 `.sig`）。
- 7-Zip 解出 83 檔、`resources/bundled_plugins` 18 個；解出 exe ProductVersion 0.6.31，SHA256 `1BC5973D…5FE1`。未執行 installer。
- D111：`src-tauri/src/token_dashboard.rs:23` `PACKAGE_SPEC = "token-usage-insights@latest"`；實機程序樹 `cmd.exe /c npx.cmd --yes token-usage-insights@latest …`（同 T0069）。

### Smoke 方法

- 受測物 = 解出的 `openusage.exe`，cwd = 解出目錄（BUG-012 改 cwd = repo 根）。螢幕 2560×1440，工作區底 1368。
- 單一 PowerShell 腳本（Win32 + UIA + 真實滑鼠），共 4 段：主跑 19:30:37–19:32:58、重跑 19:34:28 / 19:36:27 / 19:39:47（見偏離 1）。每段前停使用者 app、備份 `settings.json` / `usage-api-cache.json`，結束還原並重啟。
- 程序證據：`Win32_Process` 由測試 app pid 往下走子孫樹；3003 用 TcpClient 連線 + `Get-NetTCPConnection` owner。
- 瀏覽器：只在前景為 Chrome 且網址列（UIA Edit 值）含 `localhost:3003` 時送 Ctrl+W 關該分頁。

### Token 戰情室（T0069 實機項目重跑）

| 項目 | 結果 | 證據 |
|---|---|---|
| 啟動 | PASS ×3 | 按下後 1406–1440ms 3003 就緒（owner = `token-usage-insights.exe`）；樹 `cmd.exe → conhost / node(npx-cli) → cmd → node → token-usage-insights.exe`；Chrome 前景 `localhost:3003/?agent=copilot…`，面板收起 |
| 已執行 | PASS | 按鈕 HelpText `Token 戰情室（執行中）`（截圖有小圓點）；再按 3s 後子孫 PID 集合前後相同（12 個），Chrome 再開 `localhost:3003` |
| Quit 清理（tray 右鍵 → Quit） | PASS | R1：Quit 後 app 結束，12 個子孫 PID 全不存在，3003 關閉 |
| 強制結束清理 | PASS | `Stop-Process -Force` 2s 後子孫 0 存活，3003 關閉 |
| 外部已開不關 | PASS ×2 | 預先手動啟動 npx 看板（Worker 自開，`PORT=3003 HOST=127.0.0.1`，cwd home）；app HelpText 已顯示執行中；按下後 app 子樹只有 msedgewebview2 ×6（未 spawn），Chrome 開 3003；tray Quit 後 app 結束，外部 6 程序全存活、3003 仍由外部 owner listen。之後由 Worker 結束外部看板 |
| 無 npx 提示 | PASS | 只對測試 process 移除 PATH 中含 `nodejs` / `nvm` / `npm` 的項目：面板顯示「Token 戰情室需要 Node.js 18.18 以上（npx）或 TokenUsageInsights 安裝腳本。」+「安裝說明」「關閉」；app 子樹無 cmd/node，3003 未開（`token-no-npx.png`） |
| 無 console | PASS ×3 | 啟動期間每 100ms 取樣 30 次：新可見 top-level 視窗 0；子孫樹擁有的可見視窗 0 |
| 無工作列按鈕 | PASS ×3 | TaskListButton 啟動前 11 / 就緒後 11，新增 0 |

已安裝版（`%USERPROFILE%/bin/token-usage-insights.cmd`）本機仍不存在，「已安裝版優先 / 自我更新後仍在 Job」未實機（同 T0069）。

### BUG-019

| 項目 | 結果 | 證據 |
|---|---|---|
| 面板關著 → 右鍵 ×2 | PASS | 圖示在 overflow flyout (1743,1192)；`#32768` 選單 12–15ms 出現，項目 `Show Stats / Go to Settings / Debug Level / - / About OpenUsage / Quit`；1.5s 內面板 visible 轉換 0 次；Esc 後面板 / 選單皆關 |
| 面板開著 → 右鍵 | PASS（D113 預期） | 選單 12ms 出現；面板 95ms 收起（blur-hide），之後未再顯示 |
| 選單可用 | PASS | `Show Stats` → 面板顯示、首頁；`Go to Settings` → 面板顯示設定頁（`語言`、`指標`）；`Quit` → app 結束（R1、R2） |
| tray Quit 結束看板 | PASS | 見上表「Quit 清理」，全自動，未請使用者手動 |

### 回歸（各 1 次）

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-001 trace | PASS | 主跑新 trace 582 行：`has_chrome_bits=true` 0、`false` 144；`source=wm_ncactivate` 19；重跑 3 段 `true` 皆 0 |
| BUG-002 | PASS | 首頁按 2 個「重試」後 15s 取樣 134 次：新可見視窗 0（另 Token 啟動 ×3 同為 0） |
| BUG-004 | PASS | 二次啟動後 `openusage` process 1 個，面板 visible + 前景 |
| BUG-007 | PASS | 面板可見時 TaskListButton 11 個，OpenUsage 0；`exstyle=0x00040010` |
| BUG-008/013 點外收起 | PASS | 工作列 (1300,1404) `Shell_TrayWnd` 97ms；其他視窗 `T70 target` 96ms；桌面 `Progman` 86ms（暫時最小化 Terminal / Chrome / 檔案總管 / 1 個最大化視窗，已全部還原，最大化者維持 `zoomed=True`） |
| BUG-012 `mock` 404 | PASS | cwd = repo 根（有 `plugins/mock`），6736 owner = 測試 pid：`/v1/usage/mock` 404、`claude` 200 |
| BUG-016 拖低停 500ms | PASS | T306→1003：按住 `heldH={734}` `heldVis={1}`；+0ms H734 B1737，**69ms** 後 H353 **B1356**（可見 1013–1319），+500 / +1500ms 不變；拖回 306 後 83ms 恢復 H734 可見 h687（`bug016-low-hold500.png`） |
| 側邊欄 ❓ / 設定 | PASS | ❓ → 前景 `Issues · gowerlin/openusage - Google Chrome`、面板收起，Ctrl+W 關該分頁；設定 → `語言`、`指標` |
| i18n | PASS | 英文 → `Language` / `Metric`、按鈕 `Token Dashboard`、`language=en`；繁中 → `語言`、按鈕 `Token 戰情室`、`language=zh-TW` |
| BUG-009 / BUG-018（附帶） | PASS | 新 app log 12 行、trace 582 行：使用者名稱 0 次；`[ERROR]` 0 |

### 截圖（`_ct-workorders/assets/T0070/`）

window region 外塗棋盤格；逐張目視無 token / email / 帳號 ID / 路徑（D081）。
- `token-running.png`：側欄 Token 戰情室按鈕 + 執行中小圓點
- `token-no-npx.png`：無 npx 提示 +「安裝說明」「關閉」
- `bug016-low-hold500.png`：拖低停 500ms 放開後 B1356

### 偏離

1. **測試腳本問題重跑 3 次（非產品 FAIL）**：主跑時 tray 選單自動化失敗 → 主跑的 T3 Quit、T5 Quit、T6 無效（T6 因 Quit 失敗沿用舊 instance，PATH 修改未生效，反而啟動了看板）。診斷（`#32768` 歸屬取樣）證明選單**有出現**（owner = openusage、前景 `tray_icon_app`、持續 >2.5s），是 UIA 讀不到這版選單項目（T0072 腳本可讀，原因未查）。改法：每次重開 overflow flyout 取圖示座標、`MN_GETHMENU` + `GetMenuString` 讀項目、鍵盤 ↑/↓ + Enter 選項目。R3（無 npx）在第 1 次重跑 PASS；BUG-019 / R1 / R2 在第 3 次重跑 PASS。主跑的 T1 / T2 / T4（強殺，殺的是 T1 的 instance）與回歸證據有效。
2. 主跑 T6 無效執行時在 Chrome 留下 1 個 `localhost:3003` 分頁，已於重跑中確認前景網址後關閉（之後前景 = `github.com/gowerlin/openusage/releases…`）。
3. 選單「可用」驗 `Show Stats` / `Go to Settings` / `Quit`，未驗 `Copy Log Path`（會寫剪貼簿，工單要求不覆蓋）。
4. 外部看板由 Worker 以 npx 啟動（stdout 導檔，不自開瀏覽器），測後由 Worker `taskkill /T` 結束。
5. 未執行 installer（會寫 HKCU uninstall key），改用 7-Zip 解出內容測試。

### 互動紀錄

- Q（Worker，2026-10-15T19:24 後、NSIS 建置中）：「T0070 實機需要控制真實滑鼠/鍵盤約 20–30 分鐘…期間會停掉您常駐的 OpenUsage…NSIS 建好後可以直接開始嗎？」A（使用者）：「可以，建好就開始」。實機 19:30:37–19:40:57（含重跑）。

### 清理

- 測試 app、Worker 啟動的外部看板皆已結束；token-usage-insights / node 殘留 0，3003 關閉；`T70 target` 視窗已關；最小化視窗已還原；tray 幽靈圖示已用滑鼠掃除；滑鼠移回原位。
- `settings.json` 每段還原，SHA256 `A7CC803B…F15E` 一致；`usage-api-cache.json` 也還原。
- 已安裝版 0.6.31 以安裝目錄為 cwd 重啟（最終 pid 44540）；已安裝 exe SHA256 `2B1A42C8…B3C2` 前後一致。沒改 registry、沒執行 installer、剪貼簿未動。
- 腳本 / log：scratchpad `t0070-smoke.ps1`、`t0070-rerun*.ps1`、`t0070-diag.ps1`、`t0070-fn.ps1` 與對應 `.log`（未入 repo）。

### 觀察（請塔台判斷）

1. 這版 tray 選單 UIA 讀不到 MenuItem（T0072 可以）。實際使用不受影響，但之後自動化 smoke 請用 Win32 `MN_GETHMENU` + 鍵盤（建議寫入 memory / FIELDGUIDE）。
2. `Stop-Process -Force` 會在 overflow flyout 留下幽靈 `OpenUsage` 圖示（Windows 行為），自動化前要先用滑鼠掃過。
3. 已安裝版 TokenUsageInsights 路徑仍未實機（本機無安裝腳本版）。

### Commit

`docs: windows smoke for 0.6.32 (T0070)`：只含回報區 + 截圖。未 push。
