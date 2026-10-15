---
schema_version: 1
schema_kind: workorder
id: T0064
title: Validate Node 24 CI changes via a GitHub pre-release (v0.6.31-pre.1)
status: PENDING
priority: High
type: verification
plan_id: PLAN-006
bug_id: null
created_at: "2026-10-15T16:47:34+08:00"
updated_at: "2026-10-15T16:47:34+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
affects_files:
  - .github/workflows/pre-release.yml
---

# T0064 Validate Node 24 CI Changes Via A GitHub Pre-Release

## 背景

T0056 把 `publish.yml` 的 `actions/checkout@v4` → `@v7`、`ilammy/msvc-dev-cmd@v1` → inline pwsh VsDevCmd step，但**沒在 GitHub runner 實跑**。若 T0063 推 tag 後才失敗，`v0.6.31` tag 已推出去會卡住。使用者決定（D096）：正式發行前先用 `pre-release.yml`（`workflow_dispatch`、Windows NSIS）驗證。`pre-release.yml` 目前仍用 `checkout@v4` + `ilammy/msvc-dev-cmd@v1`。

## 授權範圍（使用者 2026-10-15，D096）

- ✅ 修改 `pre-release.yml`（同 T0056 的 action 升級，MSVC step **逐字沿用** `publish.yml` 的 inline step）並 commit
- ✅ `git push origin main`
- ✅ `gh workflow run pre-release.yml -R gowerlin/openusage -f version=0.6.31-pre.1`（workflow 自行建立 pre-release tag / release）
- ❌ 不推任何其他 tag（禁止 `--tags` / `--follow-tags`）；不 force-push；不刪 / 移動既有 tag 或 release；不改 `publish.yml`

## 前置條件（不符即 BLOCKED）

- T0055–T0061 `DONE`；T0062 `DONE`。`git status` 乾淨；main 只 ahead。
- 先讀 `pre-release.yml` 全文，確認：版本解析規則（`MAJOR.MINOR.PATCH-pre.N`）、是否要求版本檔與 tag 一致（目前版本檔 = 0.6.30；若 workflow 會改寫版本或要求一致，回報並依 workflow 既有設計處理，不改 workflow 邏輯）、是否會產生 `latest.json` 以及會不會影響正式 updater。
- `git ls-remote --tags origin v0.6.31-pre.1` 為空。

## 任務指令

1. `pre-release.yml`：`actions/checkout@v4` → `@v7`（兩處）；`ilammy/msvc-dev-cmd@v1` → 與 `publish.yml` 相同的 inline step。其他不動。`actionlint` 驗證。
2. Commit `ci: update pre-release workflow for Node 24 (T0064)`，`git push origin main`。
3. 觸發：`gh workflow run pre-release.yml -R gowerlin/openusage -f version=0.6.31-pre.1`；`gh run watch -R gowerlin/openusage <id> --exit-status`。
4. 驗證：
   - run success；**inline MSVC step 成功**（log 中找到 VsDevCmd、匯出變數）；Tauri build 成功。
   - **無 Node 20 deprecated annotation**（`gh run view --log` / annotations）。
   - release `v0.6.31-pre.1`：`isPrerelease=true`、非 draft、有 NSIS setup / `.sig`。
   - `gh release list -R gowerlin/openusage`：**Latest 仍是 `v0.6.30`**；`releases/latest/download/latest.json` 仍是 `0.6.30`（正式 updater 不受影響）。
   - fork tag 清單只多 `v0.6.31-pre.1`。
5. 失敗時：**不重試、不改 publish.yml**，回報失敗 step 與 log 摘要，BLOCKED，由塔台決定（例如改回 ilammy）。

## 環境與限制

- `gh` 一律加 `-R gowerlin/openusage`。不改 registry。不執行 installer。

## 收尾

- 收尾 commit 只在本機，不再 push。

## 回報區

（Worker 填寫：狀態、commit、run ID、MSVC step log 摘要、annotation 清單、release / Latest / latest.json 驗證、tag 比對）
