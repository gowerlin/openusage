---
schema_version: 1
schema_kind: workorder
id: T0072
title: Toggle panel only on tray left-click
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-019
plan_id: PLAN-007
created_at: "2026-10-15T19:14:33+08:00"
updated_at: "2026-10-15T19:23:22+08:00"
started_at: "2026-10-15T19:16:10+08:00"
completed_at: "2026-10-15T19:22:04+08:00"
commit: dcf6585f
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0069
affects_files:
  - src-tauri/src/tray.rs
---

# T0072 Toggle Panel Only On Tray Left-Click

## 背景

BUG-019：`tray.rs:213` `TrayIconEvent::Click { button_state, rect, .. }` 只判斷 `Up`，右鍵也 toggle 面板，蓋住 tray 右鍵選單。

## 任務指令

1. 只在 `button == MouseButton::Left && button_state == MouseButtonState::Up` 時 `toggle_panel_at_tray_icon`。查 Tauri v2 `TrayIconEvent` 文件確認欄位，回報引用。
2. 確認 tray 選單（`menu_on_left_click` 等設定）仍只在右鍵出現；macOS 行為不變（macOS 若原本左鍵即 toggle、右鍵出選單，維持）。
3. 抽純函式（例如 `should_toggle_on_tray_click(button, state)`）補測試。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`、`bun run build`
- PASS：實機（release exe + `resources/`，cwd `%TEMP%`；控滑鼠前先問）：tray 右鍵 → 只出選單、面板不被 toggle（關著起始：面板保持關；開著起始：面板依 BUG-008 blur-hide 收起屬預期——塔台更正，D113）；選單「Copy Log Path」「Quit」可點；左鍵連點開 / 關正常無閃爍（BUG-008）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(tray): toggle panel only on left-click (T0072)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

PARTIAL — 修正本身完成（右鍵不再 toggle、選單正常出現），但 gate「面板開著時右鍵 → 面板不變」字面不符：面板仍被既有 blur-hide 收起（見觀察 1），請塔台判斷。

- 開始 `2026-10-15T19:16:10+08:00`；commit 見 frontmatter `commit`。
- 落點：WARN — C-0 `repo` 欄位 absent（觀察 `basename(REPO_ROOT)` = `openusage`）；C-1 PASS（工單在 `REPO_ROOT` 下）；C-3 PASS（`src-tauri/src/tray.rs` 存在）；C-2 無 `branch` 欄位。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。

### 改動

`src-tauri/src/tray.rs`：
- `tray.rs:14` 新增 `should_toggle_on_tray_click(button, button_state)`：只有 `MouseButton::Left` + `MouseButtonState::Up` 回 `true`。
- `tray.rs:217-227` `TrayIconEvent::Click` 多解構 `button`，改用上述函式判斷。
- `tray.rs:236` 新增測試 `only_left_button_release_toggles_panel`（Left Up = true；Left Down / Right Up / Right Down / Middle Up = false）。
- `show_menu_on_left_click(false)`（`tray.rs:162`）不動 → 左鍵不出選單、右鍵出選單。

### 文件引用（Tauri 2.11.2，`Cargo.lock` 版本）

- `tauri-2.11.2/src/tray/mod.rs:71-85`：`TrayIconEvent::Click { id, position, rect, button: MouseButton, button_state: MouseButtonState }`，`#[non_exhaustive]`（故保留 `..`）。docs.rs：`https://docs.rs/tauri/2.11.2/tauri/tray/enum.TrayIconEvent.html`
- `mod.rs:42-50`：`MouseButton { Left, Right, Middle }`，`PartialEq + Copy`。
- `mod.rs:314-322`：`show_menu_on_left_click` — "Whether to show the tray menu on left click or not, default is `true`"；Linux 不支援。`menu_on_left_click` 自 2.2.0 deprecated（`mod.rs:303-312`）。
- `mod.rs:62-67`：Linux 不發 tray icon event，右鍵仍出選單 → Linux 不受影響。

macOS：左鍵 Up 仍 toggle、`show_menu_on_left_click(false)` 讓右鍵出選單，行為維持；本機無 macOS，未實測（BLOCKED by 環境，僅 source 推論）。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） |
| `cargo test --locked` | PASS | `168 passed; 0 failed`，含 `tray::tests::only_left_button_release_toggles_panel ... ok` |
| `bun run build` | PASS | `✓ built in 858ms`（僅既有 chunk > 500 kB 警告） |
| release exe | PASS | `bun tauri build --no-bundle`，`target/release/openusage.exe` 19:17:28，SHA256 `95C8594D…7BAC76`；連 `resources/` 複製到 `%TEMP%\ou-t0072`，cwd `%TEMP%` 啟動（pid 47488） |
| 實機 A：面板關著 → 右鍵 ×3 | PASS 3/3 | 圖示在溢位 flyout (1743,1192)；選單 `#32768` 27–44ms 出現，項目 `Show Stats / Go to Settings / Debug Level / About OpenUsage / Quit`；1.5s 內面板 visible 轉換 0 次；Esc 後面板 / 選單皆關 |
| 實機 B：面板開著 → 右鍵 ×3 | **字面 FAIL**（見觀察 1） | 選單 27–30ms 出現（項目同上）；面板在 105 / 90 / 86ms 收起，之後未再顯示（無 toggle 回開、無閃爍） |
| 選單 Copy Log Path | PASS | UIA 展開 `Debug Level` → Invoke `Copy Log Path` → 剪貼簿 `~\AppData\Local\com.sunstory.openusage\logs\OpenUsage.log`，檔案存在；之後剪貼簿還原為測前內容 |
| 選單 Quit | PASS | UIA Invoke `Quit` → 測試 process 結束 |
| 左鍵連點（BUG-008） | PASS | 6 下 × 間隔 800 / 300 / 150ms：每下狀態只切 1 次、開關交替（`C→O→C…`），單下內無多次轉換 |

收尾：使用者 app（pid 5408）測前停止；`settings.json` 測前 SHA256 `A7CC803B…3CF15E`，測後 `47B928D8…94AD4A`（語意比對相同，只是 key 順序被 store 重寫），已還原 → SHA256 `A7CC803B…3CF15E` 相符；以安裝目錄為 cwd 重啟（pid 44164）。

### 觀察（請塔台判斷）

1. **B 段面板收起是既有 blur-hide，不是 toggle**：右鍵按下時 flyout / 選單搶前景 → `WM_NCACTIVATE` → blur-hide（T0043/T0052 設計，與點工作列 / 其他地方收起相同，86–105ms 與 T0052/T0053 量到的 ~93ms 一致）。本次測試 session trace 有 `blur_check_scheduled … source=wm_ncactivate` 25 筆。舊碼在同情境也是同結果（右鍵 Up 時 `take_recent_blur_hide` 讓面板保持關閉），所以 BUG-019 的實際症狀只在「面板關著時右鍵 → 面板彈出蓋住選單」，該情境已修好（A 段）。
   - 若要「開著時右鍵 → 面板保持開著」，需讓 blur-hide 對 tray 選單 / flyout 例外，超出本單範圍。建議：接受現行行為（與 Windows 一般 flyout 行為一致），或另開工單。
2. 副作用（可接受）：右鍵不再消耗 `recent blur-hide` 旗標；右鍵後 500ms 內再左鍵會被當成「關」，與既有 debounce 設計一致。

### 互動紀錄

- （時間未取系統時間，略）Q：實機需停使用者 OpenUsage 並點 tray，怎麼進行？A：「我用腳本控滑鼠 (Recommended)」。

### 偏離

1. Copy Log Path 本質會寫剪貼簿：測前備份剪貼簿文字，測後 `Set-Clipboard` 還原（工單「不覆蓋剪貼簿」）。
2. 開著起始狀態用「flyout 內左鍵開面板」建立（第二次啟動會搶前景、關掉 flyout）。
3. 未截圖（gate 未要求）。

### 塔台收斂（2026-10-15T19:23:22+08:00，D113）

Worker 回報 PARTIAL 係因塔台驗收條件「面板開著時右鍵 → 面板不變」與 BUG-008/013 失焦收起設計衝突（塔台用詞錯誤）。實際 BUG-019 症狀（關著時右鍵彈出面板蓋住選單）已修好 3/3。使用者確認接受 → 收斂為 DONE，原 PARTIAL 證據保留於上方。
