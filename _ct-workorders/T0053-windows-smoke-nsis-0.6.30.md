---
schema_version: 1
schema_kind: workorder
id: T0053
title: Windows smoke + NSIS for 0.6.30 candidate
status: DONE
priority: Medium
type: verification
bug_id: null
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T16:08:10+08:00"
started_at: "2026-10-15T15:57:13+08:00"
completed_at: "2026-10-15T16:08:10+08:00"
commit: c6642617
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0050
  - T0051
  - T0052
affects_files: []
---

# T0053 Windows smoke + NSIS for 0.6.30 candidate

## 背景

PLAN-005：T0050–T0052 完成後，發行前驗證。方法沿用 T0044（7-Zip 解 installer 內容測、不執行 installer、UIA + trace + log）。版號此時仍為 0.6.29（T0054 才 bump），installer 檔名為 0.6.29 屬預期。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. 新增項目：
   - BUG-014：詳細頁數值（昨天 / 過去 30 天）完整顯示；no-runner 提示 en / zh-TW 不截斷。
   - BUG-015：**真實滑鼠拖曳**（先詢問使用者）把面板拖到偏下 → `panelPosition` 寫入拖曳結束位置；開 Settings 不被工作列遮、可捲到「語言」；收起再開，`panelPosition` 不被 clamp 改寫（T0051 只用預寫位置驗證，D088）。另拖到正常位置確認首頁高度完整恢復。
   - BUG-013：各種點外情境都收起（每種 ≥3 次）；trace 有 `WM_NCACTIVATE(0)` 檢查紀錄。
3. 回歸（精簡版，各 1 次即可）：BUG-001 trace、BUG-002 無 console、BUG-004 single-instance、BUG-005 About/❓、BUG-006 Usage Trend、BUG-007 工作列、BUG-008 tray 連點、BUG-009 log 無使用者名稱、BUG-010 無殘留 node、BUG-012 cwd=repo 根 `mock` 404、i18n / 主題切換。
4. 截圖存 `_ct-workorders/assets/T0053/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.30 (T0053)`。不 push。

## 回報區

### 狀態

DONE（2026-10-15T16:07:16+08:00）— NSIS PASS；BUG-013 / 014 / 015 新增項目全部 PASS；回歸 11 項全部 PASS。HEAD `c8e120e5`。

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 not applicable（`affects_files` 空）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### Installer

- 指令：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，PowerShell `cmd.exe /c` 執行 `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。有重建前端（`tsc && vite build`）與 `Bundled 18 plugins`。
- Path：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.29_x64-setup.exe`（0.6.29 屬預期，T0054 才 bump）
- Size：5,448,303 bytes
- SHA256：`F8433FFD0B61F4C67EC0035B1F4D617EBA0E3FF678DAD3B2337EF5B50A853241`
- LastWriteTime：2026-10-15 15:57:53
- CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（預期，只少 `.sig`）。
- Release exe（target）：20,617,216 bytes，ProductVersion 0.6.29，SHA256 `9B5402E4…FA592CFA`。

### Smoke 方法

- 受測物 = installer 內容：7-Zip 解到 scratchpad（83 檔：`openusage.exe`、`resources\bundled_plugins`（18 個）、`icons`、`uninstall.exe`）。未執行 installer。解出 exe SHA256 `7FCC1B8E…7BBA9`，和 target exe 只差 3 bytes（`__TAURI_BUNDLE_TYPE_VAR_UNK` → `NSS`）。exe 內含 `blur_check_scheduled` / `wm_ncactivate` 字串（T0052 程式碼在包內）。
- 第 1 輪：cwd = 解出的安裝目錄，一般 PATH。第 2 輪：cwd = repo 根，PATH 只留 System32 / Windows / Wbem / PowerShell（無 bun / node）。
- 測前停使用者的 0.6.27（pid 17032），備份 `settings.json`（SHA256 `1F5230AC…D020`）與 `usage-api-cache.json`；測試 settings 加 `logLevel=debug`。
- 驅動：Win32（`EnumWindows` / `GetWindowRect` / `GetWindowRgn` / `mouse_event`）+ UIA，同一腳本內二次啟動 exe 叫出面板。拖曳、點外、tray、Settings、About、❓、語言、主題都用**真實滑鼠**（使用者已同意，見互動紀錄）。

### 新增項目

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-014 詳細頁數值 zh-TW | PASS | UIA：`昨天` → `$213.36 · 597M tokens`、`過去 30 天` → `$5216.49 · 13B tokens`、`今天` → `$88.73 · 226M tokens`，截圖無 `…`。`claude-detail-zh-TW.png` |
| BUG-014 詳細頁數值 en | PASS | `Yesterday` → `$213.36 · 597M tokens`、`Last 30 Days` → `$5217.15 · 13B tokens`，label 完整。`claude-detail-en.png` |
| BUG-014 no-runner 提示 | PASS | 第 2 輪 log `[plugin:claude] no package runner found for ccusage query` → `probe claude completed ok (3 lines)`。zh-TW `用量歷史` / `需要 Node.js 或 Bun`（寬 165px）；en `Usage history` / `Needs Node.js or Bun`（寬 184px）；截圖兩種語言都沒有 `…`。`claude-detail-no-runner-zh-TW.png`、`claude-detail-no-runner-en.png` |
| BUG-015 真實拖曳寫入位置 | PASS | 螢幕 2560×1440、工作區底 1368。拖「移動面板」把手 (2117,332) → (2117,1032)，拖曳中 45/45 取樣可見；放開後視窗 top=1003，`panelPosition` = `{x:1816,y:1003}`（= 拖曳結束位置） |
| BUG-015 偏下開 Settings | PASS | 點工作列收起（92ms）→ 二次啟動叫出：顯示夾到 top=748、bottom=1368，`panelPosition` 仍 `y:1003`。真實點擊「設定」(1890,1280) → 視窗 748–**1356**（不被工作列遮）；滾輪 10 下後 `語言` 在 815–857，位於視窗內。`settings-low-lang.png` |
| BUG-015 收起再開不被 clamp 改寫 | PASS | Settings 狀態收起（91ms）→ 叫出 top=760（夾過），`panelPosition` 仍 `{x:1816,y:1003}`；全程（hide 前後、show 後、進 Settings）都沒變 |
| BUG-015 拖回正常位置高度恢復 | PASS | 把手 (2117,790) 拖 −457 → top=303，`panelPosition` = `{x:1816,y:303}`；點「首頁」→ 高 **620**（完整）；再收起 / 叫出 → (1816,303) 高 620。正常位置開 Settings：高 1053、bottom 1356 |
| BUG-013 點工作列空白 | PASS 3/3 | (1300,1404)，root `Shell_TrayWnd`；放開後 91 / 92 / 93ms 收起 |
| BUG-013 點溢位 chevron | PASS 3/3 | 「顯示隱藏的圖示」(1863,1404)；93 / 109 / 91ms 收起（#1、#3 前景 = `TopLevelWindowForOverflowXamlIsland`，#2 是關 flyout 那下，前景 `Shell_TrayWnd`） |
| BUG-013 點其他視窗 | PASS 3/3 | 自建 WinForms 視窗 `T53 target`，(550,500)；93 / 93 / 91ms 收起 |
| BUG-013 點桌面 | PASS 3/3 | 暫時最小化擋住 (1200,700) 的 3 個視窗（Windows Terminal、BAT、Chrome），確認 root = `Progman` 後點擊；94 / 123 / 77ms 收起；測完還原（BAT、Chrome zoomed=True，Terminal 原本非最大化） |
| BUG-013 trace | PASS | 這 12 次期間 trace 新 313 行：`message=0x0086 wparam=0x0` **24** 次，`blur_check_scheduled ... source=wm_ncactivate` **24** 次（一對一），`Focused(false)` 12 次。debug log：`panel lost focus (wm_ncactivate); hiding` 16 次、`(focused_false); hiding` 0 次（新路徑先到，Focused 那次看到已隱藏就不動作） |

### 回歸（各 1 次）

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-001 trace | PASS | 整段測試 trace 新 981 行：`has_chrome_bits=true` **0** 次、`false` 198 次；`WM_NCACTIVATE(0)` 56 次全部 `result=1`；面板 style `0x14000000` |
| BUG-002 無 console | PASS | 按首頁 2 個「重試」後 20 秒取樣 71 次（每次含 CIM 查詢，約 280ms 一次）：新可見 top-level 視窗 0；期間 bun / node / ccusage 程序最多 8 個 |
| BUG-004 single-instance | PASS | 第二個 process exit 0，`openusage` process 數 = 1，面板可見且在前景 |
| BUG-005 About / ❓ | PASS | About：`原作者 Robin Ebers`、`開源於 GitHub`、`維護者： gowerlin`（`about.png`）。❓ 在使用者既有 Chrome 視窗開新分頁，網址 `github.com/gowerlin/openusage/issues`（已用 Ctrl+W 只關該分頁） |
| BUG-006 Usage Trend | PASS | `用量趨勢：25 天，最近 226M tokens（10/15），峰值 1.7B tokens。`；log `[plugin:claude] ccusage query via bunx Current (bun.exe)` → `probe claude completed ok (11 lines)` |
| BUG-007 工作列 | PASS | 面板可見時 `Taskbar.TaskListButtonAutomationPeer` 9 個，OpenUsage 0 個；`exstyle=0x00040010` |
| BUG-008 tray 連點 | PASS | 測試 exe 圖示在溢位 flyout (1743,1192)；連點 6 下 × 間隔 800 / 300 / 150ms，每 10ms 取樣：開 / 關正常交替，每下狀態切換 ≤1 次（無閃爍） |
| BUG-009 log 無使用者名稱 | PASS | 新 log 192 行（debug 50 行）：`host_api` 46 行含使用者名稱 0 次；整段 0 次；`app_data_dir: … path=[PATH]`；ERROR 0 行 |
| BUG-010 無殘留 node | PASS | 重試結束後 ccusage 相關程序 0，+5s 仍 0；app `Responding=True`；收尾時 0 |
| BUG-012 cwd=repo 根 `mock` 404 | PASS | repo 根有 `plugins/mock`。cwd = repo 根：port 6736 屬測試 process（pid 37940），`/v1/usage/mock` → **404**、`claude` 200、`codex` 200；`settings.json` 無 `mock`、AppData 無 `plugins\mock` |
| i18n 切換 | PASS | 英文 → `Metric / App Theme / Language` 等，`language=en`；切回繁體中文 → `語言 / 指標 / 預設`，`language=zh-TW`（兩輪各做一次） |
| 主題切換 | PASS | Dark → `dark`、Macaron Pink → `macaron-pink`、Macaron Blue → `macaron-blue`（還原使用者原值），畫面變色（scratchpad 截圖） |

### 截圖

存 `_ct-workorders/assets/T0053/`。面板 window region 外像素塗成灰色棋盤格；逐張目視：無 token / email / 帳號 ID / 使用者路徑（D081），只有用量金額與方案名。

- `claude-detail-zh-TW.png`、`claude-detail-en.png`（BUG-014）
- `claude-detail-no-runner-zh-TW.png`、`claude-detail-no-runner-en.png`（BUG-014）
- `settings-low-lang.png`（BUG-015：偏下位置 Settings 捲到語言）
- `about.png`（BUG-005）

### 觀察（不算 FAIL，請塔台判斷）

1. 拖到偏下（top=1003）後，首頁高度維持 620，下緣到 1623，超出螢幕（1440）直到下次 show 才夾回。拖曳後不重算高度 / 位置。工單驗收點（Settings 不被遮、位置不被改寫、拖回後高度恢復）都 PASS；若要拖曳中就限制在工作區，可另開單。
2. ❓ 在使用者既有 Chrome 視窗開新分頁（T0044 是新視窗），取決於 Chrome 當下狀態，非 app 行為差異。

### 偏離

1. 未執行 installer（同 T0044 偏離 1）：NSIS 會寫 HKCU uninstall key，違反「不改 registry」；改用 7-Zip 解出內容測。
2. BUG-002 取樣頻率約 280ms（工單未規定），T0044 為 100ms；20 秒內 71 次取樣皆無新視窗。
3. 回歸項各 1 次；i18n 在兩輪各切一次（第 2 輪為了 no-runner 英文截圖）。

### 互動紀錄

- Q（Worker，開始控滑鼠前）：「T0053 實機測試需要控制滑鼠，約 15–25 分鐘…期間會先停掉您常駐的 OpenUsage…點桌面時也會暫時最小化 BAT / Chrome 再還原。可以開始嗎？」A（使用者）：「可以，NSIS 建好就開始」。

### 清理

- 測試 app 已關閉；ccusage 相關程序 0；`T53 target` 視窗已關。
- `settings.json` 從備份還原，SHA256 `1F5230AC…D020` 一致；測後版本（`DA880C53…`，差異 = `logLevel=debug`、retired `windsurf` 從 `plugins` 清單移除（已知遷移）、key 順序）存 scratchpad。`usage-api-cache.json` 也從備份還原。
- 以安裝目錄 `C:\Users\<user>\AppData\Local\OpenUsage` 為 cwd 重啟已安裝版 0.6.27（pid 38580）；重啟後 `settings.json` SHA256 仍一致；`plugins\windsurf` 已補回。
- 已安裝 exe 沒覆蓋（SHA256 `126393F1…AE08B` 前後一致）。沒改 registry。沒執行 installer。
- 被最小化的 3 個視窗已還原；❓ 開的分頁已關。剪貼簿未動。
- 沒 push / tag / 發行。

### Commit

`docs: windows smoke for 0.6.30 (T0053)`（hash 見 frontmatter `commit`）。只含回報區 + 截圖，未 push。
