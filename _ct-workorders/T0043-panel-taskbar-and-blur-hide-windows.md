---
schema_version: 1
schema_kind: workorder
id: T0043
title: Windows panel - no taskbar button and auto-hide on blur
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-007, BUG-008
plan_id: PLAN-004
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T13:18:05+08:00"
started_at: null
completed_at: null
commit: null
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

（Worker 填寫：狀態、commit、採用做法與文件引用、實機逐項結果、trace 證據）
