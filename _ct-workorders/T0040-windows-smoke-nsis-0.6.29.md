---
schema_version: 1
schema_kind: workorder
id: T0040
title: Windows runtime smoke + local NSIS package for 0.6.29
status: IN_PROGRESS
priority: High
type: verification
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:53:28+08:00"
started_at: "2026-10-15T12:53:28+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0038
  - T0039
affects_files: []
---

# T0040 Windows Runtime Smoke + Local NSIS Package For 0.6.29

## 背景

PLAN-004：T0038（merge + i18n）、T0039（Devin Windows）完成後，在發行前驗證 Windows runtime 沒有退步。T0037 報告「殘留風險」：NSIS 打包、CI、Devin / Antigravity runtime 皆未驗證。

## 任務指令

1. 本機 NSIS 打包：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。
   - 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH` + `CI=false`；從 PowerShell `cmd.exe /c`。
   - 本機無 `TAURI_SIGNING_PRIVATE_KEY`，產出 installer 後 exit 1 屬預期（只缺 `.sig`）。
   - 記錄 installer path / size / SHA256 / LastWriteTime。
2. Runtime smoke（執行 release `openusage.exe`；可搭配 `panel-window-trace.log` 與 `OpenUsage.log`）。逐項記錄 PASS / FAIL / 無法驗證：
   - Panel：顯示 / 隱藏、不規則透明遮罩、拖曳與位置記憶、**deactive 後無 native title bar**（BUG-001 回歸）。
   - Single-instance：第二次啟動 → process 數 = 1、面板到前景（BUG-004 回歸）。
   - 背景 shell 不跳 console 視窗（BUG-002 回歸）。
   - Tray：圖示為 desktop icon（BUG-003 回歸）；新選單 **Copy Log Path** 複製的是 Windows 路徑（`%LOCALAPPDATA%\com.sunstory.openusage\logs\...` 或實際 app_log_dir），不是 `~/Library/...`。
   - Settings：新 Metric（Default / Weekly）區塊在 zh-TW 下為中文；切 Weekly 後 tray tooltip 正常。
   - Overview：**無退休橫幅**；Usage Trend 圖可渲染（有資料的 provider）。
   - About / ❓ / 變更紀錄：仍指向 `gowerlin/openusage`（BUG-005 回歸）。
   - Providers：Gemini 仍在且可運作或給出既有 Windows 行為；Devin 依 T0039 行為；舊 Windsurf plugin 目錄在啟動後被清除（若本機有）。
   - i18n / theme：zh-TW 與 macaron 主題切換仍正常。
3. 截圖：Settings Metric 區塊（zh-TW）、Overview（含 Usage Trend）、About dialog —— 存 `_ct-workorders/assets/T0040/`。
4. 若發現 FAIL：**不修**，回報 PARTIAL / FAILED 並附證據，由塔台開修正工單。

## 明確排除

- 不改程式碼、不 push、不 tag、不發行。
- 不安裝到使用者正式環境以外的位置（直接跑 build 出來的 exe 即可）；smoke 結束關閉 process。

## 驗證 Gate

- PASS：NSIS installer 產出
- PASS：上列 smoke 項目全部 PASS（無法驗證者需說明原因，不算 PASS）

## 收尾

- Commit：只含回報區 + 截圖，`docs: windows smoke for 0.6.29 (T0040)`。不 push。

## 回報區

### 狀態

PARTIAL — NSIS PASS；smoke 只有 1 項沒過：**Usage Trend 在 Windows 不會渲染**。原因是 ccusage 找不到 runner，這是既有問題，不是這次的退步（見 FAIL 證據）。其餘項目全部 PASS。

### Landing Zone

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage` → WARN "repo identity unavailable"，改用 C-3 + C-1 判斷。
- C-1：PASS。C-3：`affects_files` 是空的 → not applicable。C-2：沒有 `branch` 欄位。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（只記錄）。`CT_MODE=yolo`。

### Installer

- 指令：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，從 PowerShell `cmd.exe /c` 執行 `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。
- Path：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.29_x64-setup.exe`
- Size：5,435,475 bytes
- SHA256：`AFF2DEF1B4B8DBA1C4581486E3DD1056071A33AED03B7902FAB6AE0960459F52`
- LastWriteTime：2026-10-15 12:54:44
- Release exe：`openusage.exe` 20,605,440 bytes，ProductVersion 0.6.29。
- CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（符合預期，只少了 `.sig`）。

### Smoke 方法

- 執行 release `openusage.exe`，cwd 設為 `%TEMP%`，避免 `find_dev_plugins_dir` 讀到 repo 的 `plugins/`。
- 開始前先停掉使用者已安裝、正在跑的 0.6.27（pid 39008），並備份 `settings.json`。
- 用 Windows UI Automation 驅動 WebView2 的 accessibility tree，搭配 Win32 `EnumWindows`/`GetWindowLong`、模擬滑鼠操作與螢幕截圖。另外對照 `panel-window-trace.log` 和 `OpenUsage.log`。
- CDP 走不通：`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS`（env）和 HKCU WebView2 policy 都會被 wry 預設的 browser args 蓋掉。試完已移除 policy key（見清理）。

### Smoke 逐項結果

| 項目 | 結果 | 證據 |
|---|---|---|
| Panel 顯示 / 隱藏 | PASS | tray 左鍵：可見 → 隱藏 → 可見，顯示後 foreground = panel hwnd |
| 不規則透明遮罩 | PASS | `overview-zh-TW.png`：圓角外和頂部箭頭缺口都透出背景 |
| 拖曳 + 位置記憶 | PASS | 拖「移動面板」把手：(1816,303) → (1516,403)，`settings.json` `panelPosition` 有更新；hide→show 位置不變；重啟 app 後回到存的位置 (1516,315) |
| deactive 後無 native title bar（BUG-001） | PASS | 點面板外、foreground 換到別的 process 後 1.8 秒內每 300ms 取樣：style 一直是 `0x14000000`（沒有 `WS_CAPTION`/`WS_THICKFRAME`）；trace `Focused(false)` → `has_chrome_bits=false`、`dwm_nc_rendering_enabled=0` |
| Single-instance（BUG-004） | PASS | 第二次啟動 exit 0，process 數 = 1，foreground = panel（pid 604）；重啟後再測一次也一樣 |
| 背景 shell 不跳 console（BUG-002） | PASS | Claude/Codex 重試 + Gemini/Devin probe 期間，每 50ms 取樣 50 秒，新出現的可見視窗只有 msedge / LINE / OpenUsage panel，**沒有** console / conhost / cmd |
| Tray 圖示 = desktop icon（BUG-003） | PASS | `tray-icon.png` 跟 `src-tauri/icons/128x128.png` 一致 |
| Tray **Copy Log Path** | PASS | Debug Level → Copy Log Path 後剪貼簿 = `C:\Users\Gower\AppData\Local\com.sunstory.openusage\logs\OpenUsage.log`（測前先放 sentinel）；`tray-debug-level-menu.png` |
| Settings Metric 區塊 zh-TW | PASS | 「指標 / 預設 / 每週」；`settings-metric-zh-TW.png` |
| 切 Weekly 後 tray tooltip | PASS | `menubarMetric=weekly` 有寫入；tray 名稱仍是 `OpenUsage`、圖示不變。Windows 的 `keepDesktopTrayIcon`（`1361a93b`）本來就不更新 tooltip，屬於既有設計；log 無 error |
| Overview 無退休橫幅 | PASS | UIA 全樹沒有 retire / 退休字樣；`dist/assets/*.js` 沒有 `robinebers` |
| **Usage Trend 渲染** | **FAIL（既有問題）** | 見下方 FAIL 證據 |
| About / ❓ / 變更紀錄 → `gowerlin/openusage`（BUG-005） | PASS | About：原作者 Robin Ebers / 維護者 gowerlin（`about-dialog.png`）；按 ❓ 開出 Chrome「Issues · gowerlin/openusage」；變更紀錄打 `api.github.com/repos/gowerlin/openusage/releases/tags/…`（v0.6.29 還沒發行，所以顯示「沒有特定版本說明」+「在 GitHub 查看所有版本」，符合預期） |
| Gemini | PASS | 已載入；本機沒有 `~/.gemini/oauth_creds.json`，顯示既有提示 `Not logged in. Run gemini and complete the OAuth prompt.` |
| Devin（T0039） | PASS | 本機沒有 `%APPDATA%\devin`，顯示 `Run devin auth login and try again. On Windows only Devin CLI credentials are supported.` |
| 舊 Windsurf plugin 目錄清除 | PASS | 啟動前 `%APPDATA%\com.sunstory.openusage\plugins\windsurf` 存在，啟動後消失；多了 `devin` |
| i18n 切換 | PASS | 英文 → `Metric / Default / Weekly / Language`；切回繁中 → `指標 / 預設 / 每週`；`language` 有寫入 |
| 主題切換（含 macaron） | PASS | 深色 → `dark`、馬卡龍粉 → `macaron-pink`、馬卡龍藍 → `macaron-blue`，`themeMode` 都有寫入且畫面變色 |

### FAIL 證據：Usage Trend

- Claude 詳細頁只有 工作階段 / 每週，沒有 Today / Yesterday / Last 30 Days / Usage Trend（UIA dump）。
- `OpenUsage.log`（Debug level）：
  - `[WARN] [plugin:claude] no package runner found for ccusage query`
  - `[WARN] [plugin:codex] no package runner found for ccusage query`
- 根因：`src-tauri/src/plugin_engine/host_api.rs` 的 `ccusage_runner_candidates` 只列 Unix 名稱（`bunx`、`npx`、`/opt/homebrew/bin/...`）。在 Windows 上 Rust `Command::new("npx")` 只會補 `.exe`，找不到 `npx.cmd`；本機有 `C:\nvm4w\nodejs\npx.cmd` 和 choco `bun.exe`（沒有 `bunx.exe`），結果 5 種 runner 全部判定不可用。
- 不是退步：v0.6.27 的同一段 candidate 程式碼一樣（`git show v0.6.27:…host_api.rs` 第 1731 行）。0.6.27 時 log level 是 Error，所以舊 log 裡沒有這行 WARN。
- 建議塔台開修正單：Windows 補 `.cmd`/`.exe` candidate（例如 `npx.cmd`、`bun.exe x`），或在 Windows 明確停用 Usage Trend 並在 UI 提示。修正時要確認 `.cmd` 也帶 `CREATE_NO_WINDOW`（BUG-002）。

### 截圖

- `_ct-workorders/assets/T0040/settings-metric-zh-TW.png`
- `_ct-workorders/assets/T0040/overview-zh-TW.png`
- `_ct-workorders/assets/T0040/about-dialog.png`
- `_ct-workorders/assets/T0040/tray-icon.png`
- `_ct-workorders/assets/T0040/tray-debug-level-menu.png`
- Usage Trend 沒有可截的畫面。Claude 詳細頁的截圖被其他視窗（含私人聊天內容）擋到，已從 assets 移除，沒有 commit。

### 其他觀察（都不是退步，沒有開 FAIL）

- Panel 有 taskbar 按鈕（`exstyle=0x00040010`，`WS_EX_APPWINDOW`）：trace log 歷史 5812 筆都是同一個值。
- Deactive 後 panel 不會自動隱藏，只會被其他視窗蓋住。v0.6.27..HEAD 的 `panel.rs` 只改了 macOS hunk。
- 設定頁 panel 高度（1152 px）在 1368 px 高的工作區裡，把手往下拖之後底部會被 taskbar 蓋住。

### 清理

- 已關掉 release process；`settings.json` 已從備份還原（SHA256 跟備份一致）；已重新啟動使用者的 0.6.27（`C:\Users\Gower\AppData\Local\OpenUsage\openusage.exe`）。
- 暫時加的 `HKCU:\Software\Policies\Microsoft\Edge\WebView2` 已刪除。空的上層 `HKCU:\Software\Policies\Microsoft\Edge` key 還在，因為無法確認測試前是否就存在，所以沒刪。
- 測試副作用：`%APPDATA%\com.sunstory.openusage\plugins\` 現在多了 `devin`（0.6.29 複製進去的）；`windsurf` 會在 0.6.27 下次啟動時重新複製回來。使用者的 Chrome 多開了一個 `gowerlin/openusage/issues` 分頁。

### 偏離

- 工單第 3 步要求「Overview（含 Usage Trend）」截圖。因為 Usage Trend 在 Windows 不會渲染，只附 Overview。

### Commit

- 見 frontmatter `commit`（只含回報區 + 截圖，未 push）。
