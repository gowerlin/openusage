---
schema_version: 1
schema_kind: workorder
id: T0062
title: Windows smoke + NSIS for 0.6.31 candidate
status: IN_PROGRESS
priority: High
type: verification
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T17:27:06+08:00"
started_at: "2026-10-15T17:27:06+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0055
  - T0056
  - T0057
  - T0058
  - T0059
  - T0060
  - T0061
  - T0065
  - T0066
affects_files: []
---

# T0062 Windows smoke + NSIS for 0.6.31 candidate

## 背景

PLAN-006 發行前驗證。方法沿用 T0053（7-Zip 解 installer 內容測、不執行 installer、UIA + trace + log）。版號此時仍為 0.6.30（T0063 才 bump）。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. 新增項目：
   - BUG-016：真實拖曳到偏下 → 放開後面板下緣 ≤ 工作區底。
   - 移植項：Codex 連結 URL；Grok / Claude（Rate Limit Resets、Fable）/ OpenCode Go / Copilot 詳細頁——有憑證者實機截圖，無憑證者確認 plugin 載入且錯誤提示合理（不崩潰、不空白）。
   - Claude 詳細頁：Fable 在 Weekly 下、速率限制重置顯示「可用 N 次」（zh-TW）；Codex 速率限制重置同樣翻譯；Claude / Codex 總覽卡片 Fable 顯示（D104）。
   - Grok：無憑證時錯誤提示合理（不崩潰）；總覽 manifest Weekly line 存在。
   - Copilot（Windows）：顯示 `Not logged in` 類明確提示（BUG-017 已知，非 FAIL）。
   - README 渲染（GitHub 預覽或本機 markdown）含 Perplexity / Synthetic。
3. 回歸（精簡，各 1 次）：BUG-001 trace、BUG-002、BUG-004、BUG-005、BUG-006、BUG-007、BUG-008/013 點外收起、BUG-009、BUG-010、BUG-012、BUG-014、BUG-015、i18n / 主題。
4. 截圖存 `_ct-workorders/assets/T0062/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.31 (T0062)`。不 push。

## 回報區

### 狀態

PARTIAL（2026-10-15T17:43:53+08:00）— NSIS PASS；新增項目除 **BUG-016 FAIL**（放開前停頓 ≥150ms 時）外全部 PASS；回歸 13 項全部 PASS。HEAD `00219666`。依工單 FAIL 不修。

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 not applicable（`affects_files` 空）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### Installer

- 指令：VS 18 Enterprise `VsDevCmd -arch=x64` + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin` + `CI=false`，PowerShell `cmd.exe /c` 執行 `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。有重建前端（`tsc && vite build`）與 `Bundled 18 plugins`。
- Path：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.30_x64-setup.exe`（0.6.30 屬預期，T0063 才 bump）
- Size：5,451,812 bytes
- SHA256：`E57131CDC8E6BDAF02B9A493511474C1DFC985B84359D90EF23313B498B4B20D`
- LastWriteTime：2026-10-15 17:27:51
- CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（預期，只少 `.sig`）。
- Release exe（target）：20,591,616 bytes，ProductVersion 0.6.30，SHA256 `2A8A5AA5…6EB0`。

### Smoke 方法

- 受測物 = installer 內容：7-Zip 解到 scratchpad（83 檔，`resources\bundled_plugins` 18 個）。未執行 installer。解出 exe SHA256 `50B9860A…4715`。
- Bundled manifest：codex `links` 含 `https://chatgpt.com/settings/usage`；grok lines = `Weekly`（overview, weekly, primaryOrder 1）/ `Credits used`（overview, 2）/ `Pay as you go`；claude lines 含 `Fable`（overview）、`Rate Limit Resets`。
- 第 1 輪：cwd = 解出目錄。第 2 輪：cwd = repo 根，PATH 只留 System32 / Windows / Wbem / PowerShell（無 bun / node）。
- 測前停使用者 0.6.30（pid 43080），備份 `settings.json`（SHA256 `A7CC803B…F15E`）與 `usage-api-cache.json`。測試 settings：`logLevel=debug`，並啟用 `grok` / `opencode-go` / `copilot`（使用者原本停用，要看詳細頁）。
- 驅動：Win32 + UIA，同腳本內二次啟動叫出面板；拖曳、點外、tray、Settings、❓、語言、主題用**真實滑鼠**（使用者已同意，見互動紀錄）。螢幕 2560×1440，工作區底 1368。

### 新增項目

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-016 拖低、放開不停頓 | PASS | 把手 (1826,335) dy=+697，放開即量：T=1003，**156ms** 內 H 1050→353、B=1356（另 2 次放開當下已是 353）。`panelPosition` = `{x:1526,y:1003}` |
| BUG-016 拖低、放開前停頓 | **FAIL** | 放開前停 150 / 500ms（人手常見）：按住期間 H 已變 353，**放開後 14ms 被還原成拖曳前高度 1050**，window rect B=**2053**（> 1368），之後不再修正（取樣 1–2.5s 不變；4 次全重現）。可見部分（window region）下緣 1319，目視面板本身沒超出；超出的是透明的視窗外框（`bug016-low-hold500.png`） |
| BUG-016 拖回上方、放開前停頓 | **FAIL** | 先立即放開拖低（H=353），再拖回 top=306 並停 500ms 放開：rect 卡在 **H=353**（region 要 1003），面板下半與底部列被**截掉**（`bug016-up-after-low0-hold500.png`，3 次全重現）。切到其他頁（點 Claude）才恢復 H=1028。第 1 輪停 150ms 拖回、再點「首頁」仍是 H=353 |
| 推測原因（未修） | — | `src/hooks/app/use-panel.ts` 150ms debounce 在滑鼠還按著時觸發 `setSize`，Windows 拖曳迴圈放開時套回拖曳開始的尺寸；放開不產生新的使用者移動事件，所以不再 refit。T0055 實機是立即放開，沒遇到 |
| Codex 連結 URL | PASS | 詳細頁有 `狀態`、`用量儀表板` 按鈕（`codex-detail.png`）；URL 由 bundled `plugin.json` 證明。沒點（會開使用者瀏覽器） |
| Claude 詳細頁 | PASS | 順序 `工作階段` → `每週` → **`Fable`**（100% 剩餘、重置倒數 6天 12小時）→ `速率限制重置` **`可用 1 次`** / `2026-10-23`；UIA 無 `1 available`（`claude-detail.png`）。API：`Fable` used 0、`Rate Limit Resets` `1 available` |
| Codex 速率限制重置 | PASS | UIA `速率限制重置` / **`可用 0 次`**，無 `0 available` |
| Claude 總覽卡片 Fable | PASS | 首頁 Claude 卡：工作階段 / 每週 / **Fable**（`home-overview.png`） |
| Codex 總覽卡片 Fable | N/A | Codex manifest 沒有 `Fable` line（移植只做 Claude），總覽卡只有 `工作階段`（Free 方案無每週）。見觀察 2 |
| Grok 無憑證 | PASS | 本機無 `~/.grok`。`/v1/usage/grok` 204（已載入）；首頁與詳細頁錯誤卡 `Grok not logged in. Run grok login.`，有 `用量` 連結，不崩潰不空白（`grok-detail.png`）。manifest Weekly line 存在（上） |
| OpenCode Go 無憑證 | PASS | 204；`OpenCode Go not detected. Log in with OpenCode Go first.`，`控制台` / `文件` 連結（`opencode-go-detail.png`） |
| Copilot（Windows） | PASS（已知 BUG-017） | 204；`Not logged in. Run gh auth login first.`（`copilot-detail.png`）；log `ctx.host.keychain is unsupported on windows` |
| README 含 Perplexity / Synthetic | PASS | 本機渲染（PowerShell `ConvertFrom-Markdown`）：`<li><a href="docs/providers/perplexity.md"><strong>Perplexity</strong></a> …`、`…synthetic.md…<strong>Synthetic</strong>…`，provider 連結共 18 個。origin/main 尚未含此改動（未 push），GitHub 預覽未看 |

### 回歸（各 1 次）

| 項目 | 結果 | 證據 |
|---|---|---|
| BUG-001 trace | PASS | 新 trace 856 行：`has_chrome_bits=true` **0**、`false` 244；`WM_NCACTIVATE(0)` 43 次全 `result=1`；`blur_check_scheduled … wm_ncactivate` 43 次；style `0x14000000` |
| BUG-002 無 console | PASS | 首頁按 2 個「重試」後 20 秒取樣 162 次（約 120ms 一次）：新可見 top-level 視窗 **0** |
| BUG-004 single-instance | PASS | 二次啟動後 `openusage` process 1 個，面板可見且在前景；log `Second instance launched; showing existing panel` |
| BUG-005 About / ❓ | PASS | About：`OpenUsage v 0.6.30`、`查看變更紀錄`、`原作者 Robin Ebers`、`開源於 GitHub`、`維護者： gowerlin`。❓ → 前景 `Issues · gowerlin/openusage - Google Chrome`，面板收起；已用 Ctrl+W 只關該分頁 |
| BUG-006 Usage Trend | PASS | `用量趨勢：25 天，最近 445M tokens（10/15），峰值 1.7B tokens。`；log `[plugin:claude] ccusage query via bunx Current (bun.exe)` → `probe claude completed ok (13 lines)` |
| BUG-007 工作列 | PASS | 面板可見時 TaskListButton 10 個，OpenUsage 0；`exstyle=0x00040010` |
| BUG-008/013 點外收起 | PASS | 工作列空白 (1300,1404) root `Shell_TrayWnd` **78ms**；其他視窗（自建 `T62 target`）**93ms**；桌面（暫時最小化 BAT，root `Progman`）**93ms**，BAT 已還原（zoomed=True）；點溢位 chevron 也收起 |
| BUG-008 tray 連點 | PASS | 測試 exe 圖示在溢位 flyout (1743,1192)；6 下 × 間隔 800 / 300 / 150ms：開 / 關正常交替，每下狀態只切 1 次（無閃爍） |
| BUG-009 log 無使用者名稱 | PASS | 新 log 136 行（debug 37）：使用者名稱 0 次；`app_data_dir: … path=[PATH]`；`[ERROR]` 0 行。Codex HTTP body 的 `user_id` / `account_id` / `email` 已遮罩。見觀察 3 |
| BUG-010 無殘留 node | PASS | 重試結束後 node / bun / ccusage 子程序 0，+5s 仍 0；app `Responding=True` |
| BUG-012 cwd=repo 根 `mock` 404 | PASS | repo 根有 `plugins/mock`。port 6736 屬測試 process（pid 41500）；`/v1/usage/mock` **404**、`claude` 200、`codex` 200；`settings.json` 無 `mock`、AppData 無 `plugins\mock` |
| BUG-014 數值 / no-runner | PASS | 第 1 輪 `昨天 $213.36 · 597M tokens`、`過去 30 天 $5298.35 · 13B tokens` 完整；第 2 輪 log `no package runner found for ccusage query`，詳細頁 `用量歷史` / `需要 Node.js 或 Bun`（寬 165px，無 `…`，`claude-detail-no-runner-zh-TW.png`） |
| BUG-015 偏下開 Settings | PASS | top=1003 真實點「設定」→ T=1003 H=353 **B=1356**；`語言` ScrollIntoView 後在 1137–1179（視窗內，`bug015-settings-low-lang.png`）；點工作列收起（92ms）再叫出 T=1003 B=1356，`panelPosition` 仍 `y:1003` |
| i18n | PASS | 點 `英文` → `Language` / `App Theme` / `Metric`，`language=en`；點回繁體中文 → `語言` / `指標`，`language=zh-TW` |
| 主題 | PASS | `深色`→`dark`、`馬卡龍粉`→`macaron-pink`、`淺色`→`light`、`馬卡龍藍`→`macaron-blue`（使用者原值） |

### 截圖

存 `_ct-workorders/assets/T0062/`。面板 window region 外塗棋盤格；逐張目視：無 token / email / 帳號 ID / 使用者路徑（D081），只有用量數字、方案名、錯誤提示。

- `home-overview.png`（Claude Fable、Copilot / Grok 錯誤卡）
- `claude-detail.png`、`codex-detail.png`、`grok-detail.png`、`opencode-go-detail.png`、`copilot-detail.png`
- `claude-detail-no-runner-zh-TW.png`（BUG-014）
- `bug015-settings-low-lang.png`（BUG-015）
- `bug016-low-hold500.png`（拖低停頓：rect 1050、可見 306）、`bug016-up-after-low0-hold500.png`（拖回停頓：面板被截短）

### 觀察（請塔台判斷）

1. **BUG-016 需重開**：停頓後放開兩方向都錯（上表）。拖低時只是外框超出（可見面板在工作區內）；拖回時是可見截短，影響較大。修法方向供參考：放開後（例如 `WM_EXITSIZEMOVE`）再 refit 一次；實機測試要加「停頓 ≥500ms 再放開」。
2. Codex 總覽卡沒有 Fable：Codex manifest 本來就沒 `Fable` line。D104 / 工單寫的「Claude / Codex 總覽卡片 Fable」可能只指 Claude。若要 Codex 也顯示 Fable 需另開單。
3. `panel-window-trace.log` 的 `event=trace_ready path=C:\Users\<user>\…` 含使用者名稱（每次啟動 1 行，既有行為；BUG-009 只管 `OpenUsage.log`）。
4. 使用者把 Grok / OpenCode Go / Copilot 設為停用；本次只在測試期間暫時啟用。

### 偏離

1. 未執行 installer（同 T0053 偏離 1）：會寫 HKCU uninstall key，改用 7-Zip 解出內容測。
2. BUG-016 為了區分「外框超出」與「可見截短」，額外跑了 4 輪拖曳（同授權範圍），每輪都停 / 重啟使用者 app 並還原 settings（SHA 每次一致）。其中 2 輪因腳本截圖路徑寫錯沒存到圖，數據一致。
3. 回歸各 1 次；點外 3 種情境各 1 次（工單精簡版）。

### 互動紀錄

- Q（Worker，2026-10-15 17:27 後、NSIS 建置中）：「T0062 實機 smoke 需控制滑鼠約 15–25 分鐘…期間會停掉您常駐的 OpenUsage…點桌面時會暫時最小化 BAT / Chrome 再還原；❓ 會在 Chrome 開一個分頁（測後只關該分頁）。可以在 NSIS 建好後直接開始嗎？」A（使用者）：「可以，建好就開始」。

### 清理

- 測試 app 已關；ccusage 子程序 0；`T62 target` 視窗已關。
- `settings.json` 從備份還原，SHA256 `A7CC803B…F15E` 一致（主測後 + 4 輪 BUG-016 後各比對一次）；測後版本差異 = `logLevel=debug` + 啟用 3 個 plugin（測試刻意改的），存 scratchpad。`usage-api-cache.json` 也還原。
- 以安裝目錄 `C:\Users\<user>\AppData\Local\OpenUsage` 為 cwd 重啟已安裝版 0.6.30（最後 pid 15436）；重啟後 settings SHA 仍一致。
- 已安裝 exe 沒覆蓋（SHA256 `ED8FB971…C922` 前後一致）。沒改 registry。沒執行 installer。剪貼簿未動。被最小化的 BAT 已還原；❓ 分頁已關。
- 沒 push / tag / 發行。

### Commit

`docs: windows smoke for 0.6.31 (T0062)`（hash 見 frontmatter `commit`）。只含回報區 + 截圖，未 push。
