---
schema_version: 1
schema_kind: workorder
id: T0066
title: Translate Claude reset grants value and update Claude / Copilot / Grok docs
status: DONE
priority: Low
type: chore
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T17:01:31+08:00"
updated_at: "2026-10-15T17:26:20+08:00"
started_at: "2026-10-15T17:21:28+08:00"
completed_at: "2026-10-15T17:26:20+08:00"
commit: d50245c3
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0065
affects_files:
  - src/lib/i18n.ts
  - src/lib/i18n.test.ts
  - src/lib/i18n-plugin-labels.ts
  - docs/providers/claude.md
  - docs/providers/copilot.md
  - docs/providers/grok.md
  - README.md
---

# T0066 Translate Claude Reset Grants Value + Claude Docs

## 背景

T0059（`7da18a17`）新增 Claude「速率限制重置」列，value 為動態字串 `N available`，zh-TW 介面仍顯示英文；`docs/providers/claude.md` 未記載 Fable / Rate Limit Resets（D099）。

## 任務指令

1. i18n：`translateDisplayValue()`（T0047 新增）目前只做靜態字串對照。加入**最小**的樣式對照支援 `^(\d+) available$` → zh-TW `可用 N 次`（en 不變）。不做通用模板引擎（AGENTS.md 不過度工程）。若 Codex「Rate Limit Resets」也輸出同格式 value，確認一併生效。補測試（含 `0 available`、非相符字串不翻譯、plan 名 `Free` / `Pro` 不受影響）。
2. `docs/providers/claude.md`：補 Fable 每週限額（`limits[]` `weekly_scoped`）、Rate Limit Resets（`cedar_ember`、每小時最多查一次、顏色門檻、User-Agent 變更），比照文件既有格式，引用上游 `00189454` / `4b068d52`。
3. `docs/providers/copilot.md`（D101）：改寫為 T0061 新行為——Credits（AI Credits）、Extra Usage、Chat / Completions（`quota_snapshots`）、org-managed seat 的個人 `credits_used` 與 Org Credits / Org Spend（`/user/orgs` + billing summary，需 org owner / billing manager）、無資料時明確錯誤；註明**Windows 目前讀不到 gh 存在 Credential Manager 的 token**（keychain host API macOS-only），引用上游 `c6e4cb95` / `8b567aee`。
4. Grok（D103）：`docs/providers/grok.md` 改寫為 T0058 / T0065 行為——credits 為主（`/v1/billing?format=credits`，Weekly、Pay as you go 取 `onDemandCap`）、legacy `/v1/billing` 選用（有 `monthlyLimit` 才顯示 Credits used）、team 412 訊息；`README.md` Grok 列改為含 weekly（例如 `weekly shared quota, credits used, pay-as-you-go cap`）。引用上游 `5fcb4312` / `37f9a219`。README 其他列同步檢查 Claude（Fable、Rate Limit Resets）、Copilot（AI Credits）是否需更新。
5. 不改 plugin 行為。

## 驗證 Gate

- PASS：`bun run test --run`、`bun run build`
- PASS：browser dev 或實機（有 Claude 憑證）確認 zh-TW 顯示 `可用 1 次`（截圖可選；若實機需停使用者 app，依環境規則還原）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`fix(i18n): translate reset grants value, document Claude resets and Fable (T0066)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 結果

- 狀態：DONE
- Commit：`d50245c3`（`fix(i18n): translate reset grants value, document Claude resets and Fable (T0066)`），未 push / tag / 發行

### Landing Zone

| Check | 結果 |
|---|---|
| C-0 repo identity | WARN — frontmatter 無 `repo`；`basename(REPO_ROOT)` = `openusage`（`D:/ForgejoGit/@GitHub_Clone/openusage`） |
| C-1 work order path | PASS |
| C-3 `affects_files` | PASS — 前 5 筆全 present |
| C-2 branch | N/A（無 `branch` 欄位；HEAD `main`） |

`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`；`CT_MODE=yolo`

### 改動

- `src/lib/i18n.ts`：`translateDisplayValue()` 靜態對照沒中時，比對 `^(\d+) available$` → `t(locale, "pluginLabel.resetsAvailable")` 填 `{count}`。只此一條樣式，無通用模板引擎
- `src/lib/i18n-plugin-labels.ts`：新 key `pluginLabel.resetsAvailable` — en `{count} available`、zh-TW `可用 {count} 次`
- `src/lib/i18n.test.ts`：新測試 — en 不變、`1` / `0` / `12 available` 翻譯、`1.5 available` / `Not available` / `Pro` / `Free` 不翻譯
- Codex：`plugins/codex/plugin.js:839` 也輸出 `Math.floor(n) + " available"` → 同一條生效（實機確認）
- `docs/providers/claude.md`：response 範例補 `seven_day_sonnet`、`limits[]`（`weekly_scoped` Fable）；新增 `GET /api/oauth/usage?cedar_ember=1&skip_spend=1` 段（User-Agent `claude-cli/2.1.294 (external, cli)`、每小時最多一次、失敗算該小時、`cedar_ember` 結構與計數規則）；新增 Displayed Lines 表與顏色門檻表（≤48h 紅 / ≤7 天黃 / >7 天藍）；引用 `00189454` / `4b068d52`
- `docs/providers/copilot.md`：改寫 API 段 — Paid（AI credits、`overage_permitted` / `overage_count` → Extra Usage、unlimited chat/completions 無列）、Free（`quota_snapshots` 或 legacy `limited_user_quotas`）、Org-managed（`token_based_billing`、個人 `credits_used`）、Org billing（`/user/orgs` + `/orgs/{org}/settings/billing/usage/summary`、owner / billing manager、`billing-org.json` 快取、org-wide 數字）；Displayed Lines / Errors 依 `plugins/copilot/plugin.js` 現況（含 `Usage data unavailable for this account.`、`Status: No usage data`）；新增 Windows 段（keychain host API macOS-only，讀不到 gh 存在 Credential Manager 的 token）；引用 `c6e4cb95` / `8b567aee`
- `docs/providers/grok.md`：改寫為 credits 為主（`/v1/billing?format=credits`，`currentPeriod` weekly → Weekly、`onDemandCap` → Pay as you go）、legacy `/v1/billing` 選用（有 `monthlyLimit` 才出 Credits used）、team 412 → fallback / `Grok team accounts have no personal quota.`；Displayed Lines 表加 Source 欄；Errors 補 team 與 `Grok auth invalid`；引用 `5fcb4312` / `37f9a219`
- `README.md`：Claude 加 `Fable`、`rate limit resets`；Copilot 改 `AI credits, extra usage, chat, completions, org credits/spend (org admins)`；Grok 改 `weekly shared quota, credits used, plan, pay-as-you-go cap`
- `_ct-workorders/assets/T0066/claude-detail-resets-zh-tw.png`：實機截圖
- 未改任何 plugin 行為

### 驗證證據

| Lane | Gate | 結果 |
|---|---|---|
| tests | `bun run test --run` | PASS — 70 files / 1251 tests |
| build | `bun run build` | PASS（只有既有 >500 kB chunk 警告） |
| source | `git diff --check` | PASS |
| build | `bun tauri build --no-bundle`（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`） | PASS — `Finished release in 26.04s` |
| runtime | release exe 實機（`%TEMP%\openusage-t0066`，cwd `%TEMP%`，zh-TW，真實 Claude Max 20x 憑證） | PASS — `:6736/v1/usage/claude`：`Rate Limit Resets` value `1 available`、color `#3b82f6`、subtitle `2026-10-23`；UIA（Claude 詳細頁）：`速率限制重置` 1、`可用 1 次` 1、`1 available` 0 |
| runtime | Codex 同格式 | PASS — API `0 available`；UIA（Codex 詳細頁）：`可用 0 次` 1、`0 available` 0 |
| runtime | 截圖 | `_ct-workorders/assets/T0066/claude-detail-resets-zh-tw.png` — 面板 region 外塗棋盤格；無 token / email / 帳號 ID |

### 環境還原

- 停過使用者的 OpenUsage（pid 23216，`%LOCALAPPDATA%\OpenUsage\openusage.exe`）。`settings.json` SHA256 前 / 測後 / 還原後皆 `A7CC803B7D1E096F57B05B82C2E0573222726BF31D3F6C720397D359A63CF15E`（未被改寫）
- 已以安裝目錄為 cwd 重啟已安裝版（pid 43080），重啟後 SHA256 仍一致
- 未動 registry / installer / 已安裝 exe；release exe 連 `resources/` 一起複製到 `%TEMP%\openusage-t0066`；無滑鼠控制（UIA Invoke）；未用剪貼簿

### 偏差

- 無功能偏差
- `docs/providers/claude.md` 是 fork 的 API 參考格式，上游是使用者導向格式；照本檔既有格式加段，未搬上游段落原文
- Copilot / Grok 文件依本地 `plugin.js` 現況寫（例：本地 Grok 無 local spend tiles，team 412 時不保留卡片；本地 Claude resets 無 timeline popover，改以 subtitle 顯示最近期限、未回報時無列而非 "No data"）

### Follow-up（塔台）

- `docs/local-http-api.md`（上游 `00189454` 在 Claude resource keys 加 `rateLimitResets`）本 fork 未見對應表格，未處理；需要時另開單

