---
schema_version: 1
schema_kind: workorder
id: T0033
title: Bump version and publish GitHub release v0.6.26
status: IN_PROGRESS
priority: Medium
type: release
bug_id: BUG-004
plan_id: null
created_at: "2026-10-15T10:55:01+08:00"
updated_at: "2026-10-15T10:57:24+08:00"
started_at: "2026-10-15T10:57:24+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0032
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0033 Bump Version And Publish GitHub Release v0.6.26

## 背景

使用者要求 T0032（BUG-004 single-instance）完成後改版號並發行 GitHub Release。前次 release 經驗（D054）：tag 必須帶 `v` 前綴，且 tag 指向的 commit 版本檔必須已與 tag 一致，否則 `publish.yml` 的 `Validate app version matches tag` 會失敗。

## 授權範圍（使用者 2026-10-15 明確授權）

- ✅ commit 版本 bump 到 `main`
- ✅ `git push origin main`
- ✅ 建立並 push 新 tag `v0.6.26`
- ❌ 不得 force-push、不得移動 / 刪除任何既有 tag、不得刪除 release。遇到需要這些操作的情況 → 回報 BLOCKED，由塔台決策。

## 前置條件（Worker 開工先檢查，不符即 BLOCKED）

- T0032 frontmatter `status: DONE` 且 commit 已在本地 `main`。
- `git status` 中除了塔台私有檔（`_ct-workorders/_*.md`）外無其他未 commit 的 product 改動；有則回報，不要自行處理。
- `git fetch origin` 後 `main` 與 `origin/main` 無分歧（只能 ahead，不可 behind / diverged）。
- 遠端尚無 `v0.6.26` tag：`git ls-remote --tags origin v0.6.26` 為空。

## 任務指令

1. 版本 `0.6.25` → `0.6.26`，四個檔案同步：`package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.lock`（`openusage` package entry；用 `cargo` 更新而非手改，例如 `cargo update -p <crate名> --offline` 或跑一次 `cargo check`）。
2. 確認 `README.md` 支援 plugin 清單無需變更（本次無 plugin 改動；AGENTS.md push 前檢查要求）。
3. 驗證：`cargo fmt --check`、`cargo test --lib`、`bun run build` PASS。
4. Commit：`chore: bump version to 0.6.26`，只含版本檔 + 本工單回報區。
5. `git push origin main`。
6. `git tag v0.6.26 <bump commit>`（annotated 或 lightweight 依前次 `v0.6.25` 慣例），`git push origin v0.6.26`。
7. 追蹤 GitHub Actions `Publish` run（`gh run list --workflow publish.yml` / `gh run watch`）到結束。
8. 驗證 release `v0.6.26`：非 draft、非 prerelease；assets 含 NSIS `*-setup.exe`、`.sig`、`latest.json`；`latest.json` 的 `version` 為 `0.6.26`，Windows platform URL 指向 `gowerlin/openusage`。
9. **撰寫發行重點說明**（使用者要求，必做）：Publish run 成功後，用 `gh release edit v0.6.26 --notes-file <檔案>` 寫入 release body（`publish.yml` 未設 `releaseBody`，不得改 workflow 來處理）。
   - 範圍：`git log v0.6.25..v0.6.26` 的所有使用者可感知變更；排除 `_ct-workorders/**`、純 timestamp / 塔台狀態 commit。
   - 語言：繁體中文；區段標題沿用 `v0.6.25` 格式（`### New Features` / `### Bug Fixes` / `### Refactor` / `### Chores`，空區段省略）。
   - 開頭 1–2 句「本版重點」摘要。本版重點必含：**OpenUsage 不再允許同時執行多個執行個體；再次啟動會直接叫出既有面板**（BUG-004 / T0032）。
   - 每條一行、寫使用者看得懂的行為描述，不寫內部工單號以外的實作細節；可附 commit 短 SHA。
   - 寫入後 `gh release view v0.6.26` 確認 body 正確顯示，並把最終 notes 全文貼進回報區。

## 明確排除

- 不改任何功能程式碼。
- 不改 `.github/workflows/**`。若 workflow 失敗，回報失敗步驟與 log 摘要，不自行修 workflow。
- 不 commit 塔台私有檔（`_ct-workorders/_tower-state.md` 等）。

## 驗證 Gate

- PASS：版本四檔一致為 `0.6.26`
- PASS：fmt / test / build
- PASS：Publish run 成功（記錄 run ID）
- PASS：release assets + `latest.json` 驗證
- PASS：release body 已寫入發行重點說明（`gh release view` 確認）

## 回報區

### 落點檢查

- 結果：WARN（C-0 不可用）
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage` → WARN「repo identity unavailable」
- C-1：PASS（工單位於 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/`）
- C-3：PASS（4/4 `affects_files` 存在）
- C-2：工單無 `branch` 欄位，不適用；HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 前置條件

- PASS：T0032 `status: DONE`，commit `2717631` 在本地 `main`
- PASS：`git status` 只有 `_ct-workorders/_tower-state.md`（塔台私有檔）
- PASS：`git fetch origin` 後 `main...origin/main` = ahead 3 / behind 0
- PASS：`git ls-remote --tags origin v0.6.26` 為空

### 版本 bump

- `package.json` / `src-tauri/Cargo.toml` / `src-tauri/tauri.conf.json`：`0.6.25` → `0.6.26`
- `src-tauri/Cargo.lock`：`cargo update -p openusage --offline`（`openusage v0.6.25 -> v0.6.26`）
- README：`git diff v0.6.25..HEAD` 無 `plugins/`、`README.md`、`plugin_engine` 改動 → 不需更新

### 驗證

- PASS：`cargo fmt --check`
- PASS：`cargo test --lib`：110 passed, 0 failed（VsDevCmd x64 + `LIBCLANG_PATH=...\VC\Tools\Llvmdin`；未設時 `rquickjs-sys` build 報 `Unable to find libclang`）
- PASS：`bun run build`（僅 chunk > 500 kB 既有警告）

### Release

（待 push / tag / Publish 後補）

