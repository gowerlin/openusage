---
schema_version: 1
schema_kind: workorder
id: T0064
title: Validate Node 24 CI changes via a GitHub pre-release (v0.6.31-pre.1)
status: DONE
priority: High
type: verification
plan_id: PLAN-006
bug_id: null
created_at: "2026-10-15T16:47:34+08:00"
updated_at: "2026-10-15T18:35:44+08:00"
started_at: "2026-10-15T18:23:04+08:00"
completed_at: "2026-10-15T18:35:44+08:00"
commit: 5f03a38d
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
  - T0068
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

- T0055–T0061、T0065–T0067 `DONE`；T0062 PARTIAL 已由 T0067 修正、**T0068 `DONE`**（D105）。`git status` 乾淨；main 只 ahead。
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

### 結果：DONE

- 開始：2026-10-15T18:23:04+08:00；完成：2026-10-15T18:35:44+08:00
- Commit：`5f03a38d` `ci: update pre-release workflow for Node 24 (T0064)`（已 push `origin main`，`49754c2f..5f03a38d`）
- Run：`38719945226`（https://github.com/gowerlin/openusage/actions/runs/38719945226），`success`，10:23:39Z → 10:34:58Z UTC；publish job 11m6s

### 落點檢查：WARN

- C-0：frontmatter `repo` = absent → WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`
- C-1：PASS（work order 在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下）
- C-3：PASS（`.github/workflows/pre-release.yml` 存在）
- C-2：無 `branch` 欄位；HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）；`CT_MODE=yolo`

### 前置條件：PASS

- T0055–T0061、T0065–T0068 `DONE`；T0062 `PARTIAL`（已由 T0067 修正，依工單說明）
- `git status` 乾淨；main 對 origin/main = ahead 40 / behind 0
- `git ls-remote --tags origin v0.6.31-pre.1` 觸發前為空
- `pre-release.yml` 審閱：版本格式 `^[0-9]+\.[0-9]+\.[0-9]+-pre\.[0-9]+$`；workflow 在 runner 內 `Sync pre-release version` 改寫 `package.json` / `tauri.conf.json` / `Cargo.toml` 再比對 tag → **不需**本機版本檔一致（本機仍 0.6.30，未改）；`latest.json` 只上傳到 pre-release 本身（`prerelease: true`），不影響 `releases/latest`

### 變更檔案

- `.github/workflows/pre-release.yml`：`actions/checkout@v4` → `@v7`（2 處）；`ilammy/msvc-dev-cmd@v1` → 從 `publish.yml` 逐字複製的 `Set up MSVC developer environment` inline pwsh step（含註解）。其他不動。

### 驗證

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| source | actionlint | PASS | `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.7 -shellcheck= -pyflakes= pre-release.yml publish.yml` exit 0（PATH 無 actionlint，沿用 T0056 方式） |
| CI | run 結論 | PASS | prepare + publish 全部 step `success` |
| CI | inline MSVC step | PASS | log：`VsDevCmd.bat ... -arch=x64 -host_arch=x64 -no_logo && set`；`Using MSVC from C:\Program Files\Microsoft Visual Studio\18\Enterprise`；後續 step env 出現匯出的 `INCLUDE` / `LIB` / `Path` / `VCToolsInstallDir`（MSVC `14.51.36231`） |
| CI | Tauri build | PASS | `Finished 1 bundle`：`OpenUsage_0.6.31-pre.1_x64-setup.exe` + `.sig`；`Verify updater assets uploaded` success |
| CI | Node 20 deprecated annotation | PASS（無） | 兩個 job 的 check-run annotations 只有 1 則 notice：`The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026`（prepare job，與 Node 20 無關）；log grep `node.js 20\|node20\|deprecat` 只命中 crate `proc-macro-hack v0.5.20+deprecated` |
| release | `v0.6.31-pre.1` | PASS | `isPrerelease=true`、`isDraft=false`、target `5f03a38d`；assets：`latest.json`(1322)、`OpenUsage_0.6.31-pre.1_x64-setup.exe`(5449797)、`.exe.sig`(428) |
| release | Latest 不變 | PASS | `gh release list`：`v0.6.30 Latest`、`v0.6.31-pre.1 Pre-release` |
| release | 正式 updater | PASS | `releases/latest/download/latest.json` → `"version": "0.6.30"`（觸發前後相同） |
| tags | fork tag 比對 | PASS | 觸發前後 `git ls-remote --tags origin` diff 只多一行 `5f03a38d… refs/tags/v0.6.31-pre.1` |

### 偏差 / 後續

- 無偏差。未推其他 tag、未 force-push、未改 `publish.yml`、未執行 installer。
- 觀察：runner VS 為 `Visual Studio\18\Enterprise`（非 2022）；inline step 經 vswhere 解析正常。`Configure Windows build environment` 用 `C:\Program Files\LLVM\bin`（候選清單第一項），未受影響。
- 提醒塔台：`ubuntu-latest` 10/19 起遷移 Ubuntu 26（notice，非本單範圍）。
- 收尾 commit 只在本機，未 push。
