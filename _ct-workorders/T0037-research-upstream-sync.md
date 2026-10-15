---
schema_version: 1
schema_kind: workorder
id: T0037
title: Research upstream sync (tauri-legacy merge + v0.7.x port candidates)
status: IN_PROGRESS
priority: High
type: research
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:10:18+08:00"
updated_at: "2026-10-15T12:11:29+08:00"
started_at: "2026-10-15T12:11:29+08:00"
completed_at: null
commit: null
agent: default
intervention_type: decision-requiring
interaction_mode: enabled
renew_count: 0
depends_on: []
affects_files:
  - _ct-workorders/_report-T0037-upstream-sync.md
---

# T0037 Research Upstream Sync

- **類型**：research
- **互動模式**：enabled
- **Renew 次數**：0

## 背景

PLAN-004。上游 `robinebers/openusage`（remote `upstream`）：

- `main` / `v0.7.14`：2026-06-15 起為 native Swift（macOS only）重寫，與 fork `main` **無共同祖先**。
- `tauri-legacy` / `v0.6.28`：Tauri 凍結線。merge-base `f415ddd`（v0.6.24）；上游 +89 / fork +48；塔台 `git merge-tree --write-tree --name-only main upstream/tauri-legacy` 得 17 衝突（清單見 PLAN-004）。

## 🔴 唯讀限制（必守）

- **不得**在 repo 主工作區做 merge / checkout / reset / stash；T0036（release `v0.6.27`）可能同時在主工作區執行。
- 分析優先用 `git merge-tree`（不動工作區）。若需實際檔案試解，用 `git worktree add "%TEMP%\openusage-T0037" -b research/T0037-upstream-sync main`，只在該 worktree 操作；**不 push 該分支**；結束後 `git worktree remove` 並刪除該本地分支（本工單授權此清理）。
- 不 commit 任何 product 檔；唯一產出是報告檔 + 本工單回報區（可 commit 這兩個檔）。
- `gh` 指令一律加 `-R`（查上游用 `-R robinebers/openusage`、查 fork 用 `-R gowerlin/openusage`）。

## 研究問題

### A. `tauri-legacy` merge 分析（主要）

1. 先 `git fetch upstream` 確認 `tauri-legacy` 最新；以當下 `main` 重跑 merge-tree，列出實際衝突（T0036 bump 後版本檔仍會衝突，屬預期）。
2. **逐檔**衝突：上游改了什麼（引用 commit / PR）、fork 改了什麼（引用 T#### / commit）、**建議解法**（保留哪邊 / 如何合併），標示風險（低 / 中 / 高）。
3. 重點檔：
   - `lib.rs` / `panel.rs` / `tray.rs`：fork 的 Windows panel subclass / region mask（T0022–T0031）、single-instance（T0032）、tray icon（T0023/T0024）必須保留；上游 `aa424a4c`（clamp panel to visible screen）等 macOS 修正如何共存。
   - `plugins/gemini/*`、`plugins/windsurf/*`（上游刪除、fork 改過）：上游以 Antigravity / Devin 取代；fork 在 T0004 加的 Windows path / explicit unsupported 是否需移植到新 plugin（antigravity / devin）。
   - `local_http_api/cache.rs`、`provider-card.tsx`、`skeleton-lines.tsx`、`overview.tsx`、`use-settings-bootstrap.test.ts`：i18n（T0014/T0015）、theme（T0019）與上游新功能的合併方式。
4. **自動合併但有語意風險**的檔：例如 `side-nav.tsx`、`App.tsx`、`host_api.rs`、`capabilities/default.json`、`AGENTS.md`、`README.md` —— 檢查是否會帶回指向上游的連結（BUG-005 / T0034 / T0035 改過的 changelog / About / Help）、未翻譯的新 UI 字串（需補 i18n）、macOS-only 行為在 Windows 是否 fail loud。
5. **退休通知橫幅**（`ff9e8ca7` 等）：使用者決定**不帶進 fork**。提出最小的排除方式（revert 相關 commit / 合併時移除元件 / 其他），並列出牽涉檔案。
6. 上游 release / CI 改動（`release-tauri` skill、`.github/**`）：哪些應排除以免破壞 fork 的 Windows-only `publish.yml`。
7. 新增依賴與安全更新（`b1b4d32b`、`19209e85`）：對 Windows build 的影響。

### B. 版號策略

- 上游已使用 tag `v0.6.26`、`v0.6.27`、`v0.6.28`，與 fork 同名不同內容。提出 merge 後 fork 版號建議（例如 `0.6.29` 或其他），並評估對 fork updater（`latest.json` 指向 fork）有無影響。版號最後由使用者決定。

### C. `v0.7.x` Swift 版移植候選（次要，清單即可）

- 讀 `upstream/main` 的 `CHANGELOG.md` / release notes（`v0.7.0`–`v0.7.14`），列出 **provider / 使用者可感知功能**中，Tauri 版沒有、且對 Windows 有意義、可用合理成本移植的項目。每項：功能、上游來源、估計規模（S/M/L）、建議（移植 / 不移植 + 理由）。不做程式碼移植。

## 產出

`_ct-workorders/_report-T0037-upstream-sync.md`，結構：

1. 摘要（一段 + 推薦方案）
2. 衝突總表（檔案 | 類型 | 上游改動 | fork 改動 | 建議解法 | 風險）
3. 語意風險清單（自動合併檔）
4. 退休橫幅排除方案
5. 排除清單（不帶進來的上游改動）
6. 版號建議
7. v0.7.x 移植候選表
8. 建議的實作工單拆分（例如：merge + 衝突解決 / i18n 補字串 / plugin Windows path 移植 / 驗證與發行）

## 互動

可向使用者提問（每次最多 3 題），用於無法從程式碼判斷的取捨。互動紀錄寫入回報區。

## 回報區

### 互動紀錄

### 調查結論

### 建議方向
- [ ] 方案 A：…
- [ ] 方案 B：…
- [ ] 繼續研究（Renew，新方向：...）

### Renew 歷程
無
