---
schema_version: 1
schema_kind: workorder
id: T0066
title: Translate Claude reset grants value and update Claude / Copilot provider docs
status: PENDING
priority: Low
type: chore
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T17:01:31+08:00"
updated_at: "2026-10-15T17:15:40+08:00"
started_at: null
completed_at: null
commit: null
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
---

# T0066 Translate Claude Reset Grants Value + Claude Docs

## 背景

T0059（`7da18a17`）新增 Claude「速率限制重置」列，value 為動態字串 `N available`，zh-TW 介面仍顯示英文；`docs/providers/claude.md` 未記載 Fable / Rate Limit Resets（D099）。

## 任務指令

1. i18n：`translateDisplayValue()`（T0047 新增）目前只做靜態字串對照。加入**最小**的樣式對照支援 `^(\d+) available$` → zh-TW `可用 N 次`（en 不變）。不做通用模板引擎（AGENTS.md 不過度工程）。若 Codex「Rate Limit Resets」也輸出同格式 value，確認一併生效。補測試（含 `0 available`、非相符字串不翻譯、plan 名 `Free` / `Pro` 不受影響）。
2. `docs/providers/claude.md`：補 Fable 每週限額（`limits[]` `weekly_scoped`）、Rate Limit Resets（`cedar_ember`、每小時最多查一次、顏色門檻、User-Agent 變更），比照文件既有格式，引用上游 `00189454` / `4b068d52`。
3. `docs/providers/copilot.md`（D101）：改寫為 T0061 新行為——Credits（AI Credits）、Extra Usage、Chat / Completions（`quota_snapshots`）、org-managed seat 的個人 `credits_used` 與 Org Credits / Org Spend（`/user/orgs` + billing summary，需 org owner / billing manager）、無資料時明確錯誤；註明**Windows 目前讀不到 gh 存在 Credential Manager 的 token**（keychain host API macOS-only），引用上游 `c6e4cb95` / `8b567aee`。
4. 不改 plugin 行為。

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

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
