---
schema_version: 1
schema_kind: workorder
id: T0055
title: Keep panel inside work area right after dragging low
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-016
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:30:52+08:00"
started_at: "2026-10-15T16:30:52+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0054
affects_files:
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/panel_position.rs
---

# T0055 Keep panel inside work area right after dragging low

## 背景

BUG-016（T0053 觀察 1）：拖到偏下（top=1003）後，首頁高度維持 620，下緣到 1623，超出螢幕（1440），直到下次 show 才夾回。T0051 已讓高度上限依「工作區底 − 視窗 top」計算，但只在內容 resize 時重算，拖曳移動不會觸發。

## 任務指令

1. 視窗被使用者移動（非程式移動，沿用 T0051 的 `PROGRAMMATIC_MOVE` 判斷）後，重新計算高度上限並 `setSize`（前端可監聽 Tauri `onMoved`，加 debounce 例如 150ms，避免拖曳中頻繁 resize）。內容超出時面板內捲動。
2. **不移動視窗位置**、不改 `panelPosition` 規則（存使用者拖曳結果）。
3. macOS 行為：同一套上限計算，不另分平台。
4. 補測試（debounce / 觸發條件抽純函式）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（若動 Rust）、`bun run test --run`、`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`，控滑鼠前先問）：拖到偏下 → 放開後 ≤500ms 內面板下緣 ≤ 工作區底；`panelPosition` = 拖曳結束位置；拖回上方高度恢復；BUG-015 行為不退步。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(windows): refit panel height after drag (T0055)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

DONE — 寫於 2026-10-15T16:37:43+08:00。commit 見 frontmatter `commit`（本段含在 fix commit 內）。

### Landing check

- C-0 WARN：frontmatter 無 `repo`（observed `basename(REPO_ROOT)` = `openusage`）。
- C-1 PASS：工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下。
- C-3 PASS：3/3 `affects_files` 存在。
- C-2 N/A：無 `branch` 欄位（HEAD `main`）。
- `BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`；`CT_MODE=yolo`。

### 改動

- `src-tauri/src/panel_position.rs`：`persist_panel_position_from_event` 在「非程式移動」（`take_programmatic_move` 為 false，沿用 T0051 `PROGRAMMATIC_MOVE`）存位置後 emit `panel:user-moved`。`panelPosition` 規則不變，不移動視窗。
- `src/hooks/app/use-panel.ts`：新增純函式 `debounce(fn, delayMs)`；resize effect 監聽 `panel:user-moved`，150ms debounce 後呼叫既有 `resizeWindow()`（同一套 `computeMaxPanelHeightPhysical`，不分平台）。cleanup 取消 timer + unlisten（含 listen 未 resolve 就卸載）。
- `src/hooks/app/use-panel.test.ts`：`debounce` 測試（settle 後只跑一次、cancel）；hook 測試（top 100→1003→100：高 620→389→620）。
- 上游引用：無（上游為 Swift 版，未參考）。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | `FMT_OK` |
| `cargo test --locked` | PASS | lib 153 passed / 0 failed（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） |
| `bun run test --run` | PASS | 70 files / 1206 tests passed |
| `bun run build` | PASS | built（僅既有 chunk >500kB 警告） |
| 實機：拖低後 ≤500ms 下緣 ≤ 工作區底 | PASS | 螢幕 2560×1440、工作區底 1368。真實滑鼠拖把手 (1826,335) dy=+697。放開後取樣：0ms T=1003 H=620（B=1623）→ **61ms** H=353、B=1356，之後穩定 |
| 實機：`panelPosition` = 拖曳結束位置 | PASS | `{"x":1526,"y":1003}` = 視窗 (1526,1003) |
| 實機：拖回上方高度恢復 | PASS | 拖回 top=303：放開後 94ms H≥620，最終 H=620、B=923；`panelPosition` = `{"x":1526,"y":303}` |
| 實機：BUG-015 不退步 | PASS | 偏下 (top 1003) 開 Settings：B=1356、`panelPosition` 仍 y=1003；回首頁同；Esc 收起 → 二次啟動叫出 top=1003 H=353，`panelPosition` 不變。正常位置 (top 306) 開 Settings：H=1050、B=1356 |

- 實機環境：`bun tauri build --no-bundle` 的 release exe + `resources/` 複製到 `%TEMP%\openusage-t0055\`，cwd `%TEMP%`。停使用者常駐 app（`%LOCALAPPDATA%\OpenUsage\openusage.exe`），測後以安裝目錄為 cwd 重啟；`settings.json` 備份還原，SHA256 `A7CC803B…F15E` 比對相符（3 次皆相符）。未改 registry、未覆蓋安裝版、未跑 installer、未動剪貼簿、無截圖。
- 實機跑 3 次：第 1 次全流程 PASS 但腳本 log 混入回傳值，拖低的時間戳沒記到；第 2 次 UIA 取到錯的把手座標（(1889,375)），沒拖到（僅取得正常位置 Settings 數據）；第 3 次改用固定偏移 `top+29`（第 2 次 UIA 與 T0053 同值）取得 61ms 證據後，UIA 找不到「設定」按鈕中止（finally 已還原）。表內數據取自第 1、3 次。

### 互動紀錄

- Q（2026-10-15，build 完成後、smoke 前；系統時間 16:30:52 與 16:34:51 之間）：實機拖曳方式？A：使用者選「我控滑鼠拖曳」。之後 3 次 smoke 皆為同一授權範圍內重跑。

### 偏差

- 「非程式移動」判斷放在 Rust 端（只對使用者移動 emit 事件），前端不直接用 `onMoved`：前端看不到 `PROGRAMMATIC_MOVE`。
- 拖低後高 353（非 1368−1003−8=357）：面板 `maxHeight` 扣箭頭後內容 scrollHeight 再次觸發 resize，與 T0051 既有行為一致（T0053 Settings 底同為 1356）。

### Follow-up

- 無。`%TEMP%\openusage-t0055\` 測試副本保留（未刪）。
