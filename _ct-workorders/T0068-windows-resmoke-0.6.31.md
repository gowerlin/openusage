---
schema_version: 1
schema_kind: workorder
id: T0068
title: Windows focused re-smoke + NSIS for 0.6.31 after T0067
status: IN_PROGRESS
priority: High
type: verification
plan_id: PLAN-006
bug_id: null
created_at: "2026-10-15T17:51:22+08:00"
updated_at: "2026-10-15T18:16:04+08:00"
started_at: "2026-10-15T18:16:04+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0067
affects_files: []
---

# T0068 Windows Focused Re-Smoke + NSIS For 0.6.31

## 背景

T0062 PARTIAL（BUG-016 停頓放開 FAIL），其餘 13 項回歸與移植項全 PASS。T0067 修正後重驗。方法同 T0062（7-Zip 解 installer 內容測，不執行 installer）。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. **BUG-016 完整矩陣**（真實滑鼠，控滑鼠前先問）：拖低立即放開 / 停頓 150ms / 停頓 500ms；先拖低再拖回上方立即 / 停頓 500ms 放開——每種 ≥3 次，記錄放開後 0 / 100 / 500 / 1500ms 的 rect 與可見 region。
3. BUG-018：trace log `trace_ready` 行無使用者名稱。
4. 受 T0067 影響的回歸：BUG-001 trace、BUG-008/013 點外收起（3 種）、BUG-008 tray 連點、BUG-015 偏下開 Settings、BUG-004 二次啟動、拖曳中面板不收起。
5. 精簡抽查（各 1 次）：Claude Fable /「可用 N 次」、BUG-006 Usage Trend、BUG-009 OpenUsage.log 無使用者名稱、BUG-012 `mock` 404。
6. 截圖存 `_ct-workorders/assets/T0068/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows re-smoke for 0.6.31 (T0068)`。不 push。

## 回報區

### 狀態

DONE（2026-10-15T18:21:26+08:00）— NSIS PASS；BUG-016 矩陣 5 情境 × 3 次 **全 PASS**（T0062 兩個 FAIL 未再出現）；BUG-018 PASS；T0067 影響回歸 7 項全 PASS；精簡抽查 4 項全 PASS。HEAD `d6e873b8`（含 T0067 `4331f8de`）。

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 not applicable（`affects_files` 空）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### Installer

- 指令：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，PowerShell `cmd.exe /c` 執行 `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。有重建前端（`tsc && vite build`）與 `Bundled 18 plugins`。
- Path：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.30_x64-setup.exe`（版號 0.6.30 屬預期，T0063 才 bump）
- Size：5,447,415 bytes
- SHA256：`318DB3B62EC819DD855EF7F827A5D3CA819E1BB782B416ED790FF49FCF597E34`
- LastWriteTime：2026-10-15 18:17:27
- CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（預期，只少 `.sig`）。
- Release exe（target）：20,597,248 bytes，ProductVersion 0.6.30，SHA256 `61939BEC…D30E`。

### Smoke 方法

- 受測物 = installer 內容：7-Zip 解到 scratchpad（83 檔，`resources\bundled_plugins` 18 個），解出 exe SHA256 `C293D371…D23F`。未執行 installer。
- cwd = 解出目錄（BUG-012 那段改 cwd = repo 根）。settings 不改（沿用使用者設定，`logLevel` 非 debug）。
- 測前停使用者 0.6.30（pid 32036），備份 `settings.json`（SHA256 `A7CC803B…F15E`）與 `usage-api-cache.json`。
- 驅動：單一 PowerShell 腳本（Win32 + UIA），二次啟動叫出面板；拖曳、點外、tray、設定用**真實滑鼠**（使用者已同意，見互動紀錄）。螢幕 2560×1440，工作區底 **1368**。執行 18:19:04–18:20:50。
- 拖曳：把手 `(視窗中心 x, top+29)`，30 步 × 25ms 移到 T=1003（拖低）或 T=306（拖回），停頓 0 / 150 / 500ms 後放開。放開後每 ~5ms 取樣 1.6s，記 0 / 100 / 500 / 1500ms 的 window rect 與可見 region（`GetWindowRgn` + `GetRgnBox`）。按住期間記 rect 高度集合 `heldH` 與可見狀態 `heldVis`。
- 基準：首頁在 T=306 → rect H=761（B=1067），可見 316–1030（h714）。拖低後首頁應為 H=353 B=1356，可見 1013–1319（h306）。

### BUG-016 矩陣（各 3 次）

格式：`rect T/H/B` ／ 可見 region 上–下。3 次數值一致時合併；第 2 欄「放開後首次變化」為 3 次的實測 ms。

| 情境 | 按住期間 | +0ms | +100ms | +500ms | +1500ms | 放開後首次變化 | 結果 |
|---|---|---|---|---|---|---|---|
| 拖低、立即放開 | `heldH={761}` `heldVis={1}` | T1003 H761 B1764 ／ 1013–1727 | T1003 H353 **B1356** ／ 1013–**1319** | 同左 | 同左 | 61 / 61 / 61ms | PASS 3/3 |
| 拖低、停頓 150ms | `{761}` `{1}` | T1003 H761 B1764 ／ 1013–1727 | T1003 H353 **B1356** ／ 1013–1319（r3 @122ms） | 同左 | 同左 | 61 / 59 / 61ms（r3 region 90ms） | PASS 3/3 |
| 拖低、停頓 500ms | `{761}` `{1}` | T1003 H761 B1764 ／ 1013–1727 | T1003 H353 **B1356** ／ 1013–1319 | 同左 | 同左 | 59 / 61 / 65ms | PASS 3/3（另 BUG-015 前置 1 次 60ms，共 4/4） |
| 拖低後拖回、立即放開 | `{353}` `{1}` | T306 H353 B659 ／ 316–622 | T306 **H761** B1067 ／ 316–**1030** | 同左 | 同左 | 74 / 75 / 61ms（region 90 / 75 / 75ms） | PASS 3/3（另 restore-up 1 次，共 4/4） |
| 拖低後拖回、停頓 500ms | `{353}` `{1}` | T306 H353 B659 ／ 316–622 | T306 **H761** B1067 ／ 316–1030 | 同左 | 同左 | 74 / 58 / 74 / 74 / 61 / 61ms（region 103 / 58 / 90 / 90 / 77 / 75ms） | PASS **6/6**（低處停頓 150ms 後 ×3、500ms 後 ×3） |

- 拖低：+100ms 起下緣 B=1356 ≤ 1368，可見下緣 1319，之後到 1.5s 不變。T0062 的「放開後 14ms 還原成 B=2053」未再出現。
- 拖回：+100ms 起 H=761 = 基準，可見 h714 = 基準。T0062 的「卡在 H=353、面板被截短」未再出現。
- `panelPosition` 每次 = 放開位置（`{"x":1526,"y":1003}` / `{"x":1526,"y":306}`）。
- 拖曳中 `heldH` 只有 1 個值（拖曳中 0 次 setSize），`heldVis={1}`（**拖曳中面板不收起** PASS，全部 20 次拖曳，與 trace `move_loop_enter` 20 相符）。
- 見觀察 1（+0ms 的瞬間狀態）。

### BUG-018

PASS — 本次 2 次啟動的 `trace_ready` 行：`event=trace_ready path=[PATH]`（2/2）。測試期間新增 trace 896 行，使用者名稱出現 **0** 次。

### T0067 影響回歸

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-001 trace | PASS | 新 trace 896 行：`has_chrome_bits=true` **0**、`false` 220；`WM_NCACTIVATE`（`message=0x0086 wparam=0x0`）28 次全 `result=1`；`blur_check_scheduled … source=wm_ncactivate` 28 次；`move_loop_enter` 20 / `move_loop_exit` 20、`move_loop_emit` 40 |
| BUG-008/013 點外收起 | PASS | 工作列空白 (1300,1404) root `Shell_TrayWnd` **78ms**；其他視窗（自建 `T68 target`）**106ms**；桌面（暫時最小化擋住的 `Chrome_WidgetWin_1` ×2（BAT / Chrome）與檔案總管 ×2，root `Progman`）**106ms**，4 個視窗已還原（原最大化者 `zoomed=True` 維持） |
| BUG-008 tray 連點 | PASS | 測試 exe 圖示在溢位 flyout `TopLevelWindowForOverflowXamlIsland` (1743,1192)；6 下 × 間隔 800 / 300 / 150ms：開 / 關正常交替，每下狀態只切 1 次（無閃爍） |
| BUG-015 偏下開 Settings | PASS | T=1003 真實點「設定」→ T1003 H353 **B1356**（可見 1013–1319，`bug015-settings-low.png`）；回首頁同；點工作列收起 94ms → 再叫出 T1003 H353 B1356，`panelPosition` 仍 `y:1003` |
| BUG-004 二次啟動 | PASS | 二次啟動後 `openusage` process 1 個，面板 `visible=True`、在前景 |
| 拖曳中面板不收起 | PASS | 上方矩陣 `heldVis={1}`，全部拖曳 |

### 精簡抽查（各 1 次）

| 項目 | 結果 | 證據 |
|---|---|---|
| Claude Fable /「可用 N 次」 | PASS | 詳細頁順序 `工作階段` → `每週` → **`Fable`**（100% 剩餘）→ `速率限制重置` **`可用 1 次`** / `2026-10-23`；UIA 無 `N available`（`claude-detail.png`） |
| BUG-006 Usage Trend | PASS | `用量趨勢：25 天，最近 491M tokens（10/15），峰值 1.7B tokens。`，長條圖有畫（`claude-detail.png`） |
| BUG-009 OpenUsage.log 無使用者名稱 | PASS | 新 log 6 行（2 次啟動，非 debug）：使用者名稱 0 次；`app_data_dir: … path=[PATH]`；`[ERROR]` 0 行 |
| BUG-012 `mock` 404 | PASS | cwd = repo 根（有 `plugins/mock`），port 6736 屬測試 process（pid 41940）：`/v1/usage/mock` **404**、`claude` 200、`codex` 200；`settings.json` 無 `mock`、AppData 無 `plugins\mock` |

### 截圖

存 `_ct-workorders/assets/T0068/`。面板 window region 外塗棋盤格；逐張目視：無 token / email / 帳號 ID / 使用者路徑（D081），只有用量數字、方案名。

- `bug016-low-hold500.png`（拖低停頓 500ms 後：H353，底部列完整在工作區內）
- `bug016-up-hold500.png`（拖低再拖回停頓 500ms 後：H761 完整首頁，無截短）
- `bug015-settings-low.png`（偏下開設定）
- `claude-detail.png`（Fable、可用 1 次、用量趨勢）

### 觀察（請塔台判斷）

1. 放開瞬間（+0ms）rect 仍是拖曳開始的高度（拖低時 H761 B1764，可見下緣 1727 > 1368），約 60ms 後 refit 成 B1356。這是 T0067 設計（拖曳中不 setSize、`drag-ended` 後 40ms refit）的預期結果，非 FAIL；人眼幾乎看不到。若要更順可在拖曳中也限制高度，但會回到 T0062 的問題，不建議。
2. 已安裝版（舊 build）重啟時仍寫未遮蔽的 `trace_ready` 行（T0067 已知），要等發行新版。
3. 標題寫 0.6.31，但版號仍 0.6.30（T0063 才 bump），與 T0062 相同。

### 偏離

1. 未執行 installer（同 T0062 偏離 1）：會寫 HKCU uninstall key，改用 7-Zip 解出內容測。
2. 「拖回停頓 500ms」跑了 6 次（低處停頓 150ms / 500ms 後各 3 次），多於工單的 ≥3。
3. 用量趨勢與詳細頁在同一張截圖內（整頁可見），未另存。
4. BUG-009 未開 debug log（不改使用者 settings），新 log 行數少（6 行）；T0062 已在 debug 下驗過 136 行。

### 互動紀錄

- Q（Worker，2026-10-15T18:16 左右、NSIS 建置前）：「T0068 實機重驗需要控制真實滑鼠約 20–30 分鐘（BUG-016 矩陣 5 情境×≥3 次、點外收起 3 種含暫時最小化 BAT、tray 連點、偏下開 Settings、二次啟動）。期間會停掉您常駐的 OpenUsage，測後以安裝目錄為 cwd 重啟並還原 settings.json。可以在 NSIS 建好後直接開始嗎？」A（使用者，答覆早於 18:16:53）：「可以，建好就開始」。實機 18:19:04–18:20:50 一次跑完。

### 清理

- 測試 app 已關；node / bun / ccusage 子程序 0；`T68 target` 視窗已關；最小化的 4 個視窗已還原；tray flyout 送 Esc 關閉。
- `settings.json` 從備份還原，SHA256 `A7CC803B…F15E` 一致；測後版本存 scratchpad `settings.after-smoke.json`。`usage-api-cache.json` 也還原。
- 以安裝目錄 `C:\Users\<user>\AppData\Local\OpenUsage` 為 cwd 重啟已安裝版 0.6.30（pid 38920）；重啟後 settings SHA 仍一致。
- 已安裝 exe 沒覆蓋（SHA256 `ED8FB971…C922` 前後一致）。沒改 registry。沒執行 installer。剪貼簿未動。沒開瀏覽器分頁。
- 腳本 / log / trace：scratchpad `t0068-smoke.ps1`、`t0068-smoke.log`、`trace-new.log`、`applog-new.log`（未入 repo）。
- 沒 push / tag / 發行。

### Commit

`docs: windows re-smoke for 0.6.31 (T0068)`（hash 見 frontmatter `commit`）。只含回報區 + 截圖，未 push。
