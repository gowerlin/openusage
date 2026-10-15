---
schema_version: 1
schema_kind: workorder
id: T0054
title: Bump version and publish GitHub release v0.6.30
status: DONE
priority: Medium
type: release
bug_id: null
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T16:23:03+08:00"
started_at: "2026-10-15T16:09:06+08:00"
completed_at: "2026-10-15T16:23:03+08:00"
commit: 49754c2f4c598ace9cd9be900722d1cb09d1abae
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

DONE — v0.6.30 已發行，驗證 Gate 全 PASS。「Landing check」到「步驟 3」寫於 push 前（2026-10-15T16:10:09+08:00），含在 bump commit 內；「步驟 4」之後寫於 2026-10-15T16:22:39+08:00。

| 項目 | 值 |
|---|---|
| bump commit | `49754c2f4c598ace9cd9be900722d1cb09d1abae`（`chore: bump version to 0.6.30`，版本四檔 + 本工單） |
| tag | `v0.6.30`（annotated，tag object `17daa4a05daae834068de26604688ac5e2146191` → `49754c2f`） |
| Publish run | `38703798990` success（job `116318093480`，08:10:36Z–08:22:00Z） |
| Release | https://github.com/gowerlin/openusage/releases/tag/v0.6.30 |

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

### 步驟 4–5：commit / push / tag

- `git add` 版本四檔 + 本工單 → `git commit` `49754c2f`（工作區無其他改動）。
- `git push origin main`：`e9ad43c4..49754c2f  main -> main`（fast-forward）。
- `git tag -a v0.6.30 -m v0.6.30 49754c2f`；`git push origin v0.6.30`：`* [new tag] v0.6.30 -> v0.6.30`。**沒有**用 `--tags` / `--follow-tags` / `--mirror`、沒有 force-push、沒有動既有 tag / release。

### 步驟 6：Publish workflow 與 release 驗證

- `gh run list -R gowerlin/openusage --workflow publish.yml` → run `38703798990`（`v0.6.30`，push）。
- `gh run watch -R gowerlin/openusage 38703798990 --exit-status` → exit 0；`Validate release tag`、`Validate app version matches tag`、`tauri-action`、`Verify updater assets uploaded` 全 ✓。
- Annotation（只是警告，同 v0.6.29）：Node.js 20 deprecated（`actions/checkout@v4`、`ilammy/msvc-dev-cmd@v1`）。

| 項目 | 結果 |
|---|---|
| draft / prerelease | `false` / `false`；publishedAt `2026-10-15T08:20:58Z` |
| assets（3） | `OpenUsage_0.6.30_x64-setup.exe`（5436829 bytes）、`.sig`（420）、`latest.json`（1276） |
| `latest.json` | `"version": "0.6.30"`；`windows-x86_64` 與 `windows-x86_64-nsis` 的 `url` = `https://github.com/gowerlin/openusage/releases/download/v0.6.30/OpenUsage_0.6.30_x64-setup.exe`，都有 signature |
| updater endpoint | `releases/latest/download/latest.json` → `"version": "0.6.30"` |
| Latest | `gh release list -R gowerlin/openusage`：`v0.6.30 Latest`；其餘 `v0.6.29`、`v0.6.27`、`v0.6.26`、`v0.6.25`、`v0.6.25-pre.1`、`v0.6.24` 不變 |
| fork tag 比對 | `git ls-remote --tags origin` push 前後 `diff`：只多 `refs/tags/v0.6.30`、`refs/tags/v0.6.30^{}` |

### 步驟 7：發行說明

- `gh release edit v0.6.30 -R gowerlin/openusage --notes-file <scratchpad>/release-notes-v0.6.30.md`。
- `gh release view --json body` == 檔案（`true`）；`https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.30` body == 檔案（`true`，753 字元，正規化 CRLF），`draft=false`、`prerelease=false`。

發行說明全文：

```markdown
本版重點：修正 v0.6.29 的已知問題 —— Windows 面板失焦收起更穩、詳細頁數值完整顯示、面板不再超出工作區（PLAN-005）。

### Windows 修正
- 面板失焦後偶爾沒有收起：只收到 `WM_NCACTIVATE` 的失焦也會收起（BUG-013 / T0052，[585a34d](https://github.com/gowerlin/openusage/commit/585a34d1348848d50f36336f5149fe0a723f9dfe)）
- 面板高度限制在 Windows 工作區內（內容可捲動），不再被工作列遮住；進設定頁後不會改寫記住的面板位置（BUG-015 / T0051，[6b1ed40](https://github.com/gowerlin/openusage/commit/6b1ed40b8927f1a6a5ce13c276ca7094a8f1ce28)）

### 修正
- 詳細頁較長的文字數值（例如「$213.36 · 597M tokens」）完整顯示，不再被截斷（BUG-014 / T0050，[439a9d8](https://github.com/gowerlin/openusage/commit/439a9d8195a124d722a03407e44778fba8a231a6)）

### 已知問題
- 把面板拖到螢幕偏下的位置後，面板下緣可能暫時超出螢幕；下次顯示面板時會自動修正（BUG-016）

**Full Changelog**: [v0.6.29...v0.6.30](https://github.com/gowerlin/openusage/compare/v0.6.29...v0.6.30)
```

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| Publish run 成功 | PASS | run `38703798990` success |
| release / assets / `latest.json` / Latest | PASS | 非 draft / 非 pre；3 assets；version `0.6.30`、URL 指向 fork；`v0.6.30 Latest` |
| fork 無非預期 tag | PASS | tag diff 只多 `v0.6.30` |
| release body = API body | PASS | gh 與 API body 都等於發行說明檔 |

### 偏離 / 阻塞 / 後續

- 阻塞：無。偏離：無。
- 沒有停使用者的 OpenUsage、沒有執行 installer、沒有改 registry、沒有碰剪貼簿、沒有新截圖。
- 收尾 commit（本段 + metadata）只在本機，**沒有 push**（塔台處理）。
- 後續建議（沿用 T0041，未處理）：README 補 `Perplexity`、`Synthetic`；`publish.yml` Node.js 20 deprecation 警告。
