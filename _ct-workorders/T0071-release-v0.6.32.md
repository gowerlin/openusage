---
schema_version: 1
schema_kind: workorder
id: T0071
title: Bump version and publish GitHub release v0.6.32
status: IN_PROGRESS
priority: High
type: release
plan_id: PLAN-007
bug_id: null
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T19:43:49+08:00"
started_at: "2026-10-15T19:43:49+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0070
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0071 Bump Version And Publish GitHub Release v0.6.32

## 背景

PLAN-007 最後一步，流程同 T0063（含 push 前隱私掃描、只推單一 tag、Node 24 workflow）。

## 授權範圍（D109：使用者「功能放 v0.6.32」）

- ✅ 版號 `0.6.31` → `0.6.32`；`git push origin main`；建立並 push **單一** tag `v0.6.32`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`；不得 force-push、移動 / 刪除既有 tag 或 release

## 前置條件（不符即 BLOCKED）

- T0069、T0072 `DONE`、T0070 `DONE`（smoke 全 PASS）；`git status` 乾淨；main 只 ahead；`v0.6.32` tag 不存在。

## 任務指令

同 T0063 步驟 1–6（版號 → 0.6.32）。發行重點說明（繁中）：本版重點 = 側邊欄新增「Token 戰情室」按鈕（背景啟動 [TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights) 並開啟看板，關閉 OpenUsage 時自動結束；需要 Node.js 18.18+ 或已安裝的 token-usage-insights）。另列 BUG-019（tray 右鍵不再開關面板）。已知問題沿用 BUG-017。

## 驗證 Gate

- PASS：Publish run 成功且無 Node 20 annotation；release / assets / `latest.json` 0.6.32 / Latest；fork 無非預期 tag；release body = API body

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

### 狀態

（進行中）「Landing check」到「步驟 3」寫於 push 前（2026-10-15T19:45:16+08:00），含在 bump commit 內。

### Landing check

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent → WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`。
- C-1：PASS（`D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/T0071-release-v0.6.32.md`）。
- C-3：PASS（4 個 `affects_files` 皆存在）。C-2：無 `branch` 欄位（HEAD = `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）；`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### 前置條件

| 項目 | 結果 |
|---|---|
| T0069、T0072、T0070 | 全部 `status: DONE`；T0070 回報 NSIS / Token 戰情室 8 項 / BUG-019 / 回歸 9 項全 PASS |
| `git status` | 開工時乾淨 |
| `git fetch origin` 後 | `origin/main..HEAD` = 11、`HEAD..origin/main` = 0（只 ahead）；`origin/main` = `4937e11c`（= `v0.6.31`） |
| `v0.6.32` tag | 本機與 `git ls-remote --tags origin v0.6.32` 皆空 |
| push URL | `https://github.com/gowerlin/openusage.git` |

### 步驟 1：版號 + README

- `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` → `0.6.32`；`cargo update -p openusage --offline` → `Cargo.lock` `openusage v0.6.31 -> v0.6.32`（只動這一行）。
- README plugin 清單：`plugins/` 18 個 provider（排除 `mock`）全部有 `docs/providers/<id>.md` 連結 → PASS。README 已有 T0069 加的「Token Dashboard」說明。

### 步驟 2：Push 前隱私掃描（D081）

PASS。範圍：`git diff origin/main` 新增行（含工作區、排除 `*.png` / lock，1412 行；`origin/main` = `v0.6.31`，兩範圍相同）。
- Token（`sk-`、`ghp_`、`gho_`、`github_pat_`、JWT `eyJ…`、`xox?-`、`AKIA`、private key）：0 筆。
- 帳號 ID（`org-…`）：0 筆。Email：0 筆。
- UUID 命中只有 `BAT_WORKSPACE_ID`（本機終端工作區 ID，非帳號；先例同 T0054 / T0063）。
- 路徑：`C:\Users\…`、`C:/Users/…`、`/Users/…`、`/home/…` 0 筆；`AppData` 命中 5 筆皆為遮蔽形式（`%LOCALAPPDATA%\OpenUsage`、`~\AppData\Local\com.sunstory.openusage\logs\OpenUsage.log`）。`gower` 命中只有 repo 名 `gowerlin`。
- 截圖：push 範圍新 PNG 3 張（`_ct-workorders/assets/T0070/token-running.png`、`token-no-npx.png`、`bug016-low-hold500.png`）逐張目視：只截面板、背景透明，只有方案名（Max 20x / Free）與百分比，無 token / email / 帳號 ID。

### 步驟 3：驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `bun run test --run` | PASS | 70 files / 1258 tests passed |
| `bun run build` | PASS | exit 0（只有 chunk > 500 kB 既有警告） |
| `cargo test --locked` | PASS | VsDevCmd x64（`Visual Studio\18\Enterprise`）+ `LIBCLANG_PATH` + `CI=false`：`168 passed; 0 failed` |
