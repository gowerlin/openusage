---
schema_version: 1
schema_kind: workorder
id: T0059
title: Port v0.7.x: Claude rate limit resets and Fable weekly limit
status: DONE
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T17:00:54+08:00"
started_at: "2026-10-15T16:52:59+08:00"
completed_at: "2026-10-15T17:00:54+08:00"
commit: 7da18a17
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0058
affects_files:
  - plugins/claude/plugin.js
  - plugins/claude/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src-tauri/src/plugin_engine/host_api.rs
---

# T0059 Port v0.7.x: Claude rate limit resets and Fable weekly limit

## 背景

T0037 §7：
- 上游 v0.7.13：Claude「Rate Limit Resets」列（reset grants）——寫法可比照 Tauri 已有的 Codex rate-limit resets（`afb1feb4`）。
- 上游 v0.7.1：Claude Fable 模型專屬的每週限額。

## 任務指令

1. 找上游兩項實作（API 欄位、顯示邏輯）。
2. Claude plugin 加 Rate Limit Resets 列（label 已有 i18n `速率限制重置`，確認共用）與 Fable weekly line。
3. 補測試（有 / 無 reset grants、有 / 無 Fable 限額）。
4. 本機有 Claude 憑證 → 必須實機驗證並截圖。

## 移植通則（v0.7.x → Tauri plugin）

- 來源：上游 Swift 版 `upstream/main`（T0037 報告 §7）。用 `git log upstream/main --oneline -- <path>`、`git show upstream/main:<path>` 找對應 provider 實作、CHANGELOG 條目與測試 fixture。回報引用上游 commit / 檔案。
- 只移植**行為**（API endpoint、欄位、計算、顯示 line），用 fork 既有 plugin JS 寫法；不搬 Swift 架構。
- 新增 line label / value 加進 `src/lib/i18n-plugin-labels.ts`（zh-TW）。
- AGENTS.md：plugin 變動要稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單，新 request / response 欄位有缺口就補並加測試；`plugin.json` `brandColor` 維持 provider 真實品牌色；SVG 用 `currentColor`。
- 測試：用上游測試 fixture（或依 API 文件構造）補 `plugin.test.js`。
- Runtime：本機若有該 provider 的登入憑證就實機驗證；沒有則回報「未實機（無憑證）」，不得偽造。
- 若上游實作依賴 Tauri 版沒有的能力（例如需要新 host API），停下回報 BLOCKED 並說明，不自行擴大 host API。

## 驗證 Gate

- PASS：`bun run test --run plugins/claude`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
- PASS：`cargo test --locked`（若動 `host_api.rs`）
- Runtime：有憑證則實機（release exe，cwd `%TEMP%`）截詳細頁；無憑證則註明。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`feat(claude): rate limit resets and Fable weekly from upstream v0.7.x (T0059)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態：DONE

- 執行：2026-10-15T16:52:59+08:00 起；Worker（Claude Code，CT_MODE=yolo）
- Commit：`7da18a17`（`feat(claude): rate limit resets and Fable weekly from upstream v0.7.x (T0059)`），未 push / tag / 發行

### Landing Zone

- 結果：WARN
- C-0：WARN — frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage`
- C-1：PASS（工單在 REPO_ROOT 下）
- C-3：PASS — 4/4 present（`plugins/claude/plugin.js`、`plugins/claude/plugin.test.js`、`src/lib/i18n-plugin-labels.ts`、`src-tauri/src/plugin_engine/host_api.rs`）
- C-2：N/A（無 `branch` 欄位；HEAD = `main`）
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 上游引用

- Rate Limit Resets：`00189454` feat(claude): show usage-limit reset grants in a Rate Limit Resets row (#1290)；`60a379b9` fix(claude): check reset grants hourly instead of on every refresh (#1367)
- Fable：`4b068d52` feat(claude): track Fable model-scoped weekly limit from the limits array (#814)；`1e753acd` fix(claude): show Fable directly below Weekly (#1141)
- 檔案：`upstream/main:Sources/OpenUsage/Providers/Claude/ClaudeUsageMapper.swift`（`appendScopedWeeklyLimit`、`resetGrantsLine`、`droppingElapsedResetGrants`）、`ClaudeProvider+ResetGrants.swift`、`ClaudeUsageClient.swift`（`fetchResetGrants`、`resetGrantsURL`、User-Agent）、`Tests/OpenUsageTests/ClaudeResetGrantsTests.swift`、`ClaudeProviderTests.swift`（`testMapsFableScopedWeeklyLimitFromLimitsArray`）、`docs/providers/claude.md`
- 行為：
  - Reset grants：另發 `GET /api/oauth/usage?cedar_ember=1&skip_spend=1`，每小時最多一次；只在 usage 成功後發（token 已驗證）；失敗保留上次值且算作本小時檢查；`cedar_ember` 缺 / null → 無列；`eligible != true` → `0 available`；`resets_left >= 1` 才算、`ends_at` 已過略過；held 值隨時間扣掉已過期者
  - Fable：`limits[]` 中 `kind == "weekly_scoped"` 且 `scope.model.display_name == "Fable"`，`percent` 0–100，`resets_at`，週期 7 天；排在 Weekly 正下方
  - User-Agent：上游 #1290 改為 `claude-cli/2.1.294 (external, cli)`（舊 `claude-code/2.1.69` 被判 `ineligible_reason: "surface"`），兩個 usage 請求共用

### 改動

- `plugins/claude/plugin.js`：`fetchUsage()` 加 `query` 參數並換 User-Agent；新增 `parseResetGrants()`、`refreshResetGrants()`（module-scope 每小時快取）、`pushResetGrantsLine()`、`pushScopedWeeklyLine()`；`probe()` 記錄實際成功的 token（含 401 refresh 後的新 token）給 grants 請求；`_resetState()` 清 grants 狀態
- 顯示（Tauri 無上游 timeline popover）：text line `N available`；有期限時 `color` 依最近期限（>7 天藍 `#3b82f6`、≤7 天黃 `#f59e0b`、≤48h 紅 `#ef4444`，同上游門檻），`subtitle` = 最近期限本地日期 `YYYY-MM-DD`（語言中立，不需翻譯）
- `plugins/claude/plugin.json`：加 `Fable`（overview、`period: weekly`，無 `primaryOrder`）於 Weekly 後；`Rate Limit Resets`（detail）於 Extra usage 後 — 對應上游「Fable 預設顯示於 Weekly 下」「Resets 收在 caret 後」
- `src/lib/i18n-plugin-labels.ts`：新增 `pluginLabel.fable`（en / zh-TW 皆 `Fable`，模型名比照 `Sonnet`）；`Rate Limit Resets` → 既有 `速率限制重置`（與 Codex 共用）
- `plugins/claude/plugin.test.js`：
  - 新增 `Fable weekly limit` 2 測試（有 / 6 種無）、`rate limit resets (reset grants)` 10 測試（上游 live Max 20x fixture、顏色門檻、無期限、不符資格、缺 block、每小時節流、throw / 429 保留、期限過期扣除、usage 429 不發 grants）
  - 既有 4 個呼叫次數斷言改為只計 plain usage 請求（`usageRequestCount`）；401 retry 測試加斷言 grants 用 refresh 後 token；UA 斷言改新值

### 稽核

- `host_api.rs` redaction：新 query `cedar_ember`、`skip_spend` 不含敏感子字串；新回應欄位（`cedar_ember.{eligible, ineligible_reason, at_limit, exhausted, grants[].{id, resets_total, resets_left, starts_at, ends_at, clears, paused, usable_now}, next_grant_id}`、`limits[].{kind, group, percent, resets_at, scope.model.{display_name,id}, surface}`）無 secret / 使用者 ID / email（grant `id` 為活動代號如 `opus55-launch-promax-20260921`）。Authorization header 沿用既有 usage 請求路徑。無缺口，未改 `host_api.rs` → `cargo test` 不需跑
- `brandColor` `#DE7356`、`icon.svg` 未動

### 驗證

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| tests | `bun run test --run plugins/claude` | PASS | 106 passed（含 ccusage 檔；新增 12） |
| tests | `bun run test --run` | PASS | 70 files, 1227 passed |
| build | `bun run bundle:plugins` | PASS | Bundled 18 plugins（含 claude） |
| build | `bun run build` | PASS | `✓ built in 799ms`（既有 chunk > 500 kB 警告） |
| build | `cargo test --locked` | N/A | 未動 `host_api.rs` |
| build | `bun tauri build --no-bundle`（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） | PASS | `target/release/openusage.exe` 2026-10-15 16:58:08；`resources/bundled_plugins/claude/plugin.js` 含 `cedar_ember` |
| runtime | release exe 實機（cwd `%TEMP%`，真實 Claude 憑證 Max 20x） | PASS | `:6736/v1/usage/claude`：`Fable` progress used 0 / 100、resetsAt `2026-10-21T22:00:00.000Z`，位於 `Weekly` 後；`Rate Limit Resets` = `1 available`、color `#3b82f6`、subtitle `2026-10-23` |
| runtime | 詳細頁截圖 | PASS | `_ct-workorders/assets/T0059/claude-detail-resets-fable.png`（zh-TW：`每週` → `Fable 100% 剩餘 重置倒數 6天 13小時` → `速率限制重置 1 available / 2026-10-23`）；面板 region 外塗棋盤格；無 token / email / 帳號 ID |

### 實機環境還原

- 停使用者常駐 app（pid 38768，`%LOCALAPPDATA%\OpenUsage\openusage.exe`）→ 測試 exe 直接跑 `target/release`（未搬移）→ 測完停測試 exe
- `settings.json` SHA256 前 / 測後 / 還原後 / 重啟後皆 `A7CC803B7D1E096F57B05B82C2E0573222726BF31D3F6C720397D359A63CF15E`（本次無遷移改寫）；`usage-api-cache.json` 由備份還原
- 以安裝目錄為 cwd 重啟使用者 app（pid 41276）；AppData `plugins/claude/plugin.js` 與安裝版 bundled 皆不含 `cedar_ember`（使用者 app 未被換 plugin）
- 未改 registry、未跑 installer、未覆蓋安裝 exe、未控制滑鼠（UIA Invoke + 二次啟動叫出面板）、未動剪貼簿

### 偏差 / 風險 / Follow-up

- **動到 `plugins/claude/plugin.json`（不在 `affects_files`）**：Fable 要依上游「預設顯示於 Weekly 下」須有 overview manifest line；Resets 比照 Codex `afb1feb4` 加 detail line。若 Tower 不接受，可只回退這 2 行（詳細頁仍會顯示兩列）
- **User-Agent 變更影響主 usage 請求**：比照上游 #1290 兩請求共用新 UA；實機主 usage 200 正常
- **Grants 快取不分帳號**：上游以 credential fingerprint 分；fork 單一 Claude 登入，簡化為 module-scope（切換帳號最多 1 小時顯示舊帳號 grants）
- **無 timeline popover**：上游 hover 顯示各 reset 期限；Tauri 只顯示最近期限日期 + 顏色
- Overview 卡片上的 Fable 未另截圖（manifest 設定已加，僅驗詳細頁）
- `docs/providers/claude.md` 未更新（不在 `affects_files`）；建議 Tower 另單補 Fable / Rate Limit Resets 說明
- 檔案大小：`plugin.js` 1111 行、`plugin.test.js` 2289 行，原已遠超 AGENTS.md ~400 LOC 建議
