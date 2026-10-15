---
schema_version: 1
schema_kind: workorder
id: T0047
title: Show a hint when usage history needs Node.js or Bun
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-011
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:41:38+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0046
affects_files:
  - plugins/claude/plugin.js
  - plugins/claude/plugin.test.js
  - plugins/codex/plugin.js
  - plugins/codex/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src/lib/i18n.ts
  - src/hooks/app/use-tray-icon.ts
  - docs/providers/devin.md
---

# T0047 Show a hint when usage history needs Node.js or Bun

## 背景

收斂 T0038 / T0039 / T0042 記下的三個前端 / 文件小問題。

## 任務指令

1. **BUG-011 no_runner 提示**：claude / codex plugin 收到 ccusage `no_runner` 時，輸出一行 text line（label `Usage history`，value `Install Node.js (npx) or Bun to enable`）。比照 plugin 既有 text line 寫法；加入 `i18n-plugin-labels.ts`（zh-TW：`用量歷史` / `安裝 Node.js（npx）或 Bun 以啟用`）。有 runner 時不輸出。更新測試 `omits token lines when ccusage reports no_runner`。
2. **Tray tooltip 語言即時更新**（D072）：語言切換後立即重算 tray tooltip（`use-tray-icon.ts` 監聽 `language`）。Windows `keepDesktopTrayIcon` 若本來就不更新 tooltip，保持該設計。補測試。
3. **Devin 文件**（D073）：`docs/providers/devin.md` 補 Windows 憑證路徑 `%APPDATA%\devin\credentials.toml`、Windows 只支援 Devin CLI 登入（與 README / T0039 一致）。
4. AGENTS.md：plugin 變動 → 確認新增 text line 不含敏感欄位（靜態提示）。

## 驗證 Gate

- PASS：`bun run test --run`、`bun run build`、`bun run bundle:plugins`
- PASS：實機（release exe，cwd `%TEMP%`）：只對測試 process 設定 PATH 讓它找不到任何 runner（不改系統設定）→ Claude 詳細頁出現提示行（zh-TW）；恢復後提示消失、Usage Trend 顯示。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`fix: hint when usage history needs a runner, tray tooltip and devin docs (T0047)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
