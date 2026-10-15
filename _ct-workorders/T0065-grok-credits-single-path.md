---
schema_version: 1
schema_kind: workorder
id: T0065
title: Grok - follow upstream credits single path and show Weekly on overview
status: DONE
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:52:40+08:00"
updated_at: "2026-10-15T17:20:45+08:00"
started_at: "2026-10-15T17:16:02+08:00"
completed_at: "2026-10-15T17:20:45+08:00"
commit: 1f2a2812
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0061
affects_files:
  - plugins/grok/plugin.js
  - plugins/grok/plugin.json
  - plugins/grok/plugin.test.js
---

# T0065 Grok: Follow Upstream Credits Single Path + Weekly On Overview

## 背景

T0058（`81c37218`）只加了 Weekly，保留 legacy `/v1/billing` monthly 路徑。Worker 指出：上游 `5fcb4312` 已改為 credits 單一請求並移除 monthly meter；若帳號已轉 unified billing、`/v1/billing` 不再回 `monthlyLimit`，fork plugin 會在 Weekly 之前 throw「Grok billing response changed.」→ 整個 provider 失敗。另 Weekly 目前只在詳細頁（manifest 無 overview line）。塔台決定補完移植（D098）。

## 任務指令

1. 讀上游 `5fcb4312`、`37f9a219` 與 `upstream/main:Sources/OpenUsage/Providers/Grok/*`、`docs/providers/grok.md`，確認 credits 回應能提供的欄位（`creditUsagePercent`、`currentPeriod`、`onDemandCap`、`prepaidBalance`…）。
2. Grok plugin 改為**以 credits 為主**：
   - credits 成功 → 輸出 Weekly（及上游由 credits 衍生的 Pay as you go 等）。
   - legacy `/v1/billing` 改為**選用**：有 `monthlyLimit` 才輸出 `Credits used`；缺欄位**不 throw**（log.info），不影響 Weekly。
   - credits 與 billing 都失敗 → 明確錯誤（fail loud，訊息清楚）。
3. `plugin.json` 加 overview line：`{ "type": "progress", "label": "Weekly", "scope": "overview", "period": "weekly", "primaryOrder": 1 }`（比照其他 plugin manifest 寫法；確認 tray / weekly metric 行為）。
4. 測試：unified billing（無 `monthlyLimit`）+ credits OK → 不 throw、有 Weekly；legacy 帳號兩者皆有 → 都顯示；兩者皆失敗 → 錯誤。用上游 fixture。
5. 稽核 redaction（無新欄位則註明）。

## 驗證 Gate

- PASS：`bun run test --run plugins/grok`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
- Runtime：無 Grok 憑證則註明「未實機」。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`feat(grok): credits-first path and weekly overview line (T0065)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 狀態

DONE（source / tests / bundle / build 全 PASS；Runtime 未實機 — 本機無 `~/.grok/auth.json`）

### Landing Zone

- C-0：WARN — frontmatter 無 `repo` 欄位（repo identity unavailable）；observed `basename(REPO_ROOT)` = `openusage`
- C-1：PASS — 工單在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下
- C-3：PASS — `affects_files` 3/3 存在
- C-2：N/A（無 `branch` 欄位；HEAD = `main`）
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）；`CT_MODE=yolo`

### Commit

feature commit：`feat(grok): credits-first path and weekly overview line (T0065)`（hash 見 frontmatter `commit`）

### 上游引用

- `5fcb4312`：credits 單一請求 `GET /v1/billing?format=credits`，移除 legacy monthly meter；Pay as you go 改取 credits 的 `onDemandCap`
- `37f9a219`：credits 412 + JSON `error` 含 "no personal team" = team principal（非登入失敗）
- `upstream/main:Sources/OpenUsage/Providers/Grok/{GrokCreditsConfigDecoder,GrokUsageMapper,GrokProvider,GrokUsageClient}.swift`、`docs/providers/grok.md`、`Tests/OpenUsageTests/GrokCreditsConfigFixtures.swift`
- credits 欄位：`creditUsagePercent`（proto-JSON 0 時省略 → 0）、`currentPeriod{type,start,end}`、`onDemandCap{val}`（省略 → 0 / Disabled）；另有 `onDemandUsed`、`prepaidBalance`、`isUnifiedBillingUser`、`billingPeriodStart/End`、`topUpMethod`（上游不 map，本單也不 map）
- 上游 decoder：present 但非數值的 percent / cap、period 不前進 → invalidResponse（本單照做，視為 credits 失敗）

### 改動

- `plugins/grok/plugin.js`
  - credits 為主：`fetchCreditsResponse` 走 `retryOnceOnAuth`（401/403 refresh 一次）；仍 401/403 → `Grok auth expired. Run \`grok login\` again.`
  - `readCredits`：weekly period → `Weekly` progress（`resetsAt` = period end、`periodDurationMs`）；非 weekly → 無 Weekly（log.info）；`Pay as you go` badge 取 credits `onDemandCap`
  - `readLegacyBilling`：選用；有 `monthlyLimit`(+`used`、`billingPeriodEnd`) 才出 `Credits used`；缺欄位回 `{ error }` 不 throw，credits 成功時 `log.info("Grok legacy billing skipped: no monthlyLimit meter")`
  - credits 失敗、legacy 成功 → `Credits used` + legacy `onDemandCap` badge（log.warn）
  - 兩者皆失敗 → `log.error` 兩邊原因 + throw credits 錯誤：`Grok billing request failed (HTTP N). Try again later.` / `Grok billing request failed. Check your connection.` / `Grok billing response changed.` / team 412 → `Grok team accounts have no personal quota.`
  - 行序：Weekly → Credits used → Pay as you go
- `plugins/grok/plugin.json`：加 `{ "type": "progress", "label": "Weekly", "scope": "overview", "period": "weekly", "primaryOrder": 1 }`；`Credits used` 改 `primaryOrder: 2`（tray 在無 Weekly 時 fallback 到 Credits used — `src/lib/tray-primary-progress.ts` 取第一個存在的 candidate；`period: weekly` 讓 weekly mode 選到 Weekly）
- `plugins/grok/plugin.test.js`：依 credits-first 重寫，30 tests；用上游 captured fixture

### 驗證證據

| Lane | Gate | 結果 |
|---|---|---|
| tests | `bun run test --run plugins/grok` | PASS — 1 file / 30 tests |
| tests（回歸） | 新測試對 HEAD 舊 `plugin.js` | 11 FAIL（含 "unified billing (no monthlyLimit) + credits OK: no throw, Weekly shown"）→ 證明測試抓得到原 bug；跑完已還原新檔 |
| tests | `bun run test --run` | PASS — 70 files / 1250 tests |
| bundle | `bun run bundle:plugins` | PASS — Bundled 18 plugins（含 grok）；無 tracked 檔變動 |
| build | `bun run build`（`tsc && vite build`） | PASS（只有既有 >500 kB chunk 警告） |
| runtime | 實機 | 未實機 — 無 Grok 憑證 |

必要情境測試：unified billing（無 `monthlyLimit`）+ credits OK → 不 throw、有 Weekly ✅；legacy 兩者皆有 → Weekly + Credits used ✅；兩者皆失敗 → 明確錯誤 ✅（HTTP / 連線 / 格式 / team 四種）

### Redaction 稽核

無新欄位需加：endpoint（credits 自 T0058 已用、billing、settings、refresh）與 request header 皆未變；新讀回應欄位只有 `creditUsagePercent` / `currentPeriod` / `onDemandCap`（非敏感）；log 只含錯誤字串、`period.type`、HTTP status，不含 body / token。`host_api.rs` 清單不需改。

### 偏差

- team 412：工單未明列；依 `37f9a219` 處理為 credits 失敗 → 有 legacy meter 則 fallback，否則 throw `Grok team accounts have no personal quota.`（plugin 無 local spend tiles，無法照上游保留 snapshot + warning）
- credits 內 present 但非數值的 percent / cap 或倒退 period：T0058 原本只省略 Weekly；改照上游 decoder 視為 credits 失敗（仍可 fallback legacy）
- 未停使用者 OpenUsage、未動 registry / installer / 已安裝 exe；無滑鼠控制、無截圖

### Follow-up（塔台）

- `README.md:37` Grok 仍寫 "credits used, plan, pay-as-you-go cap"，fork `docs/providers/grok.md` 未提 Weekly — 不在本單 `affects_files`，建議併入 T0066 docs
- 有 Grok 憑證時補實機 smoke（`:6736` API 看 Weekly / Credits used 行）
