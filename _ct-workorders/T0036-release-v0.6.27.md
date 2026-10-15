---
schema_version: 1
schema_kind: workorder
id: T0036
title: Bump version and publish GitHub release v0.6.27
status: IN_PROGRESS
priority: Medium
type: release
bug_id: BUG-005
plan_id: null
created_at: "2026-10-15T12:05:34+08:00"
updated_at: "2026-10-15T12:06:23+08:00"
started_at: "2026-10-15T12:06:23+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0034
  - T0035
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0036 Bump Version And Publish GitHub Release v0.6.27

## 背景

使用者要求把 T0034 / T0035（BUG-005：App 內 changelog、About、Help 改指向 fork）推上 GitHub 並發行 `v0.6.27`。流程同 T0033（`v0.6.26`，Publish run `38675818087`）。

## 授權範圍（使用者 2026-10-15 明確授權）

- ✅ commit 版本 bump 到 `main`
- ✅ `git push origin main`（會一併推上目前本機 ahead 的 T0034 / T0035 與塔台 commit）
- ✅ 建立並 push 新 tag `v0.6.27`
- ❌ 不得 force-push、不得移動 / 刪除任何既有 tag、不得刪除 release。遇到需要這些操作 → 回報 BLOCKED。

## 已知環境注意（T0032 / T0033 經驗）

- **所有 `gh` 指令一律加 `-R gowerlin/openusage`**。上游 `robinebers/openusage` 也有同名 tag；`gh repo set-default` 已設為 fork，但仍明寫 `-R` 防呆。
- `cargo test --lib` 需 VsDevCmd x64 + `LIBCLANG_PATH=<VS>\VC\Tools\Llvm\x64\bin`；從 PowerShell 用 `cmd.exe /c` 呼叫（Git Bash `cmd //c` 會卡互動模式）。
- 環境有空的 `CI` 變數；若需跑 `tauri build`，設 `CI=false`（本單不需本機打包）。
- Fork 前一版 `v0.6.26` release body 是 T0033 寫的繁中格式，可作為範本：`gh release view v0.6.26 -R gowerlin/openusage`。

## 前置條件（不符即 BLOCKED）

- T0034、T0035 frontmatter `status: DONE`，commit `a6c52aa`、`353c412` 在本地 `main`。
- `git status` 除塔台私有檔（`_ct-workorders/_*.md`）外無未 commit product 改動。
- `git fetch origin` 後 `main` 只 ahead、不 behind / diverged。
- `git ls-remote --tags origin v0.6.27` 為空。

## 任務指令

1. 版本 `0.6.26` → `0.6.27`：`package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.lock`（`cargo update -p openusage --offline`）。
2. 確認 `README.md` 支援 plugin 清單無需變更（本次無 plugin 改動）。
3. 驗證：`cargo fmt --check`、`cargo test --lib`、`bun run test --run`、`bun run build` PASS。
4. Commit：`chore: bump version to 0.6.27`，只含版本檔 + 本工單回報區。
5. `git push origin main`。
6. `git tag -a v0.6.27 -m v0.6.27 <bump commit>`（沿用 `v0.6.25` / `v0.6.26` annotated 慣例），`git push origin v0.6.27`。
7. 追蹤 `gh run list -R gowerlin/openusage --workflow publish.yml` / `gh run watch -R gowerlin/openusage <id>` 到結束。
8. 驗證 release `v0.6.27`（`-R gowerlin/openusage`）：非 draft、非 prerelease；assets 含 NSIS `*-setup.exe`、`.sig`、`latest.json`；`latest.json` `version` = `0.6.27`，Windows URL 指向 `gowerlin/openusage`。
9. **撰寫發行重點說明**（必做）：`gh release edit v0.6.27 -R gowerlin/openusage --notes-file <檔案>`。
   - 範圍：`git log v0.6.26..v0.6.27` 使用者可感知變更；排除 `_ct-workorders/**` / 塔台 commit。
   - 語言：繁體中文；格式同 fork `v0.6.26`（開頭「本版重點」+ `### Bug Fixes` / `### Chores` 等，空區段省略；commit 連結用 fork URL）。
   - 本版重點必含：**App 內「變更紀錄」改顯示本 fork 的發行說明；「關於」頁的 GitHub 連結、維護者與側邊欄說明（❓）改指向 gowerlin/openusage，並保留原作者 Robin Ebers 署名**（BUG-005 / T0034 / T0035）。
   - 寫入後 `gh release view v0.6.27 -R gowerlin/openusage` 確認，全文貼進回報區。
10. 額外驗證（BUG-005 相關）：`curl -s https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.27` 回傳的 `body` 為步驟 9 寫入的內容（App changelog 即讀這個 endpoint）。

## 明確排除

- 不改任何功能程式碼、不改 `.github/workflows/**`。workflow 失敗 → 回報失敗步驟與 log 摘要。
- 不 commit 塔台私有檔（`_ct-workorders/_*.md`）。

## 驗證 Gate

- PASS：版本四檔一致 `0.6.27`
- PASS：fmt / cargo test / bun test / build
- PASS：Publish run 成功（記錄 run ID）
- PASS：release assets + `latest.json`
- PASS：release body 已寫入，且 GitHub API `releases/tags/v0.6.27` body 一致

## 回報區

（Worker 填寫：狀態、bump commit SHA、tag、Publish run ID / 結果、release URL、assets 清單、發行說明全文、阻塞）

### 落點檢查

- C-0：WARN — frontmatter 無 `repo` 欄位；`basename(REPO_ROOT)` = `openusage`（`D:/ForgejoGit/@GitHub_Clone/openusage`）
- C-1：PASS — 工單位於 REPO_ROOT 下
- C-3：PASS — `package.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/tauri.conf.json` 皆存在
- C-2：N/A（無 `branch` 欄位）；目前 `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 前置條件

- T0034 / T0035 `status: DONE`；`a6c52aa`、`353c412` 在 `main` ✅
- `git status` clean ✅
- `git fetch origin` 後 `origin/main...main` = `0 6`（只 ahead）✅
- `git ls-remote --tags origin v0.6.27` 空 ✅

### 版本 bump

- `package.json` / `src-tauri/Cargo.toml` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.lock`（`cargo update -p openusage --offline`）：`0.6.26` → `0.6.27` ✅
- `README.md`：`git diff v0.6.26..HEAD -- plugins/ README.md` 無變更，plugin 清單免改 ✅

### 驗證

- `cargo fmt --check`：PASS
- `cargo test --lib`（VsDevCmd x64 + `LIBCLANG_PATH`）：PASS — 110 passed; 0 failed
- `bun run test --run`：PASS — 64 files / 1139 tests passed
- `bun run build`：PASS（僅 chunk size >500 kB 既有警告）

