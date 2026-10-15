---
schema_version: 1
schema_kind: workorder
id: T0063
title: Bump version and publish GitHub release v0.6.31
status: IN_PROGRESS
priority: High
type: release
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T18:41:45+08:00"
started_at: "2026-10-15T18:41:45+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
  - T0064
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0063 Bump version and publish GitHub release v0.6.31

## 背景

PLAN-006 最後一步。流程同 T0054。

## 授權範圍（D093：沿用使用者「修完再發」）

- ✅ 版號 `0.6.30` → `0.6.31` 並 commit 到 `main`；`git push origin main`；建立並 push **單一** tag `v0.6.31`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`；不得 force-push、移動 / 刪除既有 tag 或 release

## 前置條件（不符即 BLOCKED）

- T0055–T0061、T0065、T0066、T0067 `DONE`；T0062 PARTIAL 已由 T0067 / T0068 解決（T0068 `DONE`）；**T0064 `DONE`（pre-release CI 驗證通過）**。`git status` 乾淨；main 只 ahead；`v0.6.31` tag 不存在。

## 任務指令

1. 版號四檔 → `0.6.31`。README plugin 清單確認。
2. Push 前隱私掃描（D081，同 T0054 步驟 2）。
3. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build`。
4. Commit `chore: bump version to 0.6.31`；`git push origin main`；`git tag -a v0.6.31 -m v0.6.31 <bump>`；`git push origin v0.6.31`。
5. `gh run watch -R gowerlin/openusage <id>`；**確認無 Node 20 deprecated annotation**（T0056）；若 workflow 因 T0056 的 action 升級失敗 → 回報 BLOCKED，不自行改 workflow、不重推 tag。
6. 驗證 release（`-R gowerlin/openusage`）：非 draft / 非 pre、3 assets、`latest.json` 0.6.31 指向 fork、Latest、fork tag 只多 v0.6.31。
7. 發行重點說明（繁中，格式同 v0.6.30；已知問題段列 BUG-017：Windows 上 Copilot 讀不到 gh token）：BUG-016、上游 v0.7.x 移植項（逐項，附上游來源）、README / CI。`gh release edit` + API 確認 body。

## 驗證 Gate

- PASS：Publish run 成功且無 Node 20 annotation；release / assets / `latest.json` / Latest；fork 無非預期 tag；release body = API body

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

### 狀態

進行中。「Landing check」到「步驟 3」寫於 push 前（2026-10-15T18:42:50+08:00），含在 bump commit 內。

### Landing check

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent → WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`。
- C-1：PASS（`D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/T0063-release-v0.6.31.md`）。
- C-3：PASS（4 個 `affects_files` 皆存在）。C-2：無 `branch` 欄位（HEAD = `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）；`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### 前置條件

| 項目 | 結果 |
|---|---|
| T0055–T0061、T0064–T0068 | 全部 `status: DONE` |
| T0062 | `PARTIAL`（工單註明已由 T0067 / T0068 解決；T0068 `DONE`） |
| `git status` | 開工時乾淨 |
| `git fetch origin` 後 | `origin/main..HEAD` = 2、`HEAD..origin/main` = 0（只 ahead） |
| `v0.6.31` tag | 本機與 `git ls-remote --tags origin v0.6.31` 皆空 |
| push URL | `https://github.com/gowerlin/openusage.git` |

- 開工後塔台並行寫入 `_backlog.md`、`_tower-state.md`、`PLAN-007`、`T0069`–`T0071`；本單 commit 只精準 stage 版本四檔 + 本工單，不帶這些檔。

### 步驟 1：版號 + README

- `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` → `0.6.31`；`cargo update -p openusage --offline` → `Cargo.lock` `openusage v0.6.30 -> v0.6.31`（只動這一行）。
- README plugin 清單：`plugins/` 18 個 provider（排除 `mock`）全部列在 `## Supported Providers`（T0056 已補 Perplexity / Synthetic；T0058 / T0059 / T0060 / T0061 / T0065 已更新 Grok / Claude / OpenCode Go / Copilot 描述）→ PASS。

### 步驟 2：Push 前隱私掃描（D081）

PASS。範圍：`git diff origin/main` 新增行（含工作區、排除 `*.png` / lock，62 行），另加大範圍 `git diff v0.6.30`（4322 行）交叉檢查。
- Token（`sk-`、`ghp_`、`gho_`、`github_pat_`、JWT `eyJ…`、`xox?-`、`AKIA`、private key）：兩個範圍皆 0 筆。
- 帳號 ID（`org-…`）：0 筆。
- Email：push 範圍 0 筆；`v0.6.30` 範圍只有測試假資料 `user@example.com`、`active@example.com`。
- UUID 命中只有 `BAT_WORKSPACE_ID`（本機終端工作區 ID，非帳號；先例同 T0054）。
- 路徑：push 範圍 0 筆；`v0.6.30` 範圍只有測試假路徑 `C:\Users\John`、`C:\Users\winuser`。`gower` 命中只有 repo 名 `gowerlin`。
- 截圖：push 範圍沒有新 PNG（`v0.6.30` 之後的 17 張截圖已在 `origin/main`，由各單驗收時掃描）。

### 步驟 3：驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `bun run test --run` | PASS | 70 files / 1254 tests passed |
| `bun run build` | PASS | exit 0（只有 chunk > 500 kB 既有警告） |
| `cargo test --locked` | PASS | VsDevCmd x64（`Visual Studio\18\Enterprise`）+ `LIBCLANG_PATH` + `CI=false`：`158 passed; 0 failed` |
