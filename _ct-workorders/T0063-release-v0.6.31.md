---
schema_version: 1
schema_kind: workorder
id: T0063
title: Bump version and publish GitHub release v0.6.31
status: DONE
priority: High
type: release
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T18:48:27+08:00"
started_at: "2026-10-15T18:41:45+08:00"
completed_at: "2026-10-15T18:48:27+08:00"
commit: 4937e11cd97ca5db8ad5fd8aee7ddcc70a3ca6f1
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

DONE — v0.6.31 已發行，驗證 Gate 全 PASS。「Landing check」到「步驟 3」寫於 push 前（2026-10-15T18:42:50+08:00），含在 bump commit 內；「步驟 4」之後寫於 2026-10-15T18:47:55+08:00。

| 項目 | 值 |
|---|---|
| bump commit | `4937e11cd97ca5db8ad5fd8aee7ddcc70a3ca6f1`（`chore: bump version to 0.6.31`，版本四檔 + 本工單） |
| tag | `v0.6.31`（annotated，tag object `328fedd899e2732304de00427bee61fa106b24dc` → `4937e11c`） |
| Publish run | `38722259099` success（job `116379432424`，10:43:17Z–10:47:00Z，3m43s） |
| Release | https://github.com/gowerlin/openusage/releases/tag/v0.6.31 |

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

### 步驟 4：commit / push / tag

- 精準 `git add` 版本四檔 + 本工單 → `git commit` `4937e11c`（塔台並行改動的 `_backlog.md`、`_tower-state.md`、`PLAN-007`、`T0069`–`T0071` 未 stage）。
- Commit message 依工單指定 `chore: bump version to 0.6.31`（同 T0054 先例，未加工單 id）。
- `git push origin main`：`5f03a38d..4937e11c  main -> main`（fast-forward，含塔台 `da726986`、`d284a4ca`）。
- `git tag -a v0.6.31 -m v0.6.31 4937e11c`；`git push origin v0.6.31`：`* [new tag] v0.6.31 -> v0.6.31`。**沒有**用 `--tags` / `--follow-tags` / `--mirror`、沒有 force-push、沒有動既有 tag / release。

### 步驟 5：Publish workflow

- `gh run list -R gowerlin/openusage --workflow publish.yml` → run `38722259099`（`v0.6.31`，push）。
- `gh run watch -R gowerlin/openusage 38722259099 --exit-status` → exit 0；`actions/checkout@v7`、`Set up MSVC developer environment`（T0056 inline step）、`Validate release tag`、`Validate app version matches tag`、`tauri-action`、`Verify updater assets uploaded` 全 ✓。
- **Node 20 annotation：無**。`gh api repos/gowerlin/openusage/check-runs/116379432424/annotations` → 空陣列（0 則；v0.6.30 run 有 Node.js 20 deprecated 警告）；完整 log（1168 行）grep `node.js 20|node20|deprecat` → 0 筆。T0056 升級在正式 publish 生效。

### 步驟 6：release 驗證

| 項目 | 結果 |
|---|---|
| draft / prerelease | `false` / `false`；publishedAt `2026-10-15T10:46:48Z`；target `4937e11c` |
| assets（3） | `OpenUsage_0.6.31_x64-setup.exe`（5449749 bytes）、`.sig`（420）、`latest.json`（1276） |
| `latest.json` | `"version": "0.6.31"`；`windows-x86_64` 與 `windows-x86_64-nsis` 的 `url` = `https://github.com/gowerlin/openusage/releases/download/v0.6.31/OpenUsage_0.6.31_x64-setup.exe`，都有 signature |
| updater endpoint | `releases/latest/download/latest.json` → `"version": "0.6.31"`，URL 同上 |
| Latest | `gh release list -R gowerlin/openusage`：`v0.6.31 Latest`；其餘 `v0.6.31-pre.1`（Pre-release，T0064）、`v0.6.30`、`v0.6.29`、`v0.6.27`、`v0.6.26`、`v0.6.25`、`v0.6.25-pre.1`、`v0.6.24` 不變 |
| fork tag 比對 | `git ls-remote --tags origin` push 前後 `diff`：只多 `refs/tags/v0.6.31`、`refs/tags/v0.6.31^{}`（`v0.6.31-pre.1` 在本單開工前已存在，由 T0064 建立） |

### 步驟 7：發行說明

- 開工前 release body 為空（tauri-action 預設）。`gh release edit v0.6.31 -R gowerlin/openusage --notes-file <scratchpad>/release-notes-v0.6.31.md`。
- `gh release view --json body` == 檔案（`true`）；`https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.31` body == 檔案（`true`，3624 字元，正規化 CRLF），`draft=false`、`prerelease=false`。
- 上游引用：版本取自 `git show upstream/main:CHANGELOG.md`（未 checkout / merge `upstream/main`）：#1364 = v0.7.15-beta.1；`d94b5fbb` / `5fcb4312` / #843 / #844 = v0.7.3；#1272 / #1290 = v0.7.13；#1367 = v0.7.15-beta.1；#814 / #807 = v0.7.1；#1141 / #1108 = v0.7.10；#1097 = v0.7.9。

發行說明全文：

```markdown
本版重點：修正 v0.6.30 的已知問題（拖曳後面板超出螢幕），並從上游 v0.7.x 移植 Codex / Grok / Claude / OpenCode Go / Copilot 的 provider 更新（PLAN-006）。

### Windows 修正
- 把面板拖到螢幕偏下的位置後，放開滑鼠就會重新計算高度，面板不再超出工作區；拖曳中不改尺寸（BUG-016 / T0055、T0067，[5ec8935](https://github.com/gowerlin/openusage/commit/5ec8935bd7cbb050237280ce54662c4102d51bfd)、[4331f8d](https://github.com/gowerlin/openusage/commit/4331f8de82faed966fd9ab577592818d2596948c)）
- `panel-window-trace.log` 啟動紀錄的路徑改為遮蔽形式，不再出現 Windows 使用者名稱（BUG-018 / T0067，[4331f8d](https://github.com/gowerlin/openusage/commit/4331f8de82faed966fd9ab577592818d2596948c)）

### Provider 更新（移植自上游 v0.7.x）
- **Codex**：用量儀表板連結改為 `chatgpt.com/settings/usage`（T0057，[dd69e50](https://github.com/gowerlin/openusage/commit/dd69e5012f8e5ad3d419113cca20b5dfb08feb7d)；上游 v0.7.15-beta.1 [#1364](https://github.com/robinebers/openusage/pull/1364)）
- **Grok**：新增每週共用額度（Weekly），首頁也會顯示；改用 credits 端點為主，已轉 unified billing 的帳號不再整個失敗；Pay as you go 上限取自 credits（T0058、T0065，[81c3721](https://github.com/gowerlin/openusage/commit/81c37218b4a3fa344d5caddfe076f6ae0d48ca32)、[1f2a281](https://github.com/gowerlin/openusage/commit/1f2a28121d714207a765682593a6ae68077037b1)；上游 v0.7.3 [d94b5fb](https://github.com/robinebers/openusage/commit/d94b5fbb1b7bb8e6ccb34821ede33166c5931bc3)、[5fcb431](https://github.com/robinebers/openusage/commit/5fcb431225e62cb8db365b04fd63aa027507c146)，v0.7.13 [#1272](https://github.com/robinebers/openusage/pull/1272)）
- **Claude**：新增 Fable 模型每週限額（顯示在 Weekly 下方）與 Rate Limit Resets（可用的重置次數與最近期限，每小時檢查一次）（T0059、T0066，[7da18a1](https://github.com/gowerlin/openusage/commit/7da18a17d01ef4c6f524b9963392c46dc36440a5)、[d50245c](https://github.com/gowerlin/openusage/commit/d50245c351a9d277396f225a7c370f23bebaab7a)；上游 v0.7.1 [#814](https://github.com/robinebers/openusage/pull/814)、v0.7.10 [#1141](https://github.com/robinebers/openusage/pull/1141)、v0.7.13 [#1290](https://github.com/robinebers/openusage/pull/1290)、v0.7.15-beta.1 [#1367](https://github.com/robinebers/openusage/pull/1367)）
- **OpenCode Go**：改用官方 usage API 顯示 Session / Weekly / Monthly（T0060，[da2e4a1](https://github.com/gowerlin/openusage/commit/da2e4a10d5cc92c6e71cdc64684067078bedbddb)；上游 v0.7.9 [#1097](https://github.com/robinebers/openusage/pull/1097)）
- **Copilot**：改為 AI Credits + Extra Usage 計費；組織管理員可看到組織層級 credits / 花費；org 管理的席位也顯示個人 credits（T0061，[fcf0738](https://github.com/gowerlin/openusage/commit/fcf073891d146f6fb6c76b4029efdd695bd0717c)；上游 v0.7.1 [#807](https://github.com/robinebers/openusage/pull/807)、v0.7.3 [#843](https://github.com/robinebers/openusage/pull/843) / [#844](https://github.com/robinebers/openusage/pull/844)、v0.7.10 [#1108](https://github.com/robinebers/openusage/pull/1108)）

### 文件 / CI
- README 支援清單補上 Perplexity、Synthetic，並更新 Claude / Copilot / Grok / OpenCode Go 的說明（T0056、T0060、T0066，[b3788b0](https://github.com/gowerlin/openusage/commit/b3788b087f6020c440ba5622f7812895593d8925)、[da2e4a1](https://github.com/gowerlin/openusage/commit/da2e4a10d5cc92c6e71cdc64684067078bedbddb)、[d50245c](https://github.com/gowerlin/openusage/commit/d50245c351a9d277396f225a7c370f23bebaab7a)）
- 發行 / 預發行 workflow 改用 Node 24 版本的 action（`actions/checkout@v7`、內建 MSVC 環境設定），不再出現 Node.js 20 deprecated 警告（T0056、T0064，[b3788b0](https://github.com/gowerlin/openusage/commit/b3788b087f6020c440ba5622f7812895593d8925)、[5f03a38](https://github.com/gowerlin/openusage/commit/5f03a38dae1c9a06f4b9b5dd8f29a987fa0c9b51)）

### 已知問題
- Windows 上 Copilot 讀不到 `gh auth login` 存的 token（gh 存在 Windows 認證管理員），會顯示「Not logged in」；之後版本處理（BUG-017）

**Full Changelog**: [v0.6.30...v0.6.31](https://github.com/gowerlin/openusage/compare/v0.6.30...v0.6.31)
```

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| Publish run 成功且無 Node 20 annotation | PASS | run `38722259099` success；check-run annotations 0 則；log 無 Node 20 / deprecated |
| release / assets / `latest.json` / Latest | PASS | 非 draft / 非 pre；3 assets；version `0.6.31`、URL 指向 fork；`v0.6.31 Latest` |
| fork 無非預期 tag | PASS | tag diff 只多 `v0.6.31` |
| release body = API body | PASS | gh 與 API body 都等於發行說明檔 |

### 偏離 / 阻塞 / 後續

- 阻塞：無。偏離：無（commit message 依工單指定，未加工單 id）。
- 沒有停使用者的 OpenUsage、沒有執行 installer、沒有改 registry、沒有碰剪貼簿、沒有控制滑鼠、沒有新截圖。
- 收尾 commit（本段 + metadata）只在本機，**沒有 push**（塔台處理）。
- 觀察：publish job 3m43s（v0.6.30 約 11 分鐘），`swatinem/rust-cache` 命中（log：`Cache hit for: v0-rust-publish-Windows_NT-x64-63f58d45-6d7365c4`）。
- 後續（已登錄）：BUG-017（Windows Copilot gh token，D102）。
