---
schema_version: 1
schema_kind: workorder
id: T0058
title: Port v0.7.x: Grok weekly shared quota meter
status: DONE
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:51:43+08:00"
started_at: "2026-10-15T16:48:24+08:00"
completed_at: "2026-10-15T16:51:43+08:00"
commit: 81c37218
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0057
affects_files:
  - plugins/grok/plugin.js
  - plugins/grok/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
---

# T0058 Port v0.7.x: Grok weekly shared quota meter

## 背景

T0037 §7：上游 v0.7.3 新增 Grok 每週共用額度 meter；Tauri grok plugin 沒有 weekly。

## 任務指令

1. 找上游 Grok provider 的 weekly 實作（endpoint、欄位、重置時間）。
2. 在 fork grok plugin 加 weekly progress line（label 比照既有 `Weekly`），含重置倒數。補測試。

## 移植通則（v0.7.x → Tauri plugin）

- 來源：上游 Swift 版 `upstream/main`（T0037 報告 §7）。用 `git log upstream/main --oneline -- <path>`、`git show upstream/main:<path>` 找對應 provider 實作、CHANGELOG 條目與測試 fixture。回報引用上游 commit / 檔案。
- 只移植**行為**（API endpoint、欄位、計算、顯示 line），用 fork 既有 plugin JS 寫法；不搬 Swift 架構。
- 新增 line label / value 加進 `src/lib/i18n-plugin-labels.ts`（zh-TW）。
- AGENTS.md：plugin 變動要稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單，新 request / response 欄位有缺口就補並加測試；`plugin.json` `brandColor` 維持 provider 真實品牌色；SVG 用 `currentColor`。
- 測試：用上游測試 fixture（或依 API 文件構造）補 `plugin.test.js`。
- Runtime：本機若有該 provider 的登入憑證就實機驗證；沒有則回報「未實機（無憑證）」，不得偽造。
- 若上游實作依賴 Tauri 版沒有的能力（例如需要新 host API），停下回報 BLOCKED 並說明，不自行擴大 host API。

## 驗證 Gate

- PASS：`bun run test --run plugins/grok`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
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

- Commit：`feat(grok): weekly shared quota meter from upstream v0.7.x (T0058)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態：DONE

- 執行：2026-10-15T16:48:24+08:00 起；Worker（Claude Code，CT_MODE=yolo）
- Commit：`81c37218`（`feat(grok): weekly shared quota meter from upstream v0.7.x (T0058)`），未 push / tag / 發行

### Landing Zone

- 結果：WARN
- C-0：WARN — frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage`
- C-1：PASS（工單在 REPO_ROOT 下）
- C-3：PASS — 3/3 present（`plugins/grok/plugin.js`、`plugins/grok/plugin.test.js`、`src/lib/i18n-plugin-labels.ts`）
- C-2：N/A（無 `branch` 欄位；HEAD = `main`）
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 上游引用

- `d94b5fbb` feat(grok): weekly shared-pool meter via the gRPC-web credits config
- `5fcb4312` refactor(grok): fetch weekly pool via the CLI's JSON credits endpoint, drop legacy monthly meter
- `37f9a219` fix(grok): keep local spend when team billing returns 412 (#1272)
- 檔案：`upstream/main:Sources/OpenUsage/Providers/Grok/GrokCreditsConfigDecoder.swift`、`GrokUsageClient.swift`、`GrokUsageMapper.swift`、`Tests/OpenUsageTests/GrokCreditsConfigFixtures.swift`、`docs/providers/grok.md`
- 行為：`GET https://cli-chat-proxy.grok.com/v1/billing?format=credits`（同 CLI headers）→ `config.creditUsagePercent`（proto-JSON 為 0 時省略 → 視為 0）、`config.currentPeriod.{type,start,end}`；僅 `type == USAGE_PERIOD_TYPE_WEEKLY` 才出 Weekly；`end` = 重置時間，`end - start` = periodDurationMs；percent clamp 0..100

### 改動

- `plugins/grok/plugin.js`：新增 `CREDITS_URL`、`fetchWeeklyLine()`；`probe()` 在既有 billing 成功後呼叫 credits，Weekly progress line（`label: "Weekly"`、percent、`resetsAt`、`periodDurationMs`）排第一；既有 `Credits used` / `Pay as you go` 不變
- 時間戳含微秒（`.140114+00:00`）→ 先 `ctx.util.toIso` 正規化再 `parseDateMs`（host `toIso` 已截到毫秒）
- Weekly 失敗（網路錯、非 2xx 含 412 team、shape 不符、非 weekly period）只省略 Weekly 並 `log.warn`/`log.info`，不讓整個 provider 失敗（比照 `d94b5fbb`「weekly-only failure degrades」）
- `plugins/grok/plugin.test.js`：新增 `weekly shared pool` 8 個測試，使用上游 captured payload fixture（`GrokCreditsConfigFixtures.capturedResponseBody`）
- `src/lib/i18n-plugin-labels.ts`：**未改**，`Weekly` → `pluginLabel.weekly` → zh-TW「每週」已存在

### 稽核

- `host_api.rs` redaction：`format=credits` 非敏感 query；回應欄位（`creditUsagePercent`、`currentPeriod`、`onDemandCap`、`isUnifiedBillingUser`、`prepaidBalance`、`topUpMethod`）無 secret / ID；412 body `{"error":"No personal team"}` 無敏感值。無缺口，未改 `host_api.rs` → `cargo test` 不需跑
- `plugin.json` `brandColor` `#000000`、`icon.svg` 未動

### 驗證

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| tests | `bun run test --run plugins/grok` | PASS | 1 file, 28 passed（原 20 + 新 8） |
| tests | `bun run test --run` | PASS | 70 files, 1215 passed |
| build | `bun run bundle:plugins` | PASS | Bundled 18 plugins（含 grok） |
| build | `bun run build` | PASS | `✓ built in 830ms`（既有 chunk > 500 kB 警告） |
| build | `cargo test --locked` | N/A | 未動 `host_api.rs` |
| runtime | release exe 實機 | 未實機（無憑證） | `%USERPROFILE%\.grok\auth.json` 不存在 |

### 偏差 / 風險 / Follow-up

- **Weekly 只在詳細頁顯示**：`provider-card.tsx` overview 依 manifest `scope: "overview"` label 過濾；`plugins/grok/plugin.json` 不在 `affects_files`，未加 manifest line。若要 overview / tray 顯示 Weekly，需另單在 `plugin.json` 加 `{ "type": "progress", "label": "Weekly", "scope": "overview", "period": "weekly", "primaryOrder": 1 }`
- **保留 legacy monthly `Credits used`**：上游 `5fcb4312` 已移除 monthly meter、改以 credits 單一請求。本單只加 Weekly（依工單指令）。風險：已遷移 unified billing 的帳號若 `/v1/billing` 不再回 `monthlyLimit`，現行 plugin 會在 Weekly 之前就 throw「Grok billing response changed.」→ 無憑證無法確認；建議 Tower 評估是否另單比照上游改為 credits 單一路徑（Pay as you go 亦可由 credits `onDemandCap` 取得）
- 上游 412 team header warning、local spend tiles（Today / Yesterday / Last 30 Days）未移植（不在本單範圍）
- `plugin.test.js` 現 559 行，超過 AGENTS.md ~400 LOC 建議（原已 424 行）

