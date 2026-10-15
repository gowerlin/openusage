---
schema_version: 1
schema_kind: workorder
id: T0049
title: Only load cwd plugins in debug builds
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-012
plan_id: PLAN-004
created_at: "2026-10-15T14:07:49+08:00"
updated_at: "2026-10-15T14:07:49+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0048
affects_files:
  - src-tauri/src/plugin_engine/mod.rs
---

# T0049 Only Load cwd Plugins In Debug Builds

## 背景

BUG-012：`plugin_engine/mod.rs` 的 `find_dev_plugins_dir()` 在 release build 也會從 cwd / `../` 的 `plugins/` 載入 plugin。

## 任務指令

1. 讓 dev plugins 目錄只在 debug build 生效（例如 `cfg!(debug_assertions)` / `#[cfg(debug_assertions)]`，跟隨檔內寫法）。若需保留 release 下的開發者覆寫能力，**不要**新增（AGENTS.md 不過度工程）。
2. 確認 `bun tauri dev` 仍讀 repo `plugins/`。
3. 補測試（例如把判斷抽成純函式 `should_use_dev_plugins(is_debug, dir_exists)`）。
4. 檢查同檔其他依 cwd 的行為是否有同類問題，僅回報不擴大修改。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`
- PASS：`bun run build`
- PASS：實機：release exe（帶 `resources/`）以 **repo 根目錄為 cwd** 啟動 → log 顯示使用 bundled / AppData plugins，沒有 `mock` plugin，`settings.json` 不被改寫（測前後 SHA256 一致；測完還原）。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。
- 非 bundle 的 release exe 若搬離 `target/release`，需連 `resources/` 一起帶。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`fix(security): only load cwd plugins in debug builds (T0049)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
