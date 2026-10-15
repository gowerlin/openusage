---
schema_version: 1
schema_kind: workorder
id: T0038
title: Merge upstream tauri-legacy v0.6.28 into fork (0.6.29) + i18n
status: DONE
priority: High
type: implementation
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:49:26+08:00"
started_at: "2026-10-15T12:41:17+08:00"
completed_at: "2026-10-15T12:49:26+08:00"
commit: "996aff28, ea22c261, c4ea9006"
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0037
affects_files:
  - package.json
  - bun.lock
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
  - src-tauri/capabilities/default.json
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/tray.rs
  - src-tauri/src/local_http_api/cache.rs
  - src/components/provider-card.tsx
  - src/components/provider-card-metric-line.tsx
  - src/components/skeleton-lines.tsx
  - src/components/usage-sparkline.tsx
  - src/pages/overview.tsx
  - src/pages/settings.tsx
  - src/lib/settings.ts
  - src/lib/settings.test.ts
  - src/lib/i18n.ts
  - src/lib/i18n-plugin-labels.ts
  - src/lib/tray-tooltip.ts
  - src/hooks/app/use-settings-bootstrap.test.ts
  - plugins/gemini/**
  - plugins/windsurf/**
  - plugins/antigravity/plugin.test.js
  - docs/providers/gemini.md
  - README.md
  - AGENTS.md
  - CLAUDE.md
---

# T0038 Merge Upstream tauri-legacy Into Fork (0.6.29) + i18n

## 依據

**本工單的權威規格是 `_ct-workorders/_report-T0037-upstream-sync.md`**（§2 衝突表、§3 語意風險、§4 橫幅排除、§5 排除清單、§6 版號）。使用者已逐項同意方案 A（D071）。以下只列執行要點與使用者決策，細節照報告做。

## 使用者決策（不得更改）

- 合併來源：`upstream/tauri-legacy`（目前 `0a08306d`，v0.6.28）。**不碰** `upstream/main` / v0.7.x。
- **一般 merge commit**（`git merge --no-ff upstream/tauri-legacy`），不 squash、不 rebase，讓 merge-base 前移。
- 版號 `0.6.29`（四個版本檔）。
- **保留 Gemini**；接受 Windsurf 刪除（由 Devin 取代）。
- **退休通知橫幅不帶進 fork**：merge 後以獨立 commit `chore: drop upstream retirement notice (PLAN-004)` 移除（報告 §4）。
- `AGENTS.md`、`CLAUDE.md` 取 `--ours`；不加入 `.agents/skills/release-tauri`。
- i18n 補字串併入本單（報告 §3 / §8 T-B）。

## 執行步驟

1. 前置：`git status` 乾淨（塔台私有檔除外）；`git fetch upstream tauri-legacy`（remote 已設 `--no-tags`，不會抓 tag）。在 `main` 上操作，**不 push**（T0041 才推）。
2. `git merge --no-ff upstream/tauri-legacy`，照報告 §2 逐檔解 17 衝突：
   - 版本檔 → `0.6.29`；`Cargo.lock` 只有 `openusage` 版號 hunk。
   - `lib.rs`：保留 fork 結構（single-instance 第一、nspanel macOS-only），插入 clipboard-manager plugin。
   - `panel.rs`：取 fork；clamp 修正手動套到 `macos::position_panel_at_tray_icon`。
   - `tray.rs`：保留 fork import，加 `ClipboardExt`、`crate::log_path`。
   - `cache.rs`：取上游。
   - `provider-card.tsx`：取 fork + 刪 `UsageSparkline` 未用 import；三處改動移植到 `provider-card-metric-line.tsx`。
   - `skeleton-lines.tsx`、`use-settings-bootstrap.test.ts`：兩邊都留。
   - `overview.tsx`：**整檔**取 fork。`settings.test.ts`：取 fork + 刪 4 個 retirement import。
   - `plugins/gemini/*`：取 fork；`plugins/windsurf/*`：接受刪除。
3. **隱藏陷阱（報告 §2 ⚠️）**：`git checkout HEAD -- plugins/gemini docs/providers/gemini.md` 還原被靜默刪除的 Gemini 檔；README 加回 Gemini 行（Devin 加入、Windsurf 移除照上游）。
4. `AGENTS.md`、`CLAUDE.md`：`git checkout --ours`。確認 `.agents/skills/release-tauri` 未被加入（若有則移除，保留 fork 的 `release-tag`）。
5. 非衝突修正：`plugins/antigravity/plugin.test.js:212` 改 `toThrow(LOGIN_MESSAGE)`。
6. 驗證後提交 merge commit（message：`Merge upstream tauri-legacy v0.6.28 into fork (0.6.29, PLAN-004)`，body 摘要衝突解法與排除項）。
7. 第二個 commit：移除退休橫幅（報告 §4：`git rm` 3 檔 + `settings.ts` 5 個符號）。確認 `src/`、`docs/` 無 `retirement` 殘留。
8. 第三個 commit：i18n（`fix(i18n): translate merged upstream UI strings (T0038)`）：
   - `settings.tsx` Metric 區塊、`MENUBAR_METRIC_OPTIONS`（en / zh-TW，比照 `settings.menubarIcon.*`）。
   - `usage-sparkline.tsx` aria / title 文字。
   - `i18n-plugin-labels.ts`：`Usage Trend`、`Rate Limit Resets`、Devin labels（盤點 `plugins/devin/plugin.json` / `plugin.js`）。
   - `tray-tooltip.ts` weekly tag 改 `translateDisplayLabel`（報告標可選；做）。
   - 補對應測試。
9. 最後檢查：`src/`、`src-tauri/src` 無新的 `robinebers` / `openusage.ai`（`host_api.rs` redaction fixture 除外）；About / Help / changelog（T0034/T0035）仍指向 fork；`tauri.conf.json` updater endpoint 仍是 `gowerlin/openusage`。
10. 依 AGENTS.md：plugin 變動需稽核 `host_api.rs` redaction 清單 —— 本單只確認 Gemini 保留後無缺口；Devin 稽核交 T0039。

## 環境注意

- `cargo` 需 VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin`；從 PowerShell 用 `cmd.exe /c`。

## 明確排除

- 不 push、不 tag、不發行（T0041）。
- 不改 Devin plugin 行為（T0039）；不做 NSIS 打包 / runtime smoke（T0040）。
- 不移植任何 v0.7.x 功能。
- 不改 `.github/workflows/**`。
- 若需 `git reset --hard` / 放棄 merge commit：**停下回報 BLOCKED**；merge commit 前可 `git merge --abort`。

## 驗證 Gate

- PASS：`bun install`（lock 無非預期變動）、`bun run bundle:plugins`
- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`（基準 ≥137）
- PASS：`bunx tsc --noEmit`、`bun run test --run`（基準 ≥1156；Gemini 32/32）、`bun run build`
- PASS：步驟 7 / 9 的 grep 檢查
- PASS：`git log --graph` 顯示真正的 merge commit（兩個 parent，第二 parent = `0a08306d`）
- `git diff --check` 無新 warning

## 回報區

### 結果

- 狀態：**DONE**（全部驗證 gate PASS；未 push / 未 tag）
- 開始：2026-10-15T12:41:17+08:00；回報：2026-10-15T12:48:44+08:00
- Landing Zone：**WARN**
  - C-0：工單無 `repo` 欄位（absent）；`basename(REPO_ROOT)` = `openusage` → WARN「repo identity unavailable」
  - C-1：PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下）
  - C-3：PASS（`package.json`、`bun.lock`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/tauri.conf.json` 皆存在）
  - C-2：工單無 `branch` 欄位；HEAD = `main`
  - `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）
- 模式：`CT_MODE=yolo`

### Commits（main，未 push）

| # | SHA | Message |
|---|---|---|
| 1 | `996aff28` | Merge upstream tauri-legacy v0.6.28 into fork (0.6.29, PLAN-004) — parents `7b6cb2fb` / `0a08306d` |
| 2 | `ea22c261` | chore: drop upstream retirement notice (PLAN-004) |
| 3 | `c4ea9006` | fix(i18n): translate merged upstream UI strings (T0038) |

上游 `upstream/tauri-legacy` fetch 後仍為 `0a08306d`（與 T0037 報告一致）。衝突數 17，與報告一致。

### 逐衝突實際解法

| # | 檔案 | 實際解法 | 與報告差異 |
|---|---|---|---|
| 1–4 | `package.json`、`Cargo.toml`、`tauri.conf.json`、`Cargo.lock` | 版號 hunk 取 ours 並改 `0.6.29`；`Cargo.lock` 只有 `openusage` 一個 hunk | 無 |
| 5 | `lib.rs` | 保留 fork 結構（single-instance 第一、nspanel macOS-only），store 前插入 `tauri_plugin_clipboard_manager::init()` | 無 |
| 6 | `panel.rs` | hunk 取 fork `show_panel`；clamp `.max(mon_logical_y)`（含上游註解）手動套到 `macos::position_panel_at_tray_icon` | 無 |
| 7 | `tray.rs` | fork import + `ClipboardExt` + `crate::log_path` | 無 |
| 8 | `cache.rs` | 取上游 | 無 |
| 9 | `provider-card.tsx` | 取 fork（與 HEAD 完全相同）+ 刪 `UsageSparkline` import；`provider-card-metric-line.tsx` 移植 import、text 行 class（`gap-2` / label truncate+title / value `flex-shrink-0 max-w-[45%]`）、`barChart` 分支（用翻譯後 `label`） | 無 |
| 10 | `skeleton-lines.tsx` | 兩邊都留，皆用翻譯後 `label` | 無 |
| 11 | `overview.tsx` | 整檔取 fork | 無 |
| 12 | `use-settings-bootstrap.test.ts` | fork language 測試 + 上游 3 個測試（menubar metric ×2、windsurf→devin migration） | 無 |
| 13 | `settings.test.ts` | **逐 hunk**：衝突 hunk 取 fork（language 測試），刪 4 個 retirement import | 見偏差 1 |
| 14–15 | `plugins/gemini/plugin.js`、`plugin.test.js` | 取 fork | 無 |
| 16–17 | `plugins/windsurf/plugin.js`、`plugin.test.js` | 接受刪除 | 無 |

非衝突處理：
- `git checkout HEAD -- plugins/gemini docs/providers/gemini.md` 還原被靜默刪除的 `plugin.json`、`icon.svg`、`gemini.md`；README 在 Grok 前加回 Gemini 行；Devin 行 / Windsurf 移除照上游。
- `AGENTS.md`、`CLAUDE.md` 取 HEAD（merge 中 `CLAUDE.md` 曾被改成上游版本，已還原）。
- `.agents/skills/release-tauri` 已移除、`.agents/skills/release-tag` 還原（merge 把它當 rename）。
- `plugins/antigravity/plugin.test.js:212` → `toThrow(LOGIN_MESSAGE)`。
- 退休橫幅（commit 2）：`git rm` `src/components/retirement-notice.tsx`、`retirement-notice.test.tsx`、`docs/retirement-notice.md`；`settings.ts` 刪 `RETIREMENT_NOTICE_DISMISSED_AT_KEY`、`RETIREMENT_NOTICE_INTERVAL_MS`、`loadRetirementNoticeDismissedAt`、`saveRetirementNoticeDismissedAt`、`shouldShowRetirementNotice`。
- i18n（commit 3）：`settings.menubarMetric.*`（en/zh-TW：Metric/指標、Menubar metric/選單列指標、Default/預設、Weekly/每週）；`usageSparkline.summary` / `usageSparkline.peak`（元件內小 `fill()` 代換 `{placeholder}`）；plugin label `Usage Trend`→用量趨勢、`Rate Limit Resets`→速率限制重置；Devin label（`Weekly quota`、`Daily quota`、`Extra usage balance`）原本就有；tray tooltip weekly tag 改 `translateDisplayLabel`；`MENUBAR_METRIC_OPTIONS` 保持原樣（比照 `MENUBAR_ICON_STYLE_OPTIONS`，UI 改用 key 表）。新增 4 個測試。

### 偏差

1. **`settings.test.ts` 不可整檔取 fork**：先做了 `checkout --ours`，發現會丟掉上游非衝突的 `menubarMetric` / `migrateWindsurfToDevin` 測試與 import，立即用 `git checkout -m` 重建衝突改為逐 hunk 解。最終結果符合報告原意。
2. **`cargo fmt` 套用到 4 個不在 `affects_files` 的檔**：`src-tauri/src/local_http_api/server.rs`、`log_path.rs`、`plugin_engine/host_api.rs`、`plugin_engine/runtime.rs`。原因：上游程式碼未過 rustfmt，`cargo fmt --check` gate 失敗。純格式（import 排序、換行），併入 merge commit 並寫在 commit body。
3. **`src/hooks/app/use-tray-icon.ts`（不在 `affects_files`）**：為讓 tray tooltip 翻譯拿到語言，呼叫處多傳 `useAppPreferencesStore.getState().language`（1 個 import + 1 個呼叫）。`formatTrayTooltip` 新參數預設 `DEFAULT_LOCALE`。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `bun install` | PASS | `bun.lock` 無額外變動（只有 merge 帶入的內容） |
| `bun run bundle:plugins` | PASS | 18 plugins（含 `devin`、`gemini`，無 `windsurf`） |
| `cargo fmt --check` | PASS | 套 fmt 後 exit 0（見偏差 2）；最終 HEAD 重跑 PASS |
| `cargo check --all-targets` | PASS | 1 個既有 dead_code 警告 `run_ccusage_with_runner`（與 T0037 相同） |
| `cargo test --locked` | PASS | 137 passed（最終 HEAD 重跑） |
| `bun x tsc --noEmit` | PASS | 三個 commit 各自通過 |
| `bun run test --run` | PASS | merge：69 files / 1193；去橫幅：68 / 1188；i18n：**68 files / 1192**（≥1156）；Gemini 32/32 |
| `bun run build` | PASS | 只有既有 chunk size 警告 |
| Step 7 grep | PASS | `src/`、`docs/` 無 `retirement` |
| Step 9 grep | PASS | `src/`、`src-tauri/src` 只剩 `host_api.rs:3914/3917` redaction 測試資料；`tauri.conf.json` updater = `gowerlin/openusage`；`use-changelog.ts` `GITHUB_REPO = "gowerlin/openusage"`；About / changelog / side-nav 測試仍指向 fork |
| Step 10 redaction | PASS | Gemini 保留；host_api 只 log response body，Gemini 回應欄位 `access_token`/`refresh_token`/`id_token` 都在 `sensitive_keys`；merge 後清單只新增 `account_display_name`、`org_id`，無移除。Devin 稽核交 T0039 |
| merge graph | PASS | `996aff28` 兩個 parent，第二 parent = `0a08306d` |
| `git diff --check` | PASS | 無 warning（只有 LF/CRLF 提示） |

環境：VS 18 Enterprise `VsDevCmd -arch=x64`、`LIBCLANG_PATH=<VS>VCToolsLlvmdin`、`CI=false`；bash 內 `bunx` 不存在，改用 `bun x`。

### 遺留 / 後續

- Tray tooltip 在切換語言後要等下一次 tray 更新才會換語言（沒有為語言變化額外觸發更新）。
- 未做 runtime smoke / NSIS（T0040）；Devin Windows 行為（T0039）；發行（T0041，只推指定 tag）。
- `panel.rs` clamp 只影響 macOS，Windows 無法 runtime 驗證。
- `CHANGELOG.md` 照報告接受上游段落，未加註。
