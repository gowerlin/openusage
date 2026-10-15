---
schema_version: 1
schema_kind: workorder
id: T0061
title: Port v0.7.x: Copilot AI Credits, extra usage and org usage
status: IN_PROGRESS
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T17:06:22+08:00"
started_at: "2026-10-15T17:06:22+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0060
affects_files:
  - plugins/copilot/plugin.js
  - plugins/copilot/plugin.json
  - plugins/copilot/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src-tauri/src/plugin_engine/host_api.rs
---

# T0061 Port v0.7.x: Copilot AI Credits, extra usage and org usage

## 背景

T0037 §7：上游 v0.7.1 / v0.7.3 Copilot 改為 AI Credits + Extra Usage，並支援組織層級用量；Tauri 版只有 `Premium` / chat / completions，計費模式改了，數字可能不準。規模 M。

## 任務指令

1. 找上游 Copilot provider 新計費模型的 API 與欄位（個人 / 組織），以及舊欄位的相容處理。
2. fork copilot plugin 改為顯示 AI Credits（progress）、Extra Usage、組織用量（若有）；保留舊帳號仍回舊欄位時的顯示（不 fallback 靜默——資料缺失要明確）。
3. 若組織用量需要額外 token scope / 設定 UI（Tauri 版沒有）→ 只做個人部分並回報組織部分 BLOCKED 原因。
4. 補測試；稽核 redaction（新欄位如 org 名稱、login 是否需遮）。

## 移植通則（v0.7.x → Tauri plugin）

- 來源：上游 Swift 版 `upstream/main`（T0037 報告 §7）。用 `git log upstream/main --oneline -- <path>`、`git show upstream/main:<path>` 找對應 provider 實作、CHANGELOG 條目與測試 fixture。回報引用上游 commit / 檔案。
- 只移植**行為**（API endpoint、欄位、計算、顯示 line），用 fork 既有 plugin JS 寫法；不搬 Swift 架構。
- 新增 line label / value 加進 `src/lib/i18n-plugin-labels.ts`（zh-TW）。
- AGENTS.md：plugin 變動要稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單，新 request / response 欄位有缺口就補並加測試；`plugin.json` `brandColor` 維持 provider 真實品牌色；SVG 用 `currentColor`。
- 測試：用上游測試 fixture（或依 API 文件構造）補 `plugin.test.js`。
- Runtime：本機若有該 provider 的登入憑證就實機驗證；沒有則回報「未實機（無憑證）」，不得偽造。
- 若上游實作依賴 Tauri 版沒有的能力（例如需要新 host API），停下回報 BLOCKED 並說明，不自行擴大 host API。

## 驗證 Gate

- PASS：`bun run test --run plugins/copilot`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
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

- Commit：`feat(copilot): AI Credits and extra usage from upstream v0.7.x (T0061)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

### 結果

- 狀態：DONE（程式 / 測試 / build gate 全 PASS；Runtime lane PARTIAL，見下）
- Commit：`feat(copilot): AI Credits and extra usage from upstream v0.7.x (T0061)`（hash 見 frontmatter `commit`）
- 開始：2026-10-15T17:06:22+08:00；回報：2026-10-15T17:14:14+08:00
- 個人部分 + 組織部分都已移植；組織用量不需新 token scope / 設定 UI（沿用 gh token，`read:org` 為 gh 預設 scope；只有 org owner / billing manager 讀得到，其他人 403 屬預期），故**無 BLOCKED**。

### Landing Zone

- 結果：WARN（僅 C-0 不可用）
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`（REPO_ROOT `D:/ForgejoGit/@GitHub_Clone/openusage`）→ WARN "repo identity unavailable"
- C-1：PASS（工單在 REPO_ROOT 下）
- C-3：PASS（5 個 `affects_files` 全部存在）
- C-2：無 `branch` 欄位，HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）
- `CT_MODE=yolo`

### 上游引用（`upstream/main`，僅 `git show` 讀取，未 checkout / merge）

- `Sources/OpenUsage/Providers/Copilot/CopilotUsageMapper.swift`（Credits / Extra Usage / 抑制規則 / personal `credits_used`）
- `Sources/OpenUsage/Providers/Copilot/CopilotOrgBillingClient.swift`、`CopilotOrgBillingMapper.swift`、`CopilotProvider.swift`（org 查找、快取、403/429/5xx 處理）
- `Tests/OpenUsageTests/CopilotProviderTests.swift`（fixture 移植）、`docs/providers/copilot.md`
- Commits：`c6e4cb95`（#807 AI Credits + Extra Usage）、`8b567aee` / `1171895a` / `b15a47ed`（#843 org billing）、`97091691`（#844 placeholder Extra Usage 不擋 org lookup）、`41d1bd17`（#1108 org seat 個人 credits）

### 改動

- `plugins/copilot/plugin.js`
  - `premium_interactions` → **Credits**（percent used；`percent_remaining` 優先，否則 `remaining/entitlement`）。
  - 抑制：`unlimited: true`、`-1` sentinel、`entitlement: 0` placeholder（付費 chat/completions、free 帳號 Credits）。
  - **Extra Usage**：僅在有 Credits 且 `overage_permitted: true` 時出 text（`overage_count`，真 0 也顯示）。
  - Chat / Completions 改走 `quota_snapshots`（free 帳號現行格式）；舊 `limited_user_quotas` / `monthly_quotas` 只在無其他 line 時使用（保留舊帳號舊欄位顯示）。
  - 無任何 line 且非 `token_based_billing` → 明確 throw `Usage data unavailable for this account.`（取代舊的靜默 badge）。
  - Org-managed seat（`token_based_billing: true` 且無 percent meter）：個人 `credits_used` > 0 → **Credits** count；再查 `GET /user/orgs?per_page=100` → `GET /orgs/{org}/settings/billing/usage/summary`，Copilot `ai-units` / `ai-credits` 項目加總 → **Org Credits**（`N credits`）/ **Org Spend**（`$N.NN`）。命中 org 快取在 `pluginDataDir/billing-org.json`；快取 org 非 200（非 429/5xx）→ 清除重找；429/5xx/例外 → 保留快取、本次略過；單一 org 失敗繼續找下一個。全都沒有 → 明確 badge `No usage data`（保留 plan）。
- `plugins/copilot/plugin.json`：lines 改為 `Credits`（primaryOrder 1）、`Extra Usage`、`Chat`（primaryOrder 2）、`Completions`（overview），`Org Credits` / `Org Spend`（detail）。`brandColor` 未動（`#A855F7`），`icon.svg` 未動。
- `plugins/copilot/plugin.test.js`：`Premium` → `Credits`；兩個舊「No usage data」測試改為預期明確錯誤；新增 16 個上游移植測試（paid / unlimited / Extra Usage 36 與 0 / legacy 忽略 / zero-entitlement / live free / org 403 / personal credits / admin org lines + 快取 + headers / 加總與非 credit 單位過濾 / 快取命中不列 org / stale 快取驅逐 / 跳過 503 org / transient 保留快取 / org list 403 / 個人帳號只發 1 request）。
- `src/lib/i18n-plugin-labels.ts`：新增 `Extra Usage`→額外用量、`Org Credits`→組織額度、`Org Spend`→組織花費（`Credits`→額度 既有）。`Premium` 保留（factory 仍用）。
- `src-tauri/src/plugin_engine/host_api.rs`（redaction 稽核）：
  - 缺口：`/orgs/{org}/...` URL path 中的 org slug 會原樣進 log（`redact_url` 只遮 query）；`/user/orgs` body 的 `url` / `repos_url` 等含 slug；billing summary body 的 `organization` 欄位。
  - 補：新增 `redact_github_org_paths`（`redact_url` 與 `redact_body` 都套用）；`sensitive_keys` 加 `organization`。`login` 原本已遮。
  - 測試：`redact_url_redacts_github_org_slug_in_path`、`redact_body_redacts_github_org_list_and_billing_summary`。
  - 未遮（判斷可接受）：`/user/orgs` 的數字 `id`、`node_id`、`avatar_url`、`description`（公開 org metadata；body log 截 500 字元）。plugin 自身 log 不含 org slug。

### 驗證

| Lane | 結果 | 證據 |
|---|---|---|
| `bun run test --run plugins/copilot` | PASS | 1 file，49 tests passed |
| `bun run test --run` | PASS | 70 files，1248 tests passed |
| `bun run bundle:plugins` | PASS | Bundled 18 plugins（含 copilot） |
| `bun run build` | PASS | tsc + vite built（僅既有 chunk size 警告） |
| `cargo test --locked` | PASS | VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`；lib 155 passed / 0 failed；`cargo test --locked redact` 28 passed 含 2 個新測試 |
| 真實 API mapping | PASS | 以 `gh auth token`（未輸出）打 `GET /copilot_internal/user` → 200；帳號為 free `individual`、`token_based_billing: true`、premium `entitlement: 0`。用 node harness 跑 plugin：**新版** → plan `Individual`，`Chat` 0%、`Completions` 0%（resetsAt 2026-11-01），1 request；**HEAD 舊版** → `Premium` **100%** 已用（`percent_remaining: 0` 誤判）+ `Chat` 0% —— 確認本單修正的誤差。`/user/orgs` → 200、0 個 org，故 org 路徑無法實測 |
| Runtime（release exe） | PARTIAL | `bun tauri build --no-bundle` → exe + `resources/` 複製到 `%TEMP%\openusage-t0061`，cwd `%TEMP%` 啟動；bundled `copilot/plugin.json` lines = `Credits,Extra Usage,Chat,Completions,Org Credits,Org Spend`；`/v1/usage/copilot` 204（已載入）；UIA Invoke `Copilot` 導覽 → 詳細頁顯示 `Not logged in. Run gh auth login first.`。原因：fork `ctx.host.keychain` 在 Windows 回 unsupported（`host_api.rs` `inject_keychain`，macOS-only），gh token 存在 Windows Credential Manager（`gh:github.com:<user>`）→ plugin 讀不到。**既有限制，與本單改動無關**（HEAD 同樣路徑）。截圖：`_ct-workorders/assets/T0061/copilot-detail-windows-no-token.png`（面板 region，外圍棋盤格，無 token / email / 帳號 ID） |

### 實機副作用 / 還原

- 停使用者 OpenUsage（`%LOCALAPPDATA%\OpenUsage\openusage.exe`）→ smoke → 以安裝目錄為 cwd 重啟（新 pid 23216）。
- `settings.json` 暫時把 `copilot` 移出 `plugins.disabled`；結束後從備份還原，SHA256 before = restored = `A7CC803B7D1E096F57B05B82C2E0573222726BF31D3F6C720397D359A63CF15E`。
- 未產生 `OpenUsage-copilot` 憑證（`cmdkey` 查無）、`plugins_data/copilot/` 仍空。
- 未動 registry / 安裝目錄 / 剪貼簿；未控制滑鼠（只用 UIA Invoke）；未跑 installer。

### 偏差

- Chat / Completions 維持 overview（上游預設 On Demand）：fork free 帳號只有這兩條，放 detail 會讓卡片空白。
- 無資料改為明確錯誤（上游 `quotaUnavailable` 同行為），取代舊版靜默 `No usage data` badge；org-managed seat 全無資料時仍用明確 badge（保留 plan，同上游 plan-only card）。
- `plugin.test.js` 825 行（原 529 行已超過 AGENTS ~400 LOC）；為守 `affects_files` 未拆檔。
- 截圖存 `_ct-workorders/assets/T0061/`（同 T0059 慣例）。

### Follow-up（建議 Tower 評估）

1. **Windows Copilot token 來源**：fork 在 Windows 無法取得 gh token（keychain host API macOS-only），Copilot 在 Windows 實際只能靠 `pluginDataDir/auth.json`。上游順序為 editor `apps.json`/`hosts.json` → gh `hosts.yml` → keychain；Windows 需另議（gh 預設存 Credential Manager；`%LOCALAPPDATA%\github-copilot\` 現為 `auth.db`）。可能需 host API 擴充 → 依移植通則需 Tower 決策。
2. `docs/providers/copilot.md`（fork）仍描述舊 `Premium`，不在本單 `affects_files`，未改。
3. Org Credits / Org Spend 未實測（本帳號 0 個 org）。
