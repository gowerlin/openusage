---
schema_version: 1
schema_kind: workorder
id: T0043
title: Windows panel - no taskbar button and auto-hide on blur
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-007, BUG-008
plan_id: PLAN-004
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T13:40:55+08:00"
started_at: "2026-10-15T13:29:31+08:00"
completed_at: "2026-10-15T13:40:55+08:00"
commit: 05973976
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0042
affects_files:
  - src-tauri/tauri.conf.json
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_hit_test.rs
---

# T0043 Windows Panel: No Taskbar Button + Auto-Hide On Blur

## 背景

T0040 觀察、使用者決定修（D074）：

- **BUG-007**：面板 exstyle `0x00040010`（`WS_EX_APPWINDOW`），工作列出現按鈕。
- **BUG-008**：面板失焦不會收起，只被其他視窗蓋住（macOS 是自動收起）。

## ⚠️ 高風險區（BUG-001 歷史）

`panel.rs` / `panel_hit_test.rs` 經 T0022–T0031 多輪修正才讓 Windows 不出現 native title bar。T0031 的 native subclass 攔 `WM_NCCALCSIZE` / `WM_NCACTIVATE` / `WM_NCPAINT` / `WM_STYLECHANGING`（`GWL_STYLE`）。任何 exstyle / focus 行為改動**必須**以 `panel-window-trace.log` 證明 deactive 後 `has_chrome_bits=false`，且不規則遮罩仍有效。

## 任務指令

### BUG-007 工作列按鈕

1. 優先用 Tauri 高階設定：`tauri.conf.json` main window `skipTaskbar: true` 或 Windows 上 `set_skip_taskbar(true)`。
2. 若 Tauri / Tao 在 show/focus 時把 `WS_EX_APPWINDOW` 寫回（比照 BUG-001 style 回寫經驗），在既有 subclass `WM_STYLECHANGING` 加處理 `GWL_EXSTYLE`：移除 `WS_EX_APPWINDOW`（必要時加 `WS_EX_TOOLWINDOW`）。改動前先查 Microsoft 文件確認 `WS_EX_TOOLWINDOW` 對 focus / Alt-Tab / SetForegroundWindow 的影響，並在回報引用。
3. macOS 行為不變。

### BUG-008 失焦自動隱藏

1. Windows 上 `WindowEvent::Focused(false)` → `hide_panel`（`lib.rs` 約 L559 `on_window_event`，或 `panel.rs` `other` 模組）。
2. 必須處理的邊界：
   - **點 tray icon**：失焦先觸發隱藏，接著 tray click 又 toggle 開啟 → 閃爍 / 無法關。需要 debounce（例如記錄 blur-hide 時間，短時間內的 tray toggle 視為「關」）或等效做法。
   - 拖曳把手（`start_dragging`）期間不可誤收。
   - 面板內下拉選單 / 對話框（About、Changelog、Settings 的 select）若是同一 webview 內元素，不應觸發 blur；若 WebView2 內部 popup 造成 Focused(false)，需排除。
   - Single-instance 叫出面板（T0032）後要能正常取得焦點，不能一出現就被收起。
   - Global shortcut 開關面板仍正常。
3. macOS 行為不變（nspanel 原有）。

## 明確排除

- 不改 panel 位置記憶、遮罩形狀、tray icon。
- 不 push、不 tag、不發行。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（補 policy / debounce 單元測試）、`bun run test --run`、`bun run build`
- PASS：**Windows 實機**（release 或 dev build，cwd `%TEMP%`）：
  - 工作列無 OpenUsage 按鈕（截圖或 `GetWindowLong(GWL_EXSTYLE)` 證據）。
  - 點桌面 / 其他視窗 → 面板收起。
  - tray 左鍵連點：開 → 關 → 開，無閃爍。
  - 拖曳把手移動後不會被收起。
  - 開 Settings 下拉、About、Changelog 不會被收起。
  - 第二次啟動 exe → 面板顯示並停留（BUG-004）。
  - deactive 後 trace `has_chrome_bits=false`（BUG-001），不規則遮罩仍透明。
- 環境同 T0042；不改 registry；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`。

## 收尾

- Commit：`fix(windows): hide panel taskbar button and auto-hide on blur (T0043)`，只含本單檔案 + 回報區。不 push。

## 回報區

### 狀態：DONE

- Worker 開始：2026-10-15T13:29:31+08:00；回報：2026-10-15T13:40:03+08:00
- Commit：見 frontmatter `commit`（`fix(windows): hide panel taskbar button and auto-hide on blur (T0043)`），未 push。
- 落點檢查：WARN — C-0 `repo` 欄位 absent（observed `basename(REPO_ROOT)=openusage`）；C-1 PASS；C-3 PASS（4/4 存在）；C-2 無 branch 欄位。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### 採用做法

**BUG-007（工作列按鈕）**：只用 Tauri 高階設定 `tauri.conf.json` main window `"skipTaskbar": true`。
- tao 0.35.0 Windows 實作：`set_skip_taskbar` → `ITaskbarList::DeleteTab(hwnd)`（`platform_impl/windows/window.rs:1529`），Explorer 重啟（`TaskbarCreated`）時自動重套（`event_loop.rs:2250`）。
- exstyle 仍為 `0x00040010`（含 `WS_EX_APPWINDOW`），但多次 show/hide／focus 後工作列都沒有按鈕 → **不需**動 subclass `WM_STYLECHANGING(GWL_EXSTYLE)`，也不加 `WS_EX_TOOLWINDOW`。所以沒查 `WS_EX_TOOLWINDOW` 的 Microsoft 文件（任務指令第 2 步沒有觸發）。
- `panel_hit_test.rs` 未修改（高風險區零改動）。macOS：tauri 的 `skipTaskbar` 在 macOS 不支援、會被忽略；面板仍由 nspanel + Accessory policy 處理。

**BUG-008（失焦收起）**：`lib.rs` `on_window_event` → `panel::hide_on_blur`（`#[cfg(windows)]`）。
- 事件來源：tauri-runtime-wry 2.11.2 在單一 webview 模式下，`Focused` 來自 WebView2 `GotFocus/LostFocus`（`lib.rs:5293/5318`），不是 tao 的 `WM_NCACTIVATE`。tao 的 `is_focused()` 依賴 `WM_NCACTIVATE`，但這個訊息被 T0031 subclass 攔掉，所以**不可靠**；改用 Win32 `GetForegroundWindow`。
- 收到 `Focused(false)` 後等 150ms，在 main thread 檢查：面板可見，且前景視窗不是面板、也不是面板擁有的 popup（`GetAncestor(fg, GA_ROOTOWNER)`）→ `hide_panel`。這個延遲用來吸收舊 trace 中顯示面板時同一毫秒的 `Focused(true)→Focused(false)→Focused(true)` 抖動。
- Tray debounce：blur-hide 時記錄時間；`toggle_panel_at_tray_icon` 在 blur-hide 後 500ms 內收到點擊 → 視為「關」，不重開（用 `take` 清除，只作用一次）。
- 純函式 `should_hide_after_blur` / `is_recent_blur_hide` 加單元測試 2 項。
- macOS `macos` 模組未改（仍是 nspanel `window_did_resign_key`）。

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | 無輸出 |
| `cargo test --locked` | PASS | 143 passed（含 `panel::tests::blur_hides_visible_panel_only_when_foreground_moved_away`、`tray_click_right_after_blur_hide_counts_as_close`）；在 VsDevCmd x64 + `LIBCLANG_PATH` 下執行 |
| `bun run test --run` | PASS | 68 files / 1196 tests |
| `bun run build` | PASS | 只有既有的 chunk size 警告 |
| release build | PASS | `bun run tauri build --no-bundle` → `src-tauri/target/release/openusage.exe` |

**Windows 實機**（release exe，cwd `%TEMP%`；用 Win32/UIA PowerShell 腳本驅動與取證）：

| 項目 | 結果 | 證據 |
|---|---|---|
| 工作列無按鈕 | PASS | 面板可見時，UIA 列舉 `Shell_TrayWnd` 的 `Taskbar.TaskListButtonAutomationPeer` 沒有 OpenUsage；截圖確認；`GWL_EXSTYLE=0x00040010`（`DeleteTab` 生效） |
| 點其他視窗 → 收起 | PASS | +80ms visible=True；+580ms visible=False，前景=BAT 終端 |
| tray 左鍵連點 開→關→開 | PASS | icon 在工作列上，100ms 取樣：按壓 60ms `11111111/00000000/11111111`；按壓 300ms（走 blur-hide + debounce 路徑）`00000000/11111111`，無閃爍 |
| tray 溢位區（Win11 隱藏圖示） | PASS（備註） | 點 chevron 時溢位視窗取得前景 → 面板收起；之後點 icon → 開啟 |
| 拖曳把手後不收起 | PASS | 位置 (1816,303)→(1616,403)；拖曳中與放開後 +800ms 面板仍可見、仍是前景 |
| About / Changelog | PASS | 開啟後面板停留、仍是前景（截圖） |
| Settings 下拉 | N/A→PASS | Settings 沒有 `<select>`／下拉元件（只有分段按鈕）；點選項＋滾輪捲動都不收起 |
| WebView2 原生右鍵選單 | PASS | 右鍵 nav plugin 出現原生 context menu，面板仍可見、仍是前景 |
| 全域快捷鍵 | PASS | 暫時設定 `CommandOrControl+Alt+Shift+U`：開→關→開，100ms 取樣無抖動 |
| 第二次啟動 exe（BUG-004） | PASS | 面板先失焦收起，再次啟動 exe → 3 秒內 30/30 取樣都可見；5 秒後仍可見且是前景；第二個 process 已退出 |
| deactive 後 `has_chrome_bits=false`（BUG-001） | PASS | 本次新增 trace 396 行：`has_chrome_bits=true` 0 次、`false` 88 次；`Focused(false)` 後 153ms 隱藏時，`subclass_style_changing_pruned before_style=0x04CB0000 after_style=0x04000000` |
| 不規則遮罩仍透明 | PASS | `set_window_region scale_factor=1.500 result=1`；截圖中圓角外與箭頭外都是透明 |

### 偏差 / 備註

- **tray 實測環境**：新路徑的 exe 在 Win11 預設被放進溢位區。為了在不改 registry 的前提下測「icon 在工作列上」的情境，暫時把測試 exe 複製到已安裝路徑 `%LOCALAPPDATA%\OpenUsage\openusage.exe`（原檔先備份），測完已還原：SHA256 `126393F1…AE08B` 與原檔一致。
- 為了測快捷鍵，暫時在 settings.json 加了 `globalShortcut`；拖曳也改了 `panelPosition`。測完已用測前備份還原（hash 一致），並重新啟動已安裝版（PID 38832）。
- 測「?」按鈕時開啟了瀏覽器 GitHub issues 頁面（Chrome 新視窗），面板因此收起，這是預期行為，那個 Chrome 視窗沒有關。
- `panel.rs` 從 393 行變成 515 行，超過 AGENTS.md 建議的 ~400 行；本單沒有拆檔，因為新檔不在 `affects_files`。後續可考慮拆出 `panel_blur.rs`。
- `tauri build` 把 `src-tauri/Cargo.toml` 改成只有換行差異（內容相同），已還原，不在 commit 中。
- `cargo` 有既有警告 `run_ccusage_with_runner is never used`（T0042 遺留，非本單）。

### 後續建議

- 已知限制：如果 single-instance 或快捷鍵叫出面板時 `SetForegroundWindow` 被前景鎖擋下，面板會顯示但沒有焦點，之後點其他地方也不會觸發 `Focused(false)`，所以不會自動收起。本次實測沒有遇到。
- 若要拆檔，可另開工單把 Windows blur 邏輯移到獨立模組。
