---
schema_version: 1
schema_kind: workorder
id: T0056
title: README missing plugins and publish workflow Node 20 deprecation
status: DONE
priority: Low
type: chore
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:41:57+08:00"
started_at: "2026-10-15T16:38:50+08:00"
completed_at: "2026-10-15T16:41:57+08:00"
commit: b3788b08
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0055
affects_files:
  - README.md
  - .github/workflows/publish.yml
---

# T0056 README missing plugins and publish workflow Node 20 deprecation

## 背景

- README 支援清單缺 `perplexity`、`synthetic`（兩者在 `bundled_plugins`；T0041 / T0054 觀察，既有缺口）。
- `publish.yml` 執行時有 annotation：Node.js 20 deprecated（`actions/checkout@v4`、`ilammy/msvc-dev-cmd@v1` 被強制改用 Node 24）。

## 任務指令

1. README：比照既有行格式加 Perplexity、Synthetic。先讀 `plugins/perplexity/plugin.js`、`plugins/synthetic/plugin.js` 確認 Windows 行為（T0004 曾把 Perplexity 標 Windows explicit unsupported）——README 要如實註明。
2. `publish.yml`：查官方 release notes，把 `actions/checkout` 升到支援 Node 24 的版本；`ilammy/msvc-dev-cmd` 若有 Node 24 版本則升級，沒有則評估改用 `vswhere` + `VsDevCmd` 腳本或保留並回報。其他 action（`oven-sh/setup-bun@v2`、`swatinem/rust-cache@v2`、`dtolnay/rust-toolchain`、`tauri-apps/tauri-action@v0.6.2`）一併檢查是否有同樣警告；**不改** tauri-action 版本（T0009 曾因版本問題失敗）。回報引用 release notes URL。
3. 不改 workflow 的觸發條件、矩陣、signing、updater 設定。

## 驗證 Gate

- PASS：`bun run build`（README 無影響可略）
- PASS：workflow YAML 語法（`actionlint` 若可用；否則以 `gh workflow view -R gowerlin/openusage publish.yml` / 人工比對）
- 實際 CI 驗證交給 T0063 發行（Publish run 無 Node 20 annotation）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`chore: list perplexity/synthetic in README, update actions for Node 24 (T0056)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

- 狀態：DONE
- Commit：見 frontmatter `commit`（只含 `README.md`、`.github/workflows/publish.yml`、本工單）。不 push、不 tag、不發行。

### 落點檢查

- 結果：WARN
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage` → WARN「repo identity unavailable」，改用 C-3 + C-1。
- C-1：工單在 `REPO_ROOT`（`D:/ForgejoGit/@GitHub_Clone/openusage`）下 → PASS。
- C-3：`README.md`、`.github/workflows/publish.yml` 皆存在 → PASS。
- C-2：無 `branch` 欄位，略過（實際 `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。

### 改動

1. `README.md`：在 OpenCode Go 後加 2 行（照字母序；既有 Devin 行位置不動）：
   - Perplexity：`API credits, queries, Deep Research, Labs, Agentic Research (macOS app only; not supported on Windows)`。依據：`plugins/perplexity/plugin.js:6-7,395-396` 在 `ctx.app.platform === "windows"` 時 throw `WINDOWS_UNSUPPORTED`；token 來源只有 macOS `~/Library/...Cache.db`。
   - Synthetic：`5h rate limit, mana bar, subscription, free tool calls, search`（對應 `plugin.json` lines）。`plugin.js` 無平台分支；key 來源為 `~/.pi/agent/*.json`、`~/.factory/settings.json`、`~/.local/share/opencode/auth.json`、`SYNTHETIC_API_KEY`，不標 Windows 限制。**未在 Windows 實機驗證 Synthetic 取值**（無 key）。
2. `.github/workflows/publish.yml`：
   - `actions/checkout@v4` → `@v7`（v4 `action.yml` = `node20`；v5/v6/v7 = `node24`）。本 workflow 只在 tag push 觸發、只用 `ref` 輸入，v6 憑證另存檔、v7 擋 fork PR（`pull_request_target`/`workflow_run`）皆不影響。
   - `ilammy/msvc-dev-cmd@v1` → inline pwsh step「Set up MSVC developer environment」：`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64` 找 VS，跑 `VsDevCmd.bat -arch=x64 -host_arch=x64`，把與原 env 不同的變數寫進 `GITHUB_ENV`（與 msvc-dev-cmd 做法相同）。原因：最新 v1.13.0（2024-01-01）及 `master` 的 `action.yml` 仍 `node20`；Node 24 升級 issue #99 / PR #94 仍 open。
   - 其他 action 檢查（`action.yml` `runs.using`）：`oven-sh/setup-bun@v2` = `node24`、`swatinem/rust-cache@v2` = `node24`、`dtolnay/rust-toolchain@stable` = `composite`、`tauri-apps/tauri-action@v0.6.2` = `node24` → 皆無 Node 20 警告，不改（tauri-action 依規定不動）。
   - 觸發條件、矩陣、signing、updater 設定未改。

### 上游引用

- https://github.com/actions/checkout/releases/tag/v5.0.0 （Update to node 24；runner ≥ v2.327.1）
- https://github.com/actions/checkout/releases/tag/v6.0.0 （Persist creds to a separate file）
- https://github.com/actions/checkout/releases/tag/v7.0.0 （block fork PR for pull_request_target / workflow_run；ESM）
- https://github.com/actions/checkout/releases/tag/v7.0.1 （最新）
- https://github.com/ilammy/msvc-dev-cmd/releases/tag/v1.13.0 （最新，node20）
- https://github.com/ilammy/msvc-dev-cmd/issues/99 、https://github.com/ilammy/msvc-dev-cmd/pull/94 （Node 24，open）
- https://github.com/oven-sh/setup-bun/releases/tag/v2.2.0 、https://github.com/Swatinem/rust-cache/releases/tag/v2.9.2 、https://github.com/tauri-apps/tauri-action/releases/tag/action-v0.6.2

### 驗證證據

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| source | workflow YAML 語法 | PASS | `actionlint v1.7.7`（`go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.7 -shellcheck= -pyflakes=`）exit 0；`Bun.YAML.parse` 步驟順序正確，`on` = `{"push":{"tags":["v*"]}}` |
| source | MSVC step 本機模擬 | PASS | 抽出 step 腳本以假 `GITHUB_ENV` 執行：exit 0，找到 `C:\Program Files\Microsoft Visual Studio\18\Enterprise`，匯出 47 個變數，含 `INCLUDE`、`LIB`、`LIBPATH`、`PATH`、`VCToolsInstallDir`、`VSCMD_ARG_TGT_ARCH=x64`。有一行 VsDevCmd 內部雜訊 `'vswhere.exe' is not recognized`（本機 cmd PATH 無 Installer 目錄），不影響結果 |
| build | `bun run build` | 略過 | 工單允許（README 無影響）；workflow 改動不影響前端 build |
| CI | Publish run 無 Node 20 annotation | 未驗 | 交 T0063 |

### 偏差 / 風險

- 未用 `gh workflow view -R gowerlin/openusage publish.yml`：本地改動未 push，遠端內容是舊版，看不出差異；改用 actionlint。
- 殘餘風險：inline MSVC step 尚未在 GitHub `windows-latest` 實跑；若失敗會 fail loud（`throw` 或 cmd exit code），T0063 發行時確認。退路：改回 `ilammy/msvc-dev-cmd@v1`（只多一則 Node 20 annotation）。
- 編輯時 Python 把 `\v` 轉成控制字元，已修正並確認檔內無 `\x0b`。
