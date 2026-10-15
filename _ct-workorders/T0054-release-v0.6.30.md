---
schema_version: 1
schema_kind: workorder
id: T0054
title: Bump version and publish GitHub release v0.6.30
status: IN_PROGRESS
priority: Medium
type: release
bug_id: null
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T16:09:06+08:00"
started_at: "2026-10-15T16:09:06+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0053
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0054 Bump version and publish GitHub release v0.6.30

## 背景

PLAN-005 最後一步。流程同 T0041，但本單需要 bump 版號。

## 授權範圍（使用者 2026-10-15「處理 v0.6.30」，D085）

- ✅ 版號 `0.6.29` → `0.6.30` 並 commit 到 `main`
- ✅ `git push origin main`
- ✅ 建立並 push **單一** tag：`git push origin v0.6.30`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`（本機仍有舊上游 tag）
- ❌ 不得 force-push、移動 / 刪除既有 tag 或 release；需要時回報 BLOCKED

## 前置條件（不符即 BLOCKED）

- T0050、T0051、T0052 `DONE`；T0053 `DONE`（smoke 全 PASS）。
- `git status` 乾淨；`git fetch origin` 後 main 只 ahead；`git ls-remote --tags origin v0.6.30` 為空。

## 任務指令

1. 版號四檔 → `0.6.30`（`cargo update -p openusage --offline`）。README plugin 清單確認。
2. Push 前隱私掃描（D081，同 T0041 步驟 2）。
3. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build`。
4. Commit `chore: bump version to 0.6.30`（版本檔 + 本工單）。
5. `git push origin main`；`git tag -a v0.6.30 -m v0.6.30 <bump commit>`；`git push origin v0.6.30`。
6. 追蹤 `gh run watch -R gowerlin/openusage <id>`；驗證 release（`-R gowerlin/openusage`）：非 draft / 非 pre、3 assets、`latest.json` 0.6.30 指向 fork、Latest = v0.6.30、fork tag 只多 v0.6.30。
7. 發行重點說明（繁中，格式同 v0.6.29）：本版重點 = v0.6.29 已知問題修正（BUG-013 面板失焦收起更穩、BUG-014 詳細頁數值完整顯示、BUG-015 面板不超出工作區 / 位置記憶不被改寫）。`gh release edit v0.6.30 -R gowerlin/openusage --notes-file`，並以 GitHub API 確認 body。已知問題段可列 BUG-016（拖曳到偏下後面板暫時超出螢幕，下次顯示會修正）。

## 驗證 Gate

- PASS：Publish run 成功；release / assets / `latest.json` / Latest；fork 無非預期 tag；release body = API body

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

### 狀態

（push 前段落寫於 2026-10-15T16:10:09+08:00，含在 bump commit 內；最終狀態見下方收尾段。）

### Landing check

- 結果：WARN（只有 C-0）。
- C-0：frontmatter `repo` = absent → WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`。
- C-1：PASS（`D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/T0054-release-v0.6.30.md`）。
- C-3：PASS（4 個 `affects_files` 皆存在）。C-2：無 `branch` 欄位（HEAD = `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）；`CT_MODE=yolo`，`CT_INTERACTIVE` 未設。

### 前置條件

| 項目 | 結果 |
|---|---|
| T0050 / T0051 / T0052 / T0053 | 全部 `status: DONE` |
| `git status` | 開工時乾淨 |
| `git fetch origin` 後 | `origin/main...HEAD` = `0 14`（只 ahead） |
| `git ls-remote --tags origin v0.6.30` | 空 |
| push URL | `https://github.com/gowerlin/openusage.git` |

### 步驟 1：版號 + README

- `package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml` → `0.6.30`；`cargo update -p openusage --offline` → `Cargo.lock` `openusage v0.6.29 -> v0.6.30`（只動這一行）。
- README plugin 清單：`origin/main..HEAD` 沒有改 `plugins/` 或 `README.md` → 與 v0.6.29 相同，PASS。既有缺口（`perplexity`、`synthetic` 未列）同 T0041 觀察，本單不改。

### 步驟 2：Push 前隱私掃描（D081）

PASS。範圍：`git diff origin/main..HEAD` 新增行（排除 `*.png` / lock）+ 本次新增 7 張截圖。
- Token（`sk-`、`ghp_`、`gho_`、`github_pat_`、JWT `eyJ…`、`devin-session-token$`、`xox?-`、`AKIA`、private key）：0 筆。
- Email：0 筆。帳號 ID（`org-…`）：0 筆。
- UUID 命中只有 `BAT_WORKSPACE_ID`（本機終端工作區 ID，非帳號）；`origin/main` 已有 10 個工單含同值（先例）。
- 路徑：只有已遮蔽的 `C:\Users\<user>\…`。`gower` 命中只有 repo 名 `gowerlin`（公開）。
- 截圖逐張目視（`T0050/metric-text-278px.png`、`T0053/about.png`、`claude-detail-en.png`、`claude-detail-zh-TW.png`、`claude-detail-no-runner-en.png`、`claude-detail-no-runner-zh-TW.png`、`settings-low-lang.png`）：只有 app UI、模型名與用量數字 / 金額（允許公開）；T0053 截圖背景已塗棋盤格，沒有背景視窗內容。

### 步驟 3：驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `bun run test --run` | PASS | 70 files / 1204 tests passed |
| `bun run build` | PASS | exit 0（只有 chunk > 500 kB 既有警告） |
| `cargo test --locked` | PASS | VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`：`153 passed; 0 failed` |
