---
schema_version: 1
schema_kind: workorder
id: T0051
title: Keep panel within the Windows work area
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-015
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:27:08+08:00"
started_at: "2026-10-15T15:27:08+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0050
affects_files:
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/panel.rs
---

# T0051 Keep panel within the Windows work area

## 背景

BUG-015：Settings 頁面板 1152px 高，在 1368px 工作區內面板下移後底部被工作列遮住；點到被遮處會點到工作列使面板收起。進 Settings 後存的位置被夾成 y=216。

塔台預查：`src/hooks/app/use-panel.ts:228` 高度上限 = `monitor.size.height * MAX_HEIGHT_FRACTION_OF_MONITOR`，用的是**整個螢幕**，未扣工作列、未考慮面板目前 y。

## 任務指令

1. 高度上限改用**工作區**：Tauri v2 `Monitor.workArea`（先確認 `@tauri-apps/api` 版本有此欄位並引用文件；沒有則由 Rust 端提供工作區給前端），上限 = 工作區底 − 面板目前 top − 小邊距（例如 8px），並保留既有比例上限取較小者。內容超出時面板內可捲動（現有 `maxPanelHeightPx` 應已支援，確認）。
2. **位置記憶**：只在使用者拖曳結束時儲存位置；高度變化或系統夾位置（clamp）時不覆寫 `panelPosition`。找出目前「進 Settings 後存成 y=216」的寫入點並修正。
3. macOS 行為不變（`currentMonitor` 路徑沿用；若改 Rust 只動 Windows `other` 模組）。
4. 補測試（上限計算抽純函式）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（若動 Rust）、`bun run test --run`、`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`）：把面板拖到偏下位置 → 開 Settings → 面板底部不被工作列遮住、內容可捲到「語言」；`panelPosition` 仍是拖曳時的值（不被改成夾過的 y）；關閉 Settings 回首頁高度恢復。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：`fix(windows): keep panel within work area and stop clamp overwriting position (T0051)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

DONE（2026-10-15T15:32:25+08:00）

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 PASS（3 個 `affects_files` 皆存在）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。

### Commit

`fix(windows): keep panel within work area and stop clamp overwriting position (T0051)`（hash 見 frontmatter `commit`）。未 push / tag / 發行。

### 改動

| 檔案 | 改動 |
|---|---|
| `src/hooks/app/use-panel.ts` | 新增純函式 `computeMaxPanelHeightPhysical(monitor, windowTop, factor)`：上限 = min(螢幕高 × 0.8, 工作區底 − 視窗目前 top − 8px × factor)，至少 1。`resizeWindow` 改用 `currentMonitor()` 的 `workArea` + `getCurrentWindow().outerPosition().y`。原本靜默的 `catch {}` 改 `console.error`（仍走 `screen.availHeight` 後備）。 |
| `src/hooks/app/use-panel.test.ts` | `computeMaxPanelHeightPhysical` 4 個測試：面板偏下 → 工作區限制、空間足 → 0.8 比例限制、工作區 offset + 1.5x 邊距、下限 1px。 |
| `src-tauri/src/panel_position.rs` | 寫入點修正（見偏差）。`apply_stored_position` 不再把夾過的位置存回 `panelPosition`；程式 `set_position` 前記下目標於 `PROGRAMMATIC_MOVE`，`persist_panel_position_from_event` 收到相同位置的 `Moved` 時略過一次；目前位置已等於目標時不呼叫 `set_position`。新增測試 `programmatic_move_is_skipped_once`。 |

`src-tauri/src/panel.rs` 未改（Windows `other` 模組不需要動）。

### y=216 寫入點（根因）

`panel_position.rs::apply_stored_position`（每次 show 都呼叫）：用**當下視窗高度**夾位置，`target != position` 就 `save_stored_position(target)`；另外 `set_position` 觸發的 `WindowEvent::Moved` 也經 `persist_panel_position_from_event` 存檔。面板停在 Settings（1152px）時被收起，下次 show 夾成 1368 − 1152 = 216 → 寫進 `panelPosition`，使用者拖的位置就丟了。setSize（高度變化）在 Windows 不移動左上角，不觸發 `Moved`。

### 驗證

| Gate | 指令 | 結果 | 證據 |
|---|---|---|---|
| fmt | `cargo fmt --check` | PASS | exit 0（先跑 `cargo fmt` 修正 2 處排版） |
| rust test | `cargo test --locked`（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） | PASS | 152 passed，含 `panel_position::tests::programmatic_move_is_skipped_once` |
| test | `bun run test --run` | PASS | 70 files / 1204 tests（T0050 基準 1200 + 本單 4） |
| build | `bun run build` | PASS | exit 0（只有既有 chunk size 警告） |
| release | `bun tauri build --no-bundle` | PASS | exit 0，`src-tauri/target/release/openusage.exe` 15:30 |
| runtime 情境 A（偏下） | release exe 複製到 `%TEMP%\openusage-t0051`（含 `resources/`），cwd `%TEMP%`；`panelPosition` 預設成 `{x:1816,y:1000}`（代替「拖到偏下」）；UIA Invoke，未控滑鼠 | PASS | 螢幕 2560×1440，工作區底 1368。show（首頁 620）→ 夾到 top=748，bottom=1368，stored 仍 y=1000。開「設定」→ top=748 bottom=**1356** height=608（舊算法上限 1152 會壓到工作列）。收起後再 show（設定高 608）→ 夾到 top=760，stored 仍 **y=1000**（舊碼會存成 760，即 y=216 同型）。`語言` ScrollItemPattern.ScrollIntoView 後 label 1021–1063，在視窗 760–1368 內 → 可捲到。回「首頁」→ height 596、bottom 1356、stored y=1000。 |
| runtime 情境 B（使用者實際位置） | 同上，`panelPosition` = 原值 `{x:1816,y:303}` | PASS | 首頁 top=303 height=620；開「設定」→ height **1053**、bottom 1356（舊碼 1152 → bottom 1455 壓到工作列）；捲到 `語言` 786–828 在視窗內；收起再 show 位置不變；回「首頁」→ height **620**（恢復）；stored 全程 `{x:1816,y:303}`。 |

### 偏差

- **改了 `affects_files` 外的 `src-tauri/src/panel_position.rs`**：任務 2 要求修正 y=216 寫入點，寫入點就在這個檔（`panel.rs` 只呼叫它）。此檔 macOS 共用：macOS 改變只有「夾過的位置不再存回」（顯示位置不變，每次 show 仍會夾）；macOS 托盤定位走 NSPanel `setFrameTopLeftPoint`，不經 `PROGRAMMATIC_MOVE`，行為不變。
- 高度上限前端未分平台：macOS 也用 `workArea`。macOS 預設面板在選單列下，`workArea` 上限通常大於 0.8 比例上限，實際只在面板會壓到 Dock 時才變小（同屬此 bug）。無 macOS 機器，未實測。
- 「只在拖曳結束時儲存」：Tauri 無拖曳結束事件（Windows `startDragging` 送 `WM_NCLBUTTONDOWN` 後即返回）。改為「所有非程式造成的 `Moved` 都存」，拖曳中會多次寫，最後一筆 = 拖曳結束位置；程式夾位置與高度變化不寫。
- 實機未真的拖曳：以預寫 `panelPosition` 代替拖曳結果，避免控制滑鼠（工單要求控滑鼠前先問）。拖曳寫入路徑（`Moved` → save）本單未改。
- 情境 A 回首頁高度 596 而非 620：面板被夾到 top=760 後，首頁自然高 620 放不下（1368 − 760 − 8 = 600），依新上限內捲。情境 B 正常位置下高度完整恢復 620。
- 視窗高比 setSize 值少 4px（612 → `GetWindowRect` 608）：與本單無關的既有差值，未追。
- `use-panel.test.ts` 原本就 > 400 行（474 → 506），依工單把測試放在此檔，未拆。

### 環境紀錄

- 停過使用者的 OpenUsage（pid 1548）。`settings.json` 備份 SHA256 `1F5230ACA5040B2AA615EED1A77F363F6CA0896058999629450B3C965319D020`；測試 exe 另把 retired `windsurf` 從 `plugins` 清單移除（已知遷移，與本單無關）。收尾已還原，SHA256 一致；以安裝目錄為 cwd 重啟已安裝版（pid 1696），重啟後 SHA256 仍一致。
- 未改 registry、未覆蓋 `%LOCALAPPDATA%/OpenUsage/openusage.exe`、未執行 installer、未控滑鼠、未動剪貼簿、未截圖。
- 測試 exe 留在 `%TEMP%\openusage-t0051`（未刪）。

### 阻礙

無。

### 建議後續（塔台決定）

- 面板停得很低時，切到較高頁面只能內捲；若希望改成「往上移再長高」（存的位置不變），可另開單。
- 情境 A/B 皆未在 macOS 驗證。
