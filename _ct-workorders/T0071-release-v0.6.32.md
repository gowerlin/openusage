---
schema_version: 1
schema_kind: workorder
id: T0071
title: Bump version and publish GitHub release v0.6.32
status: DONE
priority: High
type: release
plan_id: PLAN-007
bug_id: null
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T19:51:25+08:00"
started_at: "2026-10-15T19:43:49+08:00"
completed_at: "2026-10-15T19:51:25+08:00"
commit: ef9da8e24720d68fe63c793698c2c588c1743044
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

DONE — v0.6.32 已發行，驗證 Gate 全 PASS。「Landing check」到「步驟 3」寫於 push 前（2026-10-15T19:45:16+08:00），含在 bump commit 內；「步驟 4」之後寫於 2026-10-15T19:50:59+08:00。

| 項目 | 值 |
|---|---|
| bump commit | `ef9da8e24720d68fe63c793698c2c588c1743044`（`chore: bump version to 0.6.32`，版本四檔 + 本工單） |
| tag | `v0.6.32`（annotated，tag object `90f990159906302ddc4080367e074a8432e6c4d8` → `ef9da8e2`） |
| Publish run | `38729631935` success（job `116403919805`，11:45:42Z–11:49:36Z，3m54s） |
| Release | https://github.com/gowerlin/openusage/releases/tag/v0.6.32 |

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

### 步驟 4：commit / push / tag

- 精準 `git add` 版本四檔 + 本工單 → `git commit` `ef9da8e2`（開工後工作區沒有其他改動）。
- Commit message 依 T0063 步驟 4 格式 `chore: bump version to 0.6.32`（同 T0054 / T0063 先例，未加工單 id）。
- `git push origin main`：`4937e11c..ef9da8e2  main -> main`（fast-forward，含 T0069 / T0072 / T0070 與塔台 commit 共 11 個）。
- `git tag -a v0.6.32 -m v0.6.32 ef9da8e2`；`git push origin v0.6.32`：`* [new tag] v0.6.32 -> v0.6.32`。**沒有**用 `--tags` / `--follow-tags` / `--mirror`、沒有 force-push、沒有動既有 tag / release。

### 步驟 5：Publish workflow

- `gh run list -R gowerlin/openusage --workflow publish.yml` → run `38729631935`（`v0.6.32`，push）。
- `gh run watch -R gowerlin/openusage 38729631935 --exit-status` → exit 0；`actions/checkout@v7`、`Set up MSVC developer environment`、`Validate release tag`、`Validate app version matches tag`、`tauri-apps/tauri-action@v0.6.2`、`Verify updater assets uploaded` 全 ✓。
- **Node 20 annotation：無**。`gh api repos/gowerlin/openusage/check-runs/116403919805/annotations` → `[]`；完整 log（1168 行）grep `node.js 20|node20|deprecat` → 0 筆。
- `swatinem/rust-cache` 命中（`Cache hit for: v0-rust-publish-Windows_NT-x64-63f58d45-6d7365…`）。

### 步驟 6：release 驗證

| 項目 | 結果 |
|---|---|
| draft / prerelease | `false` / `false`；publishedAt `2026-10-15T11:49:22Z`；target `ef9da8e2` |
| assets（3） | `OpenUsage_0.6.32_x64-setup.exe`（5472618 bytes）、`.sig`（420）、`latest.json`（1276） |
| `latest.json` | `"version": "0.6.32"`；`windows-x86_64` 與 `windows-x86_64-nsis` 的 `url` = `https://github.com/gowerlin/openusage/releases/download/v0.6.32/OpenUsage_0.6.32_x64-setup.exe`，都有 signature |
| updater endpoint | `releases/latest/download/latest.json` → `"version": "0.6.32"`，URL 同上 |
| Latest | `gh release list -R gowerlin/openusage`：`v0.6.32 Latest`；`v0.6.31`、`v0.6.31-pre.1`（Pre-release）、`v0.6.30`、`v0.6.29`、`v0.6.27`、`v0.6.26`、`v0.6.25`、`v0.6.25-pre.1`、`v0.6.24` 不變 |
| fork tag 比對 | `git ls-remote --tags origin` push 前（16 行）後 `diff`：只多 `refs/tags/v0.6.32`（`90f99015`）、`refs/tags/v0.6.32^{}`（`ef9da8e2`） |

### 步驟 7：發行說明

- 開工前 release body 為空（tauri-action 預設）。`gh release edit v0.6.32 -R gowerlin/openusage --notes-file <scratchpad>/release-notes-v0.6.32.md`。
- `gh release view --json body` == 檔案（`true`）；`https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.32` body == 檔案（`true`，1232 字元，正規化 CRLF），`draft=false`、`prerelease=false`；edit 後仍為 Latest。
- 內容依據：T0069 回報（按鈕在 ❓ 上方、已安裝版優先 / `npx --yes token-usage-insights@latest`、執行中小圓點、Quit 只結束自己啟動的、無 npx 提示）、T0070 實機（無 console、無工作列按鈕）、BUG-019 / T0072。

發行說明全文：

```markdown
本版重點：側邊欄新增「Token 戰情室」按鈕，一鍵開啟 [TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights) 看板（PLAN-007）。

### 新功能
- **Token 戰情室**：側邊欄說明（❓）上方新增按鈕，按下後在背景啟動 [TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights)（MIT，作者 doggy8088）並用預設瀏覽器開啟 `http://localhost:3003` 看板；不會跳出 console 視窗，也不會多出工作列按鈕（T0069，[2de48d7](https://github.com/gowerlin/openusage/commit/2de48d7bb64290415f73330fd54bac4410b4b948)）
  - 優先使用已安裝的 `token-usage-insights` 指令（保留它自己的自動更新），否則用 `npx --yes token-usage-insights@latest`，需要 Node.js 18.18 以上
  - 看板執行中時按鈕會有小圓點；再按一次只開瀏覽器，不重複啟動
  - 關閉 OpenUsage（含 tray 選單 Quit）時自動結束由 OpenUsage 啟動的看板；若看板是你自己先開的，OpenUsage 不會關它
  - 找不到 Node.js / npx 時，面板會顯示提示與「安裝說明」連結

### Windows 修正
- Tray 圖示按右鍵只開選單，不再同時開關面板、蓋住選單；左鍵行為不變（BUG-019 / T0072，[dcf6585](https://github.com/gowerlin/openusage/commit/dcf6585f0a512db93f6e9a8e1691cc5b9d37c347)）

### 文件
- README「What It Does」新增 Token Dashboard 說明（T0069，[2de48d7](https://github.com/gowerlin/openusage/commit/2de48d7bb64290415f73330fd54bac4410b4b948)）

### 已知問題
- Windows 上 Copilot 讀不到 `gh auth login` 存的 token（gh 存在 Windows 認證管理員），會顯示「Not logged in」；之後版本處理（BUG-017）

**Full Changelog**: [v0.6.31...v0.6.32](https://github.com/gowerlin/openusage/compare/v0.6.31...v0.6.32)
```

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| Publish run 成功且無 Node 20 annotation | PASS | run `38729631935` success；check-run annotations 0 則；log 無 Node 20 / deprecated |
| release / assets / `latest.json` 0.6.32 / Latest | PASS | 非 draft / 非 pre；3 assets；version `0.6.32`、URL 指向 fork；`v0.6.32 Latest` |
| fork 無非預期 tag | PASS | tag diff 只多 `v0.6.32` |
| release body = API body | PASS | gh 與 API body 都等於發行說明檔 |

### 偏離 / 阻塞 / 後續

- 阻塞：無。偏離：無（commit message 依 T0063 指定格式，未加工單 id）。
- 沒有停使用者的 OpenUsage、沒有執行 installer、沒有改 registry、沒有碰剪貼簿、沒有控制滑鼠、沒有新截圖。
- 收尾 commit（本段 + metadata）只在本機，**沒有 push**（塔台處理）。
- 後續（已登錄）：BUG-017（Windows Copilot gh token）；BUG-019 狀態仍為 `FIXED`，已隨 v0.6.32 發行，是否轉 CLOSED 由塔台決定。
