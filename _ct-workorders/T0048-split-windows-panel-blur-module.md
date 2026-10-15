---
schema_version: 1
schema_kind: workorder
id: T0048
title: Refactor - move Windows panel blur logic out of panel.rs
status: PENDING
priority: Medium
type: refactor
bug_id: null
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T14:18:43+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0047
affects_files:
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_blur.rs
  - src-tauri/src/lib.rs
  - plugins/claude/plugin.js
  - plugins/claude/plugin.test.js
  - plugins/codex/plugin.js
  - plugins/codex/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src/lib/i18n.test.ts
---

# T0048 Refactor - move Windows panel blur logic out of panel.rs

## 背景

T0043 後 `panel.rs` 515 行，超過 AGENTS.md「Keep files <~400 LOC」。

## 任務指令

1. 把 T0043 新增的 Windows blur-hide 邏輯（`hide_on_blur`、`should_hide_after_blur`、`is_recent_blur_hide`、debounce 狀態與其測試）移到新模組 `src-tauri/src/panel_blur.rs`（`#[cfg(windows)]` 範圍同原本）。
2. **純搬移，不改行為**。`panel.rs` 降到 ~400 行以下；若仍超過，只回報。
3. 不動 `panel_hit_test.rs`（BUG-001 高風險區）。
4. **附帶（獨立 commit，D079）**：BUG-011 提示文案在 400px 面板被 `max-w-[45%]` + `truncate` 截斷。改短文案：
   - en value：`Install Node.js (npx) or Bun to enable` → `Needs Node.js or Bun`
   - zh-TW value：`安裝 Node.js（npx）或 Bun 以啟用` → `需要 Node.js 或 Bun`
   - label `Usage history` / `用量歷史` 不變。同步改 claude / codex plugin、測試、`i18n-plugin-labels.ts` key 對應。不改元件排版。
   - Commit：`fix: shorten usage history runner hint (T0048)`。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`（測試數不減少）
- PASS：`bun run build`、`bun run test --run`、`bun run bundle:plugins`
- PASS：文案改短後，以實機或 browser dev 確認 zh-TW / en 都不被截斷（UIA 或截圖，無 `…`）。
- PASS：`git diff --stat` 顯示主要為搬移；回報 `panel.rs` 新行數。
- 實機 smoke 交給 T0044。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`refactor(windows): move panel blur logic to panel_blur.rs (T0048)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
