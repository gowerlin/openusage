---
schema_version: 1
schema_kind: workorder
id: T0052
title: Hide panel on blur when only WM_NCACTIVATE(0) arrives
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-013
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:34:00+08:00"
started_at: "2026-10-15T15:34:00+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0051
affects_files:
  - src-tauri/src/panel_blur.rs
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel.rs
---

# T0052 Hide panel on blur when only WM_NCACTIVATE(0) arrives

## 背景

BUG-013（T0044 觀察 1）：一次失焦未收起，trace 只有 `WM_NCACTIVATE(0)`（`message=0x0086 wparam=0x0`），沒有 `Focused(false)`。BUG-008 的收起只掛在 `Focused(false)`。

## ⚠️ 高風險區（BUG-001）

`panel_hit_test.rs` 的 native subclass（T0031）攔 `WM_NCACTIVATE` 並 return `1` 以避免 inactive title bar 重繪。**不得改變該 return 行為**；只能在攔截時「額外」排程既有的 150ms blur 檢查。

## 任務指令

1. 在 subclass 處理 `WM_NCACTIVATE` 且 `wParam == 0` 時（以及若適用 `WM_ACTIVATE` 的 `WA_INACTIVE`），呼叫 `panel_blur` 既有的延遲檢查入口（同一個 150ms + `GetForegroundWindow` / `GA_ROOTOWNER` 判斷 + tray debounce），讓兩條路徑走同一套邏輯；避免重複排程造成雙重 hide（可用既有狀態去重）。
2. subclass 在 wndproc 內，不可阻塞；用既有 main-thread 排程方式（`run_on_main_thread` 或等效）。
3. 先查 Microsoft 文件 `WM_NCACTIVATE` / `WM_ACTIVATE` 的 wParam 語意，回報引用。
4. 補純函式測試（例如 `should_schedule_blur_check(msg, wparam)`）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`
- PASS：`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`；控制滑鼠前先詢問使用者）：
  - 點工作列空白 / 溢位 chevron / 其他視窗 / 桌面：面板收起（每種 ≥3 次）。
  - tray 連點無閃爍、拖曳 / About / Settings 捲動不誤收、第二次啟動面板停留（BUG-004/008 不退步）。
  - trace：deactive 後 `has_chrome_bits=true` 0 次（BUG-001）；新增 log 證明 `WM_NCACTIVATE(0)` 路徑有觸發檢查。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：`fix(windows): also check blur on WM_NCACTIVATE(0) (T0052)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

DONE

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 PASS（3 個 `affects_files` 皆存在）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。

### Commit

`fix(windows): also check blur on WM_NCACTIVATE(0) (T0052)`（hash 見 frontmatter `commit`）。未 push / tag / 發行。

### MS 文件（任務 3）

- `WM_NCACTIVATE`（https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-ncactivate ，ms.date 2025-07-14）：「If an active title bar or icon is to be drawn, the *wParam* parameter is **TRUE**. If an inactive title bar or icon is to be drawn, *wParam* is **FALSE**.」「When the *wParam* parameter is **FALSE**, an application should return **TRUE** to indicate that the system should proceed with the default processing」— 既有 `return 1` 正確（允許失活），本單不改。
- `WM_ACTIVATE`（https://learn.microsoft.com/en-us/windows/win32/inputdev/wm-activate ）：「Sent to both the window being activated and the window being deactivated.」低位字 `WA_INACTIVE` (0) = Deactivated。
- 結論：`WM_NCACTIVATE(FALSE)` 是同一次 activation 切換中、送給失活視窗的訊息，足以代表「面板失活」。subclass 原本就不攔 `WM_ACTIVATE`；再加 `WA_INACTIVE` 只會對同一次失焦重複排程，不加。

### 改動

| 檔案 | 改動 |
|---|---|
| `src-tauri/src/panel_blur.rs` | 原 `hide_on_blur` 內的 150ms + `GetForegroundWindow`/`GA_ROOTOWNER` + tray debounce 檢查抽成 `pub fn schedule_blur_check(app_handle, source)`；`Focused(false)` 以 `source="focused_false"` 呼叫。邏輯不變，debug log 多帶 source。 |
| `src-tauri/src/panel_hit_test.rs` | 新純函式 `should_schedule_blur_check(message, wparam)`（`WM_NCACTIVATE && wparam == 0`）。`start_mask` 存 `AppHandle` 到 `OnceLock`；subclass 遇 `WM_NCACTIVATE(0)` 時呼叫 `schedule_native_blur_check` → 寫 trace `blur_check_scheduled ... source=wm_ncactivate` → `panel_blur::schedule_blur_check`（只 spawn thread，不阻塞 wndproc；檢查在 `run_on_main_thread` 執行）。之後照原樣走 `windows_panel_subclass_policy` 回 `1`，**return 行為未變**（BUG-001）。新增測試 `schedules_blur_check_only_on_non_client_deactivation`。 |

去重：兩條路徑同時觸發時各排一次檢查；兩個檢查都在 main thread 依序執行，第二個看到 `is_visible()=false` 就不動作（用既有狀態去重，未加新狀態）。實測無雙重 hide / 無閃爍（見 tray 連點）。

`src-tauri/src/panel.rs` 未改。

### 驗證

| Gate | 指令 / 方法 | 結果 | 證據 |
|---|---|---|---|
| fmt | `cargo fmt --check`（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） | PASS | exit 0 |
| check | `cargo check --all-targets` | PASS | exit 0 |
| rust test | `cargo test --locked` | PASS | 153 passed（T0051 基準 152 + 本單 1） |
| build | `bun run build` | PASS | exit 0（只有既有 chunk size 警告） |
| release | `bun tauri build --no-bundle` | PASS | `src-tauri/target/release/openusage.exe` 15:36 |
| 實機：工作列空白 | release exe 複製到 `%TEMP%\openusage-t0052`（含 `resources/`），cwd `%TEMP%`；二次啟動叫出面板（前景=面板）後 SendInput 點擊 | PASS 3/3 | (1300,1404) 收起於放開後 90–122ms |
| 實機：溢位 chevron | 點「顯示隱藏的圖示」(1815,1404)，確認前景變 `TopLevelWindowForOverflowXamlIsland` | PASS 3/3 | 93–94ms 收起 |
| 實機：其他視窗 | 自建 WinForms 視窗 `T52 target`，點 (550,500) | PASS 3/3 | 93–94ms 收起 |
| 實機：桌面 | 暫時最小化擋住 (1200,700) 的 2 個視窗（BAT、Chrome），確認該點 root = `Progman` 後點擊；測完 `SW_RESTORE`，兩者恢復 zoomed | PASS 3/3 | 93–94ms 收起 |
| 實機：tray 連點 | 測試 exe 圖示在溢位 flyout（1695,1192）；flyout 開著連點 6 下，間隔 800/300/150ms 各一組，每 10ms 取樣 | PASS | 3 組皆開/關正常交替，每下狀態切換 ≤1 次，`flicker_clicks=0` |
| 實機：拖曳 | 拖「移動面板」把手 ±80/±40px ×3 | PASS 3/3 | 拖曳中/後 0 個 hidden 取樣，位置有變 |
| 實機：About 捲動 | 點版本鈕開 About（UIA 看到「開源於 / GitHub / 維護者：」），滾輪 6 下下 + 6 下上 ×3 | PASS 3/3 | 0 個 hidden 取樣 |
| 實機：Settings 捲動 | 點「設定」（UIA 看到「語言」），滾輪 8+8 ×3（另有 1 次在前一輪） | PASS 3/3 | 0 個 hidden 取樣 |
| 實機：二次啟動停留 | 面板開著時再啟動 exe ×3 | PASS 3/3 | 1.5s 內 0 個 hidden 取樣 |
| trace：BUG-001 | `panel-window-trace.log` 測試期間新增 954 行（offset 4327204 起） | PASS | `has_chrome_bits=true` **0** 次；`message=0x0086 wparam=0x0` 61 次，全部 `result=1` |
| trace：新路徑 | 同上 | PASS | `blur_check_scheduled ... source=wm_ncactivate` **61** 次（= NCACTIVATE(0) 次數）；`Focused(false)` 只有 37 次。**23 次 NCACTIVATE(0) 前後 200ms 內沒有 `Focused(false)`**（含第一輪工作列空白、chevron 測試），而面板每次都收起 → BUG-013 情境實際重現並由新路徑處理。 |

### 偏差

- 第一輪「chevron」3 次點到工作列空白：停掉使用者 app 後 tray 圖示位移，chevron 從 1743 移到 1791，座標失效。已以新座標重做 3 次（上表為重做結果）；舊 3 次算作額外的工作列空白樣本。
- 第一輪拖曳 #2/#3 與 About 測試因腳本 bug（`$c` 變巢狀陣列、`$home` 為 PowerShell 唯讀變數）點錯位置，結果作廢後重做（上表為重做結果）。
- tray 連點在溢位 flyout 內做：測試 exe 路徑不同，Windows 把它的圖示放在溢位區；為不改 tray 釘選設定（registry），未把它拖到工作列。
- 「點桌面」需暫時最小化使用者的 BAT 與 Chrome 視窗，測完已還原（zoomed=True、iconic=False）。
- `panel lost focus (source)` 是 DEBUG log，runtime 預設濾掉，未寫入 `OpenUsage.log`；以 trace 的 `blur_check_scheduled` 為證據。
- 無法從 log 區分每次 hide 由哪條路徑執行（DEBUG 未落檔）；23 次「只有 NCACTIVATE(0)」且面板仍收起，足以證明新路徑生效。
- `panel_hit_test.rs` 原本 871 行（> 400），本單 +32 行，未拆檔（超出範圍）。

### 環境紀錄

- 停過使用者的 OpenUsage（pid 1696）。`settings.json` 備份 SHA256 `1F5230ACA5040B2AA615EED1A77F363F6CA0896058999629450B3C965319D020`；測後差異 = `panelPosition`（拖曳）、retired `windsurf` 從 `plugins` 清單移除（已知遷移）、key 順序。已還原，SHA256 一致；以安裝目錄為 cwd 重啟已安裝版（pid 17032），重啟後 SHA256 仍一致。
- 有控制滑鼠（使用者已同意）。未改 registry、未覆蓋 `%LOCALAPPDATA%/OpenUsage/openusage.exe`、未執行 installer、未動剪貼簿、未截圖。
- 測後輸入法指示器顯示「英文模式」（測前「中文模式」）。測試只送過 Esc 鍵，推測是前景視窗切換造成；未自行切回，請使用者確認。
- 測試 exe 與 settings 備份留在 `%TEMP%\openusage-t0052`（未刪）。

### 阻礙

無。

### 建議後續（塔台決定）

- 若要從 `OpenUsage.log` 直接看 hide 來源，可把 `panel lost focus (source)` 升為 info（目前為 debug）。
