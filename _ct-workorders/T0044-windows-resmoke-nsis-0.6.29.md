---
schema_version: 1
schema_kind: workorder
id: T0044
title: Windows re-smoke + NSIS for 0.6.29 after T0042/T0043
status: DONE
priority: High
type: verification
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T14:50:59+08:00"
started_at: "2026-10-15T14:28:20+08:00"
completed_at: "2026-10-15T14:50:59+08:00"
commit: 73337e38
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0042
  - T0043
  - T0045
  - T0046
  - T0047
  - T0048
  - T0049
affects_files: []
---

# T0044 Windows Re-Smoke + NSIS For 0.6.29

## 背景

T0040 PARTIAL（Usage Trend FAIL）。T0042（ccusage runner）、T0043（taskbar / blur hide）、T0045–T0048（後續小問題，D076）完成後，發行前重新驗證。方法沿用 T0040 回報區（release exe、cwd `%TEMP%`、UIA、trace log）。

## 任務指令

1. 重新打 NSIS（環境同 T0040），記錄 path / size / SHA256 / LastWriteTime。
2. 重跑 T0040 smoke **全部 17 項**，並新增：
   - Usage Trend / Today / Yesterday / Last 30 Days 顯示（BUG-006）。
   - 工作列無按鈕（BUG-007）。
   - 失焦自動收起 + tray 連點無閃爍 + 拖曳 / 下拉 / About 不誤收（BUG-008；T0048 搬移後不退步）。
   - Debug log 中 host_api 路徑不含實際使用者名稱（BUG-009）。
   - 一般情況 ccusage 正常、無殘留 node（BUG-010）。
   - 無 runner 時顯示「用量歷史 / 需要 Node.js 或 Bun」提示且**不截斷**（en 也要檢查，T0048 量測餘裕僅約 3px）（BUG-011，可用只對測試 process 改 PATH 的方式）。
   - 安裝版從 repo 目錄啟動不載入 repo `plugins/`（BUG-012）。
   - ccusage 逾時後 process tree 清空（BUG-010；可沿用 T0046 的暫時 timeout build 做法，不 commit）。
3. 截圖存 `_ct-workorders/assets/T0044/`（**截圖前確認畫面沒有其他視窗的私人內容**）。
4. FAIL 不修，回報 PARTIAL / FAILED。

## 明確排除 / 環境限制

- 不改程式碼、不 push、不 tag。
- **不改 registry**（T0040 曾暫改 WebView2 policy，本單禁止）。
- 不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`（T0043 曾暫時覆蓋）。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重新啟動並還原 `settings.json`（SHA256 比對）。
- NSIS 安裝版 smoke 優先：用 T0044 產出的 installer 裝到**暫存位置**測試不可行時，用 release exe + `resources/` 一起帶。

## 驗證 Gate

- PASS：NSIS 產出
- PASS：全部 smoke 項目 PASS

## 收尾

- Commit：回報區 + 截圖，`docs: windows re-smoke for 0.6.29 (T0044)`。不 push。

## 回報區

### 狀態

DONE — NSIS PASS；T0040 全部 18 列 + 新增 8 項全部 PASS。一次 blur 漏收無法重現，列在「觀察」（請塔台判斷）。

- Worker 開始：2026-10-15T14:28:20+08:00；回報：2026-10-15T14:49:30+08:00。HEAD `03dd9b61`。

### Landing Zone

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage` → WARN repo identity unavailable，改用 C-3 + C-1。
- C-1：PASS。C-3：`affects_files` 是空的 → not applicable。C-2：無 `branch` 欄位（HEAD = `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（只記錄）。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### Installer

- 指令：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，PowerShell `cmd.exe /c` 執行 `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。有重建前端（`tsc && vite build`）與 `Bundled 18 plugins`。
- Path：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.29_x64-setup.exe`
- Size：5,441,171 bytes
- SHA256：`3FB7663A9A43F25C6742613868EAED90DCEAD5869398DC260950E5B75F35E739`
- LastWriteTime：2026-10-15 14:29:29
- CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（預期，只少 `.sig`）。
- Release exe（target）：20,599,808 bytes，ProductVersion 0.6.29，SHA256 `1A024E37…BC75B55`。

### Smoke 方法

- **受測物 = installer 內容**：用 7-Zip 把 installer 解到 scratchpad（`openusage.exe`、`resources\bundled_plugins`（18 個）、`icons`、`uninstall.exe`，共 83 檔），沒有執行安裝程式。原因見「偏離 1」。
  - 解出的 exe SHA256 `CBE3DE1B…A91681B`，和 target exe 只差 3 bytes：`__TAURI_BUNDLE_TYPE_VAR_UNK` → `NSS`（bundler 修補），其餘相同。
  - `resources\bundled_plugins\claude\plugin.js` 含 `Needs Node.js or Bun`（T0048 文案）。
- 第 1 輪：cwd = 解出的安裝目錄，一般 PATH。第 2 輪：只對測試 process 設 PATH = System32 / Windows / Wbem / PowerShell（無 bun / npx / node）。第 3 輪：cwd = repo 根、再 cwd = `src-tauri`。第 4 輪：暫時 1s timeout build（見下）。
- 測前停掉使用者的 0.6.27（pid 2528），備份 `settings.json`（SHA256 `1F5230AC…D020`）與 `usage-api-cache.json`。測試用 settings：`logLevel=debug`，`plugins.disabled` 拿掉 gemini / devin。
- 驅動：Win32（`EnumWindows` / `GetWindowLong` / `GetWindowRgn` / `mouse_event`）+ UIA。blur、tray、拖曳、Settings、About 都用**真實滑鼠點擊**；同一個腳本裡二次啟動 exe 叫出面板。對照 `panel-window-trace.log`（新 696 行）與 `OpenUsage.log`。
- 測試中途發現使用者正在操作桌面（干擾前景），已詢問使用者，使用者同意讓 Worker 控制滑鼠後才繼續（Q/A 見下）。

### Smoke 逐項結果（T0040 項目）

| 項目 | 結果 | 證據 |
|---|---|---|
| Panel 顯示 / 隱藏 | PASS | 二次啟動 / tray 左鍵：顯示後 `visible=True fg_is_panel=True`；tray 再點 / 失焦後 `visible=False` |
| 不規則透明遮罩 | PASS | `GetWindowRgn` type=3（complex）；(1,1) 與箭頭旁 (10,5) 不在 region、中心在；trace `set_window_region scale_factor=1.500 result=1`；原始截圖圓角外、箭頭外透出背景 |
| 拖曳 + 位置記憶 | PASS | 把手「移動面板」(1816,303) → (1516,403)，`panelPosition` 寫入 {1516,403}；hide→show 為 (1516,315)（y 被夾在工作區內：315+1053=1368）；進 Settings 後存成 {1516,216}，**重啟 app 後 = (1516,216)** |
| deactive 後無 native title bar（BUG-001） | PASS | trace 新 696 行：`has_chrome_bits=true` **0 次**、`false` 196 次；`subclass_style_changing_pruned before_style=0x04CB0000 after_style=0x04000000` 29 次；收起前 style 一直是 `0x14000000` |
| Single-instance（BUG-004） | PASS | 第二個 process exit 0，`openusage` process 數 = 1（pid 38292）；面板到前景（`fg_is_panel=True`），全程多次重複 |
| 背景 shell 不跳 console（BUG-002） | PASS | 按 4 個「重試」後 20 秒、182 次取樣：新可見 top-level 視窗 0（期間 bun → node 6 個 ccusage 程序在跑） |
| Tray 圖示 = desktop icon（BUG-003） | PASS | `tray-icon.png` 與 `src-tauri/icons/128x128.png` 一致 |
| Tray **Copy Log Path** | PASS | 剪貼簿先放 sentinel → Debug Level → Copy Log Path → `C:\Users\<user>\AppData\Local\com.sunstory.openusage\logs\OpenUsage.log`（= `%LOCALAPPDATA%\…`，檔案存在）；log `tray menu: copy_log_path` |
| Settings Metric 區塊 zh-TW | PASS | 「指標 / 預設 / 每週」；`settings-metric-zh-TW.png` |
| 切 Weekly 後 tray tooltip | PASS | `menubarMetric=weekly` 寫入；tray 項目名稱仍 `OpenUsage`；log 無 ERROR（Windows `keepDesktopTrayIcon` 不更新 tooltip，同 T0040） |
| Overview 無退休橫幅 | PASS | UIA 全樹無 退休 / retire；`dist/assets/index-CURG2ytt.js` 無 `robinebers`、無 retire 字樣 |
| Usage Trend 渲染（BUG-006） | PASS | 見新增項第 1 列 |
| About / ❓ / 變更紀錄（BUG-005） | PASS | About：原作者 Robin Ebers / 維護者 gowerlin（`about-dialog.png`）；❓ 開出新 Chrome 視窗，網址 `github.com/gowerlin/openusage/issues`；變更紀錄顯示「沒有特定版本說明」+「在 GitHub 查看所有版本」（v0.6.29 未發行，符合預期）；bundle 內 repo 只有 `gowerlin/openusage`（`api.github.com` + `releases`） |
| Gemini | PASS | 已載入；`Not logged in. Run gemini and complete the OAuth prompt.`（既有行為） |
| Devin（T0039） | PASS | `Run devin auth login and try again. On Windows only Devin CLI credentials are supported.` |
| 舊 Windsurf plugin 目錄清除 | PASS | 啟動前 `%APPDATA%\com.sunstory.openusage\plugins\windsurf` 存在，啟動 8 秒後消失（18 個 plugin） |
| i18n 切換 | PASS | 英文 → `Metric / Default / Weekly / Language`，`language=en`；切回繁體中文 → `指標 / 預設 / 每週 / 語言`，`language=zh-TW` |
| 主題切換（含 macaron） | PASS | 深色 → `dark`、馬卡龍粉 → `macaron-pink`、馬卡龍藍 → `macaron-blue`，畫面變色（scratchpad 截圖） |

### Smoke 新增項目

| 項目 | 結果 | 證據 |
|---|---|---|
| Usage Trend / 今天 / 昨天 / 過去 30 天（BUG-006） | PASS | UIA：`今天`、`昨天`、`過去 30 天`、`用量趨勢：25 天，最近 159M tokens（10/15），峰值 1.7B tokens。`；log `[plugin:claude] ccusage query via bunx Current (bun.exe)` → `probe claude completed ok (11 lines)`；`claude-detail-usage-trend-zh-TW.png` |
| 工作列無按鈕（BUG-007） | PASS | 面板可見時列舉 `Shell_TrayWnd` 的 `Taskbar.TaskListButtonAutomationPeer`：沒有 OpenUsage；`exstyle=0x00040010` |
| 失焦自動收起（BUG-008） | PASS | 真實點擊 4 種情境都收起：點工作列空白（+71ms 取樣已隱藏）、點溢位 chevron（+124ms）、UIA 操作後點 chevron（+135ms）、詳細頁↔首頁 + 重試 + 等 20s 後點 chevron（+134ms）；trace `Focused(false)`、log `panel lost focus; hiding`。另見觀察 1 |
| tray 連點無閃爍（BUG-008） | PASS | 溢位區 icon，100ms 取樣：開 `11111111111111`、關 `10000000000000`、開 `01111111111111`；連點 6 次（約 440ms 間隔）30ms 取樣：關/開正常交替 6 次，沒有短暫閃爍 |
| 拖曳 / 下拉 / About 不誤收（BUG-008，T0048 後） | PASS | 拖曳中與放開後 42/42 取樣 `visible` 與 `fg_is_panel` 都是 1；About、變更紀錄、Settings 分段按鈕（每週、主題 ×4、語言 ×2）、滾輪捲動後都 `visible=True fg_is_panel=True`。Settings 沒有原生下拉（同 T0043） |
| Debug log host_api 無使用者名稱（BUG-009） | PASS | 第 1 輪新 log 176 行（debug）：`host_api` 48 行含使用者名稱 0 次；**整段新 log** 含使用者名稱 0 次；`app_data_dir: … path=[PATH]`、`[config] no config file at ~/.openusage/config.json` |
| ccusage 正常、無殘留 node（BUG-010） | PASS | 重試期間出現 `bun.exe → bun.exe → node.exe`（claude / codex 各一組），結束後 ccusage 相關程序 0；每輪結束時也都是 0。log `skipping yarn 1.22.22 (no dlx before yarn 2)` |
| 無 runner 提示且不截斷（BUG-011） | PASS | log `no package runner found for ccusage query` → `probe claude completed ok (3 lines)`。zh-TW：`用量歷史` / `需要 Node.js 或 Bun`，寬 165 px（÷1.5 = 110 CSS px）；en：`Usage history` / `Needs Node.js or Bun`，寬 184 px（122.7 CSS px，上限 125.1，同 T0048 量測）。截圖目視兩種語言都沒有 `…`；Codex 詳細頁相同。`claude-detail-no-runner-zh-TW.png`、`claude-detail-no-runner-en.png` |
| 安裝版從 repo 目錄啟動不載入 `plugins/`（BUG-012） | PASS | repo 根有 `plugins/mock`。cwd = repo 根：port 6736 屬測試 process，`/v1/usage/mock` → **404**、`claude` 200、`codex` 200、`devin` 204。cwd = `src-tauri`（`../plugins`）：`mock` → **404**、`claude` 200。`settings.json` 無 `mock`；AppData 無 `plugins\mock` |
| ccusage 逾時後 process tree 清空（BUG-010） | PASS | 暫時 build（見下）。log `[plugin:claude] ccusage timed out after 1s for npm exec` → `ccusage query timed out; skipping fallback runners` → `probe claude completed ok (2 lines)`。程序樹 t+1.6s：`cmd.exe → node.exe → cmd.exe → node.exe → ccusage.exe` 等 9 個；t+2.4s 起到 t+13.7s 全部 0；app `Responding=True` |

**暫時 timeout build（不 commit）**：`host_api.rs` `CCUSAGE_TIMEOUT_SECS` 15 → 1，`bun tauri build --no-bundle`（同環境），執行 `target\release\openusage.exe`，cwd `%TEMP%`，PATH 拿掉 `chocolatey\bin`（走 `npm.cmd`）。build 完立刻用備份還原 `host_api.rs`（SHA256 `E68BEE9D…3A042` 一致），測完再用原始碼重建一次 `--no-bundle`，`target\release` 不留 1s 版 exe。`git status` 只剩本工單與截圖。

### 截圖

存 `_ct-workorders/assets/T0044/`。面板 window region 外的像素都塗成灰色棋盤格，沒有背景視窗內容；逐張目視：無 token / email / 帳號 ID / 使用者路徑（D081），只有用量金額。

- `overview-zh-TW.png`、`claude-detail-usage-trend-zh-TW.png`、`about-dialog.png`、`settings-metric-zh-TW.png`
- `claude-detail-no-runner-zh-TW.png`、`claude-detail-no-runner-en.png`
- `tray-icon.png`、`tray-debug-level-menu.png`

### 觀察（不算 FAIL，請塔台判斷）

1. **blur 漏收 1 次，無法重現**：第一次點溢位 chevron 時（trace `1792045993.700Z` = 14:33:13.700+08:00），trace 只有 `WM_NCACTIVATE(0)`（`message=0x0086 wparam=0x0`），沒有 `Focused(false)`，面板留在畫面上。前一次 Focused 事件是 `Focused(true)`。之後 4 次刻意重現（含相同操作順序 + 等 20s）都正常收起。當時使用者也在操作檔案總管，可能有同時輸入。和 T0043「已知限制」同類：沒有 `Focused(false)` 就不會收起。若要更穩，可另開單評估在 `WM_NCACTIVATE(0)` / `WM_ACTIVATE` 也觸發同一個 150ms 檢查。
2. Claude 詳細頁「昨天 $213.36 · 597M toke…」value 被截斷（`max-w-[45%]` + `truncate`，T0042 截圖已是如此）。不在本單項目內。
3. Settings 頁 1152px 高，超出 1368px 工作區，底部被工作列蓋住；要捲動才點得到「語言」。點到被蓋住的按鈕會點到工作列，造成面板收起（行為正確，但容易誤會）。進 Settings 後存的位置會變成夾過的 y（216）。T0040 已記錄。
4. 新路徑的 exe，tray icon 預設在溢位區（同 T0043）。從溢位區開面板時，點 chevron 就會讓面板失焦收起。

### 偏離

1. **沒有把 installer 裝到暫存位置**：Tauri NSIS（currentUser）安裝時會寫 HKCU 解除安裝 key（和使用者已安裝的 0.6.27 同一個 key），違反「不改 registry」，也可能動到使用者正式安裝。改用 7-Zip 解出 installer 內容（就是安裝後會放的檔案，不執行安裝程式），比工單的備案（release exe + `resources/`）更接近安裝版。
2. 主題截圖（深色 / 馬卡龍粉）只留在 scratchpad，沒放 assets（工單沒指定）。

### 互動紀錄

- Q（Worker，在 14:33:50 與 14:37:28 兩次腳本輸出之間）：使用者正在操作桌面，干擾滑鼠測試；問是否可讓 Worker 控制滑鼠 10–15 分鐘。A（使用者）：「現在可以」。受干擾的那次 blur 取樣（面板顯示約 120ms 就被搶走前景）不採計；blur / tray / 拖曳 / Settings / About 都在同意後執行。

### 清理

- 測試 app 都已關閉；ccusage 相關程序 0。
- `settings.json` 從備份還原，SHA256 `1F5230AC…D020` 一致；測後版本（`C78A6B59…`）存在 scratchpad 供比對。`usage-api-cache.json` 也從備份還原。
- 以安裝目錄 `C:\Users\<user>\AppData\Local\OpenUsage` 為 cwd 重啟已安裝版 0.6.27（pid 1548）；重啟後 `settings.json` SHA256 仍一致；`plugins\windsurf` 已補回。
- 已安裝 exe 沒覆蓋（SHA256 `126393F1…AE08B` 前後一致）。沒改 registry。沒執行 installer。
- ❓ 開的 Chrome 視窗（只有該分頁）已用 `WM_CLOSE` 關閉。
- 剪貼簿：測試前的內容被 sentinel 蓋掉，無法還原；目前是 log 路徑。
- 沒 push / tag / 發行。

### Commit

見 frontmatter `commit`（只含回報區 + 截圖，未 push）。
