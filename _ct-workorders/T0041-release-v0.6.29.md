---
schema_version: 1
schema_kind: workorder
id: T0041
title: Publish GitHub release v0.6.29 (upstream sync)
status: PENDING
priority: High
type: release
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T13:18:05+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0038
  - T0039
  - T0040
  - T0042
  - T0043
  - T0044
affects_files: []
---

# T0041 Publish GitHub Release v0.6.29 (Upstream Sync)

## 背景

PLAN-004 最後一步。版號 `0.6.29` 已由 T0038 在 merge commit 寫入四個版本檔，本單**不再 bump**。流程同 T0036。

## 授權範圍（使用者 2026-10-15 明確授權，D071）

- ✅ `git push origin main`
- ✅ 建立並 push **單一** tag `v0.6.29`：`git push origin v0.6.29`
- ❌ **嚴禁 `git push --tags` / `--follow-tags` / `--mirror`**（本機仍有共用歷史的舊上游 tag `v0.0.1`–`v0.6.23`、`v0.3.1`、`v0.4.1`，推上去會觸發舊 workflow、污染 fork Latest release）。
- ❌ 不得 force-push、移動 / 刪除既有 tag 或 release。需要時回報 BLOCKED。

## 前置條件（不符即 BLOCKED）

- T0038、T0039、T0042、T0043 `status: DONE`；**T0044** `status: DONE`（re-smoke 全 PASS）。T0040 為 PARTIAL（已由 T0042–T0044 解決，D074）。
- 四個版本檔皆為 `0.6.29`。
- `git status` 除塔台私有檔外乾淨；`git fetch origin` 後 main 只 ahead。
- `git ls-remote --tags origin v0.6.29` 為空。
- `git remote get-url --push origin` = `https://github.com/gowerlin/openusage.git`。

## 任務指令

1. README 支援 plugin 清單已由 T0038/T0039 更新 → 確認（AGENTS.md push 前要求）。
2. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build` PASS。
3. 回報區先寫入 push 前狀態 commit：`chore: prepare release v0.6.29 (T0041)`（只含本工單）。
4. `git push origin main`。
5. `git tag -a v0.6.29 -m v0.6.29 <HEAD>`；`git push origin v0.6.29`（**只推這一個**）。
6. 追蹤 `gh run list -R gowerlin/openusage --workflow publish.yml` → `gh run watch -R gowerlin/openusage <id>`。
7. 驗證（全部加 `-R gowerlin/openusage`）：非 draft / 非 prerelease；assets 含 NSIS setup、`.sig`、`latest.json`；`latest.json` `version` = `0.6.29`、URL 指向 fork；`gh release list -R gowerlin/openusage` 確認 Latest = `v0.6.29`，且**沒有**任何非預期的新 release / tag 出現在 fork（`git ls-remote --tags origin` 比對 push 前清單）。
8. **發行重點說明**（繁中，格式同 `v0.6.27`）：`gh release edit v0.6.29 -R gowerlin/openusage --notes-file <檔>`。
   - 本版重點：**同步上游 OpenUsage Tauri 版（tauri-legacy v0.6.25–v0.6.28）的改進**，並保留本 fork 的 Windows 支援、繁中與主題。
   - 依使用者可感知分類列出：新功能（Usage Trend 圖、Codex rate-limit resets、menubar weekly metric、Copy Log Path、Devin 取代 Windsurf、Antigravity/agy…）、修正（Codex token refresh、Cursor、安全性依賴更新…）、fork 調整（保留 Gemini、不含退休通知、Devin Windows 行為、補繁中翻譯）；Windows 修正（Usage Trend / ccusage 在 Windows 可用 BUG-006、面板不佔工作列 BUG-007、面板失焦自動收起 BUG-008）。
   - 上游項目可附上游 PR 連結（`robinebers/openusage/pull/N`）並註明「來自上游」；fork commit 用 fork 連結。
   - 寫入後 `gh release view` 與 `curl https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.29` 確認 body。

## 明確排除

- 不改功能程式碼、不改 `.github/workflows/**`。workflow 失敗 → 回報失敗步驟與 log 摘要。
- 不 commit 塔台私有檔。

## 驗證 Gate

- PASS：Publish run 成功（run ID）
- PASS：release / assets / `latest.json` / Latest 標記
- PASS：fork 無非預期 tag / release
- PASS：release body + GitHub API body

## 回報區

（Worker 填寫：狀態、commit、tag、run ID、release URL、assets、push 前後 tag 清單比對、發行說明全文、阻塞）
