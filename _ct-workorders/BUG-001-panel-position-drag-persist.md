---
schema_version: 1
schema_kind: bug
id: BUG-001
title: Panel window position should be draggable and persisted
status: CLOSED
severity: Medium
created_at: "2026-05-24 09:17:34 +08:00"
updated_at: "2026-05-24T19:20:49+08:00"
related_workorder: T0031
affects_files:
  - src/components/app/app-shell.tsx
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src/index.css
  - src-tauri/capabilities/default.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel_position.rs
depends_on: []
---

# BUG-001 Panel Window Position Should Be Draggable And Persisted

## 元資料
- **編號**：BUG-001
- **標題**：Panel window position should be draggable and persisted
- **狀態**：CLOSED
- **嚴重度**：🟡 Medium
- **建立時間**：2026-05-24 09:17:34 (UTC+8)
- **關聯工單**：T0011, T0022
- **最新補救工單**：T0031

## 問題描述

使用者回報：

> 面版視窗顯示後要能拖曳移動位置，並記住位置，下次開起在記憶位置。

## 預期行為

- 指揮塔 / 工單面板類型的浮動視窗開啟後，可以拖曳移動。
- 使用者關閉後再次開啟，視窗出現在上次位置。
- 重新整理或重啟 app 後仍使用記憶位置。
- 若視窗大小或螢幕尺寸改變，位置需 clamp 到可見範圍，避免開到畫面外。

## 實際行為

- 面板開啟後固定在預設位置，不能拖曳移動。
- 下次開啟不會回到使用者期望位置。

### 2026-05-24 安裝版驗收補充

T0011 source-level 修復後，使用者用安裝版驗收仍回報：

1. 拖曳作用區游標會變小手手，tooltip 顯示「移動面板」，但按住滑鼠左鍵拖曳沒有效果。
2. 面板外透明 padding 仍會攔截滑鼠事件，應作為穿透式視窗遮罩。

T0022 / T0024 新安裝包驗收後，使用者確認：

1. System Tray icon 已正確。
2. 不規則透明視窗遮罩已有效。
3. 但某些狀態下 Windows native title bar / title controls 會出現在面板上緣。

T0025 新安裝包驗收後，使用者截圖回報 native title bar 仍會出現，且是完整標題列。

T0026 新安裝包驗收後，使用者補充 native title bar 仍會出現，觸發條件疑似為面板 Active / Focus 後，再離開 focus。

T0027 新安裝包驗收後，使用者回報問題還是一樣；下一步改為加 detail trace log 收集 runtime 證據。

T0028 新安裝包驗收後，使用者確認問題復現。Trace 顯示 Tauri / Tao 會在 hidden/show/focus/resize state transition 後把 native chrome style bits 寫回。

T0029 新安裝包驗收後，使用者補充實際觸發條件為滑鼠點到別處、面板 deactive 時出現 native title bar。追加 trace 顯示 `set_ignore_cursor_events(...)` passthrough 切換本身也會把 decorated style bits 寫回 HWND。

T0030 新安裝包驗收後，使用者確認仍有其他途徑會出現 native title bar。T0030 後 trace 已無 cursor-ignore 路徑，但 focus / deactive 後仍出現 style pruning，表示 root cause 需要在 Windows native non-client message 層處理。

## 重現資訊

- 可重現性：100%（依目前 UI 行為）
- Workaround：無穩定 workaround；使用者只能接受預設位置。

## 修復策略

- T0011：完成面板拖曳區、位置記憶、位置 clamp。
- T0022：補上安裝版缺口，包含 Tauri `startDragging` capability、Windows native window region mask、transparent padding cursor pass-through。
- T0025：強制清除 Windows native title bar / system menu / resize frame style bits，並在 `set_ignore_cursor_events` 切換後重新套用。
- T0026：將 Windows title bar style enforcement 移入可見期間的 mask thread loop，處理 Tauri / Tao async window-state 晚一步覆寫 HWND style 的狀態。
- T0027：針對 focus 離開時的 DWM non-client redraw，停用 DWM non-client rendering 與 non-client paint。
- T0028：新增 Windows-only panel detail trace log，收集 focus/blur、style/exstyle、DWM attribute、window/client/frame bounds 與 region / cursor passthrough 狀態。
- T0029：依 T0028 trace 結果，在 `show()` 後、`set_focus()` 後、`hide()` 後與非 `Moved` window event 當下同步 enforce chrome，避免 decorated style bits 留到下一次顯示。
- T0030：移除 Windows `set_ignore_cursor_events(...)` passthrough toggle，改由精準 `SetWindowRgn` panel + arrow region 讓透明 padding 真正不屬於本 HWND。
- T0031：安裝 Windows native subclass，攔截 `WM_NCCALCSIZE`、`WM_NCACTIVATE`、`WM_NCPAINT`、`WM_STYLECHANGING`，從 non-client message 層移除 / 阻止 standard frame。
- 使用者安裝版驗收回報「解決了」；BUG 狀態改為 CLOSED。

## 驗收條件

- [x] 面板顯示後可用標題列 / 明確拖曳區移動位置。
- [x] 拖曳不干擾 tab、按鈕、checkbox、scrollbar、輸入欄位等互動元素。
- [x] 關閉再開啟後使用上次位置。
- [x] app reload / restart 後仍可使用記憶位置。
- [x] 位置資料異常或超出 viewport 時會回到可見範圍。
- [x] 有合適的 regression test；若 UI/E2E 測試成本過高，至少補 helper/storage/clamp 單元測試。

## 追加驗收條件

- [x] 安裝版有 `core:window:allow-start-dragging` 權限。
- [x] 拖曳把手具備 Tauri drag region 標記，不被內層 pill 攔截。
- [x] Windows transparent padding 使用 native window region mask，不再保留完整矩形 HWND 可點選區。
- [x] Windows undecorated native shadow 已關閉，避免完整矩形外框線。
- [x] Windows native title bar / title controls style bits 已強制移除。
- [x] Windows DWM non-client title bar rendering 已停用。
- [x] 安裝版可寫出 Windows panel detail trace log。
- [x] Windows transparent padding 不再依賴 `set_ignore_cursor_events(...)` 切換。
- [x] Windows native subclass 已攔截 non-client frame calculation / activation / paint。
- [x] 本機 NSIS installer 可成功產出。
- [x] 使用者重新安裝後確認拖曳區可拖曳移動。
- [x] 使用者重新安裝後確認透明 padding 不再屬於本視窗 focus / click 範圍。
- [x] 使用者重新安裝後確認面板不再出現 Windows native title bar / title controls。

## 回報區

### 修復狀態
CLOSED

### 驗證紀錄
- 明確拖曳區：`use-panel.test.ts` 驗證 primary pointer 呼叫 `startDragging()`，非 primary pointer 不觸發。
- 位置記憶：Rust move event 監聽將 `{ x, y }` 存到既有 `settings.json`；show/toggle 時優先套用已存位置。
- 邊界保護：`panel_position` 單元測試覆蓋超出 work area clamp 與負座標螢幕。
- 驗證命令：`bun run test --run`、`bun run build`、`cargo fmt --check`、`cargo test` 均通過。

### T0022 補救驗證紀錄

- 根因：Tauri capability 缺 `core:window:allow-start-dragging`；Windows transparent window 的透明 padding 仍吃 OS hit-test。
- 修復：新增 `core:window:allow-start-dragging`、`data-tauri-drag-region`、panel / arrow bounds sync、Windows native `SetWindowRgn` irregular mask、transparent padding cursor pass-through。
- 補充修復：關閉 Windows undecorated native shadow，避免 Tauri / Tao 造成完整矩形 1px 外框線。
- Regression：`use-panel.test.ts` 新增 native window mask bounds sync test；`panel_hit_test` 單元測試覆蓋 panel / arrow / padding / scale factor。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`。
- 待驗證：使用者用新安裝包確認實際滑鼠拖曳、去背外框、透明 padding 不再取得 focus / click。

### T0025 補救驗證紀錄

- 使用者驗收：System Tray icon 正確；不規則透明視窗遮罩有效；新增缺口為某些狀態會出現 Windows native title bar / title controls。
- 根因：Tauri / Tao 的 Windows style 更新路徑，尤其 `set_ignore_cursor_events(...)` 切換透明 padding passthrough 時，可能把 native caption / system menu / frame style bits 寫回 HWND。
- 修復：`panel_hit_test` 新增 `strip_windows_panel_chrome` 與 `enforce_panel_chrome`；在 init/show、`SetWindowRgn` 前、cursor passthrough 切換後都強制清除 title bar / system menu / resize frame bits。
- Regression：`panel_hit_test::tests::strips_native_windows_title_bar_style_bits`。
- 驗證：`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,273,772 bytes，SHA256 `56266633E449C1110060D6315C0419E24479CFD83B5F8E709EDD7D812D80D0D9`。
- 安裝版驗收：FAIL，使用者截圖顯示完整 native title bar 仍會出現；T0026 接續補救。

### T0026 補救驗證紀錄

- 根因補充：Tauri / Tao window-state 更新可能在呼叫點 enforcement 之後才寫回 HWND style；一次性 enforcement 會被晚一步覆蓋。
- 修復：在現有 Windows mask thread 中，當 main window 可見時每 33ms 檢查 HWND style；只有發現 title/frame bits 回來才呼叫 `SetWindowLongPtrW` / `SetWindowPos(SWP_FRAMECHANGED)`。
- 驗證：`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,274,604 bytes，SHA256 `4AFDD10F1F30E0AF10A1FE3F2C7FE187BD361E64F128199DB60C4D5E6987BA72`。
- 安裝版驗收：FAIL，使用者回報 focus/blur 後仍會出現 native title bar；T0027 接續補救。

### T0027 補救驗證紀錄

- 根因補充：T0026 後仍會在面板 Active / Focus 後、離開 focus 時出現 native title bar；判定為 Windows `WM_NCACTIVATE` / DWM non-client paint 路徑重新繪製 inactive title bar。
- 修復：在 Windows panel HWND chrome enforcement 中呼叫 `DwmSetWindowAttribute`，設定 `DWMWA_NCRENDERING_POLICY = DWMNCRP_DISABLED` 與 `DWMWA_ALLOW_NCPAINT = 0`，並保留既有 style bit pruning。
- 驗證：`cargo fmt`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,276,245 bytes，SHA256 `73A34D52AEFCE048424795567C0CFA50C2162C9BE2C71D27A6B25F2C943269FF`。
- 安裝版驗收：FAIL，使用者回報仍一樣；T0028 改為收集 detail trace。

### T0028 診斷驗證紀錄

- 策略：停止疊加修補假設，改收集 Windows runtime 證據。
- Trace file：`%LOCALAPPDATA%\com.sunstory.openusage\logs\panel-window-trace.log`。
- 記錄內容：focus/blur 等 Tauri window event、HWND `GWL_STYLE` / `GWL_EXSTYLE`、style stripping 結果、window/client/extended frame bounds、`DWMWA_NCRENDERING_ENABLED`、`SetWindowRgn`、cursor passthrough、DWM attribute error。
- 驗證：`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,291,378 bytes，SHA256 `098DD274EEF9B6397377C89B1E0AEB73F5F5D85A7D0695C3E609F463C05D3B12`。
- 安裝版驗收：FAIL，使用者回報問題復現；trace 實際位置為 `C:\Users\Gower\AppData\Roaming\com.sunstory.openusage\logs\panel-window-trace.log`。
- Trace 結果：`Focused(false)` 後接 `Resized(...)` 時 style 從 `0x04000000` 變成 `0x14CB0000`，`has_chrome_bits=true`；background loop 約 3ms 後 prune 回 `0x14000000`。活體 hidden HWND 也顯示 `style=0x04CB0000`，代表 hidden/show/focus/resize state transition 會寫回 native chrome bits。

### T0029 補救驗證紀錄

- 根因：Tauri / Tao 在 window state transition 會把 decorated style bits 寫回 hidden/visible panel HWND；原 33ms loop 會晚一步，導致 title bar 可見或殘留。
- 修復：`show_panel` 在 `show()` 後與 `set_focus()` 後立即 enforce；`hide_panel` 在 `hide()` 後 enforce；Windows window event trace 在非 `Moved` event 時先記錄 before snapshot、立即 enforce、再記錄 after snapshot。
- 驗證：`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,288,954 bytes，SHA256 `45101C85CE3359CDF4B631A75E317E03C5EFD405D59E5F2BAD755C25EFE930A7`。

### T0030 補救驗證紀錄

- 使用者補充：實際觸發條件是滑鼠點到別處、面板 deactive 時出現 native title bar。
- 根因補充：T0029 trace 顯示 `cursor_ignore_changed` 後立即發生 `chrome_style_pruned before_style=0x14CB0000 after_style=0x14000000`，代表 `set_ignore_cursor_events(...)` 本身會回寫 Windows decorated style bits。
- 修復：移除 Windows cursor-ignore polling / passthrough toggle；`SetWindowRgn` 不再用 18px outset，改以精準 panel + arrow region 讓透明 padding 不屬於本 HWND。
- Regression：`panel_hit_test` 單元測試覆蓋 panel bounds、arrow bounds、transparent padding exclusion、invalid mask bounds、physical conversion、arrow polygon 與 title bar style bit stripping。
- 驗證：`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過；`rg "set_ignore_cursor_events|should_ignore_cursor|cursor_ignore_changed|WINDOW_REGION_OUTSET" src-tauri/src/panel_hit_test.rs` 無命中。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,287,033 bytes，SHA256 `4084B52DC34F2FCD1AC4AFB0010B14A66BD771874AAC259C0E5D02845127431D`。

### T0031 補救驗證紀錄

- 使用者回報：T0030 安裝版仍有其他途徑會出現 native title bar，要求依網路查詢與官方文件建議修補。
- 根因補充：Microsoft 文件顯示 `WM_NCCALCSIZE` 是移除 standard frame 的根層訊息；`WM_NCACTIVATE` 的 `DefWindowProc` 會在 inactive state 繪製 title bar。T0030 trace 也顯示 cursor-ignore 已停用後，focus / deactive 仍會觸發 style pruning。
- 修復：新增 Windows `SetWindowSubclass`；在 subclass 中攔截 `WM_NCCALCSIZE`、`WM_NCACTIVATE`、`WM_NCPAINT`，並在 `WM_STYLECHANGING` 修改 `STYLESTRUCT.styleNew`，讓 decorated style bits 在寫入前被清掉。
- Regression：新增 `windows_panel_subclass_policy` tests，覆蓋 frame removal、non-client activation / paint blocking、style message policy。
- 驗證：TDD RED 已確認；`cargo fmt --check`、`cargo test panel_hit_test --lib`、`cargo test --lib`、本機 Windows NSIS package build 均通過。
- Package：本機 NSIS installer 已成功產出：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,281,424 bytes，SHA256 `4FEDB23E41083D63F1AF7ACC4939122B2D04AB0F9BBE94E62006A565E4BE1126`。

### 使用者安裝版驗收

- 2026-05-24T19:20:49+08:00：使用者回報「解決了」。
- 結論：BUG-001 CLOSED；T0031 native subclass 修補通過安裝版視覺驗收。
