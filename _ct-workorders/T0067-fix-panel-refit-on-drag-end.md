---
schema_version: 1
schema_kind: workorder
id: T0067
title: Refit panel only after the drag ends (WM_EXITSIZEMOVE) + redact trace log path
status: IN_PROGRESS
priority: High
type: bugfix
bug_id: BUG-016, BUG-018
plan_id: PLAN-006
created_at: "2026-10-15T17:51:22+08:00"
updated_at: "2026-10-15T17:52:35+08:00"
started_at: "2026-10-15T17:52:35+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
affects_files:
  - src-tauri/src/panel_hit_test.rs
  - src-tauri/src/panel_position.rs
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
---

# T0067 Refit Panel Only After The Drag Ends + Redact Trace Log Path

## 背景

T0062（PARTIAL）實機：T0055 的「使用者移動 → 150ms debounce → setSize」在**放開前停頓 ≥150ms** 時失效：

- 拖低停頓放開：放開後 14ms 視窗被還原成拖曳前高度（外框 B=2053 > 工作區 1368），之後不再修正。
- 先拖低、再拖回上方停頓放開：rect 卡在 H=353，**可見面板下半被截掉**（回歸）。

推測：滑鼠仍按住時（Windows modal move loop 中）`setSize`，放開時 move loop 套回拖曳開始尺寸；放開不產生新的使用者移動事件，所以不再 refit。

另 BUG-018：`panel-window-trace.log` 的 `trace_ready` 行含使用者名稱。

## ⚠️ 高風險區

`panel_hit_test.rs` native subclass（BUG-001 / T0031 / T0052）。只能**新增觀察**訊息並發事件；**不得**改變既有訊息的 return 值或 style 處理。

## 任務指令

1. 先查 Microsoft 文件 `WM_ENTERSIZEMOVE` / `WM_EXITSIZEMOVE`（拖曳 modal loop 進出），回報引用。
2. subclass 觀察 `WM_ENTERSIZEMOVE` → 標記「拖曳中」；`WM_EXITSIZEMOVE` → 清除標記並 emit `panel:drag-ended`（照常 `DefSubclassProc`，不改 return）。
3. 前端 refit 改為：**拖曳中不 setSize**；收到 `panel:drag-ended` 後（可小延遲例如 30–50ms 讓 Windows 完成最後的 SetWindowPos）依目前 top 重算高度上限並 setSize。T0055 的 `panel:user-moved` debounce 路徑移除或改為只在非 move loop 情況（例如程式外的其他移動）使用——以「放開後一定 refit 一次、拖曳中零 setSize」為準。
4. `panelPosition` 規則不變（存使用者拖曳結束位置，T0051 / T0055 行為）。
5. BUG-018：`trace_ready` 行的路徑改走既有 `redact_paths`（或只寫遮蔽形式），只改 log 字串。
6. macOS：上述 Windows 訊息不存在，維持現行行為（不得退步）；若前端移除 `panel:user-moved` 影響 macOS，保留 macOS 路徑。
7. 補測試（refit 觸發條件純函式；trace 路徑遮蔽）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`、`bun run test --run`、`bun run build`
- PASS：實機（release exe + `resources/`，cwd `%TEMP%`；控滑鼠前先問並留互動紀錄），每情境 ≥3 次：
  - 拖低**立即放開**、拖低**停頓 150ms / 500ms 放開** → 放開後 ≤500ms 視窗 rect 下緣 ≤ 工作區底，之後穩定。
  - 先拖低，再拖回上方**停頓 500ms 放開** → 高度恢復完整（首頁 620），無截短。
  - `panelPosition` = 拖曳結束位置；BUG-015（偏下開 Settings）不退步。
  - trace：`has_chrome_bits=true` 0 次；`WM_NCACTIVATE(0)` 仍 `result=1`；有 `WM_EXITSIZEMOVE` / drag-ended 紀錄；`trace_ready` 行無使用者名稱。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(windows): refit panel after drag ends, redact trace path (T0067)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

DONE — 寫於 2026-10-15T18:14:31+08:00。commit 見 frontmatter `commit`（本段含在 fix commit 內）。

### Landing check

- C-0 WARN：frontmatter 無 `repo`（observed `basename(REPO_ROOT)` = `openusage`）。
- C-1 PASS：工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下。
- C-3 PASS：4/4 `affects_files` 存在。
- C-2 N/A：無 `branch`（HEAD `main`）。
- `BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`；`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### MS 文件引用

- [WM_ENTERSIZEMOVE](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-entersizemove)（`#define WM_ENTERSIZEMOVE 0x0231`）："Sent one time to a window after it enters the moving or sizing modal loop. … The operation is complete when DefWindowProc returns." 回傳："An application should return zero if it processes this message."
- [WM_EXITSIZEMOVE](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-exitsizemove)（`#define WM_EXITSIZEMOVE 0x0232`）："Sent one time to a window, after it has exited the moving or sizing modal loop."
- 本單不處理（不 return）這兩個訊息，照常 `DefSubclassProc`。

### 改動

- `src-tauri/src/panel_hit_test.rs`
  - 新常數 `WINDOWS_WM_ENTERSIZEMOVE` / `WINDOWS_WM_EXITSIZEMOVE`；純函式 `move_loop_transition`（enter→true / exit→false）、`move_loop_event`（→ `panel:drag-started` / `panel:drag-ended`）。
  - subclass 只**新增觀察**：`note_move_loop` 設 `IN_MOVE_LOOP`、寫 trace（`move_loop_enter` / `move_loop_exit`），另開 thread emit。thread 在 mutex 內讀「目前」狀態再 emit，所以兩個 thread 順序顛倒時最後一個事件仍對（不會卡在拖曳中）。訊息照常落到 `DefSubclassProc`；`windows_panel_subclass_policy` 與 style 處理未動。
  - `pub fn in_move_loop()`（非 Windows 恆 false）。
  - BUG-018：`trace_ready` 改用 `trace_ready_details` → 既有 `host_api::redact_log_message`（內含 `redact_paths`），只改 log 字串。
  - 測試：`tracks_move_loop_edges_only`、`move_loop_messages_keep_default_handling`（policy 對兩訊息為 `None`）、`trace_ready_path_hides_user_name`（含空白使用者名稱）。
- `src-tauri/src/panel_position.rs`：存 `panelPosition` 規則不變；move loop 中**不** emit `panel:user-moved`（loop 外的使用者移動、macOS 照舊 emit）。
- `src/hooks/app/use-panel.ts`：移除 `debounce`；新純函式 `nextPanelMoveState(dragging, signal)`：`drag-started` → 拖曳中、取消待執行 refit；`drag-ended` → 40ms 後 refit；`user-moved` 拖曳中忽略，否則 150ms debounce（macOS / loop 外路徑保留）。`resizeWindow` 拖曳中直接 return，await 後 setSize 前再檢查一次。
- `src/hooks/app/use-panel.test.ts`：`debounce` 測試換成 `nextPanelMoveState` 3 個測試；新增 hook 測試「drag-started 後 user-moved 250ms 內 0 次 setSize → drag-ended 後 389 → 拖回停頓放開恢復 620」；原 T0055 `user-moved` 測試保留。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | `FMT_OK` |
| `cargo check --all-targets` | PASS | `Finished dev profile`（VS 18 Enterprise VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） |
| `cargo test --locked` | PASS | lib 158 passed / 0 failed（新 3 個 panel_hit_test 測試在內） |
| `bun run test --run` | PASS | 70 files / 1254 tests passed |
| `bun run build` | PASS | built（僅既有 chunk >500kB 警告） |
| 實機 | PASS | 下表 |

實機環境：`bun tauri build --no-bundle` release exe（SHA256 `B78016CE…C67A`）+ `resources/` 複製到 `%TEMP%\openusage-t0067\`，cwd `%TEMP%`。螢幕 2560×1440，工作區底 1368。真實滑鼠（SetCursorPos + mouse_event）拖把手 `top+29`，T=306 ↔ 1003。取樣：按住期間每 15–25ms 記 rect 高度集合 `heldH`；放開後 2.5s 每 10ms 記變化。基準：首頁在 T=306 時 H=**734**（本機目前內容；見偏差）。

| 情境（各 3 次） | 結果 | 證據 |
|---|---|---|
| 拖低、立即放開 | PASS | 3/3：按住期間 `heldH={734}`（拖曳中 0 次 setSize）；放開後 61 / 61 / 62ms → T1003 **H353 B1356** ≤1368，之後 2.5s 不變 |
| 拖低、停頓 150ms 放開 | PASS | 3/3：`heldH={734}`；放開後 62 / 59 / 60ms → B1356，穩定 |
| 拖低、停頓 500ms 放開 | PASS | 4/4（含 BUG-015 前置）：`heldH={734}`；放開後 58 / 58 / 47 / 59ms → B1356，穩定。T0062 的「放開後 14ms 還原成 B=2053」未再出現 |
| 先拖低、拖回上方停頓 500ms 放開 | PASS | 6/6（低處立即放開後 ×3、低處停頓 500ms 後 ×3）：`heldH={353}`；放開後 61–75ms → T306 **H734 = 基準**，無截短 |
| 拖回上方立即放開 | PASS | 4/4：60–77ms → H734 |
| `panelPosition` = 拖曳結束位置 | PASS | 每次放開後 `{"x":1526,"y":1003}` / `{"x":1526,"y":306}`，與視窗位置一致 |
| BUG-015 偏下開 Settings | PASS | T=1003 點「設定」→ H353 B1356；回首頁同；點工作列收起（104ms）→ 再叫出 T1003 H353 B1356，`panelPosition` 仍 y=1003 |
| trace（測試 build 新增 495 行） | PASS | `has_chrome_bits=true` **0**（false 142）；`WM_NCACTIVATE(0)` 2 次全 `result=1`；`move_loop_enter` 20 / `move_loop_exit` 20、`move_loop_emit event=panel:drag-started` 20 / `panel:drag-ended` 20（21 次拖曳中 1 次 dy=0 未進 loop）；`event=trace_ready path=[PATH]`；使用者名稱出現 0 次 |

- 停使用者常駐 app（pid 15436，`%LOCALAPPDATA%\OpenUsage\openusage.exe`），測後以安裝目錄為 cwd 重啟（確認在跑）；`settings.json` 備份還原，SHA256 `A7CC803B…F15E` 前後相符。未改 registry、未覆蓋安裝版、未跑 installer、未動剪貼簿、無截圖。
- 腳本 / log / trace：scratchpad `t0067-smoke.ps1`、`t0067-smoke.log`、`trace-new.log`（未入 repo）。

### 互動紀錄

- Q（2026-10-15，release build 開始時；答覆早於 18:11:35）：實機需真實滑鼠拖曳、會暫停常駐 OpenUsage，是否授權？A：「授權，由 Claude 控滑鼠」。實機一次跑完（18:12:40–18:14:17）。

### 偏差

- 首頁基準高度 734 而非工單寫的 620：高度隨內容（目前資料）而定。判定改用「拖回後 H = 同位置拖曳前的 H」，6/6 相符。
- 除 `panel:drag-ended` 外另加 `panel:drag-started`：前端靠它在拖曳中擋掉 ResizeObserver 觸發的 setSize（「拖曳中零 setSize」）。
- 遮蔽用 `redact_log_message`（pub(crate)，內部呼叫 `redact_paths`），沒改 `host_api.rs` 可見性（不在 affects_files）。
- `panel_hit_test.rs`（~1030 行）超過 ~400 LOC 準則，本單前已 903 行；未拆分（高風險區，不在範圍）。
- BUG-016 / BUG-018 單據狀態未改（不在 affects_files），交塔台。

### Follow-up

- 塔台更新 BUG-016（FIXING → FIXED）、BUG-018（OPEN → FIXED）。
- 已安裝版（舊 build）重啟時仍會寫未遮蔽的 `trace_ready` 行，要等發行新版。
- `%TEMP%\openusage-t0067\` 測試副本保留（未刪）。
