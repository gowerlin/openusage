---
schema_version: 1
schema_kind: workorder
id: T0038
title: Merge upstream tauri-legacy v0.6.28 into fork (0.6.29) + i18n
status: PENDING
priority: High
type: implementation
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:39:32+08:00"
started_at: null
completed_at: null
commit: null
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

（Worker 填寫：狀態、三個 commit SHA、逐衝突實際解法（與報告不同處要說明）、驗證數字、遺留問題）
