---
schema_version: 1
schema_kind: workorder
id: T0060
title: Port v0.7.x: OpenCode Go official usage API
status: IN_PROGRESS
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T17:01:49+08:00"
started_at: "2026-10-15T17:01:49+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0059
affects_files:
  - plugins/opencode-go/plugin.js
  - plugins/opencode-go/plugin.json
  - plugins/opencode-go/plugin.test.js
  - src-tauri/src/plugin_engine/host_api.rs
---

# T0060 Port v0.7.x: OpenCode Go official usage API

## 背景

T0037 §7：上游 v0.7.9 OpenCode Go 改用官方 usage API（provider 正確性）。

## 任務指令

1. 找上游 OpenCode Go provider 的新 API（endpoint、認證方式、欄位）與舊做法差異。
2. fork `opencode-go` plugin 改用官方 API；若認證方式需要 Tauri host API 沒有的能力 → BLOCKED 回報。
3. Windows 憑證 / 設定路徑一併確認（比照 T0004 / T0039 做法；找不到則 Windows 明確提示）。
4. 補測試；稽核 redaction。

## 移植通則（v0.7.x → Tauri plugin）

- 來源：上游 Swift 版 `upstream/main`（T0037 報告 §7）。用 `git log upstream/main --oneline -- <path>`、`git show upstream/main:<path>` 找對應 provider 實作、CHANGELOG 條目與測試 fixture。回報引用上游 commit / 檔案。
- 只移植**行為**（API endpoint、欄位、計算、顯示 line），用 fork 既有 plugin JS 寫法；不搬 Swift 架構。
- 新增 line label / value 加進 `src/lib/i18n-plugin-labels.ts`（zh-TW）。
- AGENTS.md：plugin 變動要稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單，新 request / response 欄位有缺口就補並加測試；`plugin.json` `brandColor` 維持 provider 真實品牌色；SVG 用 `currentColor`。
- 測試：用上游測試 fixture（或依 API 文件構造）補 `plugin.test.js`。
- Runtime：本機若有該 provider 的登入憑證就實機驗證；沒有則回報「未實機（無憑證）」，不得偽造。
- 若上游實作依賴 Tauri 版沒有的能力（例如需要新 host API），停下回報 BLOCKED 並說明，不自行擴大 host API。

## 驗證 Gate

- PASS：`bun run test --run plugins/opencode-go`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
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

- Commit：`feat(opencode-go): use official usage API from upstream v0.7.x (T0060)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

- 狀態：DONE（runtime 未實機：本機無 OpenCode Go 憑證）
- Commit：見 frontmatter `commit`（`feat(opencode-go): use official usage API from upstream v0.7.x (T0060)`），未 push
- 執行：2026-10-15T17:01:49+08:00 開始；CT_MODE=yolo

### Landing Zone
- 結果：WARN
- C-0：`repo` 欄位 absent → WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`
- C-1：PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下）
- C-3：4/4 testable entries present
- C-2：無 `branch` 欄位；HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 上游引用
- `064819bf` feat(opencode): switch Go meters to the official usage API (#1097) — v0.7.9
- `062fb5ec` fix(opencode): show Session reset countdown for sub-1% sessions（placeholder reset 判斷，含 HTTP `Date` header）
- 讀取：`upstream/main`（`bae20d9c`）`Sources/OpenUsage/Providers/OpenCode/{OpenCodeUsageClient,OpenCodeUsageMapper,OpenCodeProvider,OpenCodeAuthStore,OpenCodePaths}.swift`、`Tests/OpenUsageTests/OpenCodeUsageMapperTests.swift`（fixture）、`docs/providers/opencode.md`

### 新舊差異
- 舊：讀本機 `opencode.db`（sqlite）加總 `cost`，對固定美元上限（$12 / $30 / $60）估算百分比；只看本機；Windows host sqlite 不支援 → Windows 實際只會顯示 soft-empty badge。
- 新：`GET https://opencode.ai/zen/go/v1/usage`，`Authorization: Bearer <opencode-go key>`、`Accept: application/json`、timeout 15s。回傳 `usage.{rolling,weekly,monthly}.{percent,resetsAt}` → Session / Weekly / Monthly percent bar（帳號層級，同 dashboard）。不再用 sqlite → Windows 可用。
- 錯誤：401 → key rejected；403 + `error.type=EntitlementError` → no Go subscription；其他非 2xx → `Request failed (HTTP n)`；連線失敗、body 格式錯誤、`auth.json` 讀不到 / 非 JSON → 明確 throw（不再 silent soft-empty）。
- 0% Session 且 `resetsAt` 距 response `Date`（無則本機時間）恰 5h ±2s → 視為 placeholder，不顯示倒數（上游 `placeholderResetTolerance = 2`）。
- Period：Session 5h、Weekly 7d、Monthly 30d（上游 `MetricPeriod.monthMs = 30 * dayMs`）。
- 認證方式（Bearer header）用既有 `ctx.util.requestJson`，不需新 host API → 非 BLOCKED。

### Windows 憑證路徑
- OpenCode 官方 troubleshooting 文件：Windows 資料目錄 `%USERPROFILE%\.local\share\opencode`（https://opencode.ai/docs/troubleshooting）→ 與既有 `~/.local/share/opencode/auth.json` 一致，無需 Windows 分支。
- 本機 `~/.local/share/opencode/` 不存在（無憑證）。

### 改動
- `plugins/opencode-go/plugin.js`：改用官方 usage API；移除 sqlite 估算（287 → 約 150 LOC）。
- `plugins/opencode-go/plugin.test.js`：重寫 16 測試（上游 sampleBody fixture、request 形狀、clamp、placeholder drop、sub-1% 保留 reset、Date header 優先、401 / 403 Entitlement / 其他 403 / 連線失敗 / 格式錯誤 / auth.json 無 key / 非 JSON、不再呼叫 sqlite）。
- `docs/providers/opencode-go.md`：改寫為官方 API 版本（舊文件描述 sqlite 估算，已失真）。
- `README.md`：OpenCode Go 列 `5h, weekly, monthly spend limits` → `session, weekly, monthly usage`。
- `plugin.json`：不變（line label 相同，`brandColor #000000` 維持；icon 未動）。
- `src/lib/i18n-plugin-labels.ts`：不變（無新 label；舊 `Status` / `No usage data` badge 移除後不再使用）。
- `host_api.rs`：不變（見 redaction 稽核）。

### Redaction 稽核（`src-tauri/src/plugin_engine/host_api.rs`）
- Request：`Authorization` header 不寫 log（`inject_http` 只 log method + `redact_url`）；URL 無 query。
- Response：欄位只有 `usage.*.{status,percent,resetsAt}`；錯誤 body `{type,error:{type,message}}`；皆非敏感。`redact_body` 仍套用 JWT / `sk-` 類 key pattern。
- Plugin log：只 log 例外字串（`String(e)`），不含 key。
- 結論：無缺口，不改 `host_api.rs`，`cargo test` 不適用。

### 驗證
- PASS：`bun run test --run plugins/opencode-go` → 16 passed
- PASS：`bun run test --run` → 70 files / 1232 tests passed
- PASS：`bun run bundle:plugins` → Bundled 18 plugins（含 opencode-go）
- PASS：`bun run build` → exit 0（僅既有 chunk size 警告）
- N/A：`cargo test --locked`（未動 `host_api.rs`）
- 外部 endpoint 探測（無憑證）：`curl https://opencode.ai/zen/go/v1/usage` → `HTTP 401` `{"type":"error","error":{"type":"AuthError","message":"Unauthorized"}}`，確認 endpoint 存在且錯誤形狀與上游一致。
- Runtime：**未實機（無憑證）**，未截圖；未啟動 / 停止使用者 OpenUsage，未動 registry / 安裝目錄 / 剪貼簿 / 滑鼠。

### 偏差
- 額外改 `docs/providers/opencode-go.md`、`README.md`（不在 `affects_files`）：舊內容描述 sqlite 估算與 spend limits，移植後失真；AGENTS.md 要求 README 反映 plugin。
- 未移植上游 OpenCode 2 `credential` table 讀 key（`a704506b` #1323、`34474ec1` #1365）：非本單 v0.7.9 範圍，且 Windows host sqlite 不支援。OpenCode 2 新登入（key 只在 db）的 macOS 使用者會看到 `not detected`。
- 未支援 `OPENCODE_DATA_DIR` / `XDG_DATA_HOME`：需擴 host env 白名單（不自行擴大 host API）。
- 未移植上游本機 spend tiles / usage trend（T0037 §7 標「暫不」）。
- 行為改變：無 key 但有本機 history 的情況，舊版會顯示估算；新版 throw `not detected`（上游同樣移除了 dollar-cap 估算）。

### 建議後續（給 Tower）
- 若需支援 OpenCode 2 純 db 登入：另開單評估 `credential` table（Windows 需 bundled sqlite）。
