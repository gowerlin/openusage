---
schema_version: 1
schema_kind: workorder
id: T0056
title: README missing plugins and publish workflow Node 20 deprecation
status: PENDING
priority: Low
type: chore
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:29:08+08:00"
started_at: null
completed_at: null
commit: null
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

（Worker 填寫：狀態、commit、改動、上游引用、驗證證據、偏差）
