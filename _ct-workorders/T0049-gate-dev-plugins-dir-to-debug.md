---
schema_version: 1
schema_kind: workorder
id: T0049
title: Only load cwd plugins in debug builds
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-012
plan_id: PLAN-004
created_at: "2026-10-15T14:07:49+08:00"
updated_at: "2026-10-15T14:27:17+08:00"
started_at: "2026-10-15T14:23:24+08:00"
completed_at: "2026-10-15T14:27:17+08:00"
commit: 1f9dd835
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

### 狀態

DONE。cwd `plugins/` / `../plugins/` 只在 debug build 生效；release 一律走 bundled → AppData plugins。

### Landing check

WARN。C-0：frontmatter 無 `repo`（absent），`basename(REPO_ROOT)` = `openusage` → WARN repo identity unavailable。C-1 PASS。C-3 PASS（`src-tauri/src/plugin_engine/mod.rs` 存在）。C-2 無 `branch` 欄位。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`。

### 改動

`src-tauri/src/plugin_engine/mod.rs`：
- `find_dev_plugins_dir()` 改呼叫新純函式 `dev_plugins_dir(cfg!(debug_assertions), &cwd)`；`is_debug=false` 直接 `None`。
- 新測試：`dev_plugins_dir_ignores_cwd_plugins_in_release`（cwd 與 `../` 都放 `mock` → release 回 `None`）、`dev_plugins_dir_finds_cwd_or_parent_plugins_in_debug`（debug 下 cwd / `../plugins` 仍找得到）。
- 未加 release 覆寫開關（照單不過度工程）。305 → 341 LOC。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `cargo check --all-targets` | PASS | Finished `dev` profile |
| `cargo test --locked` | PASS | 151 passed / 0 failed（含 2 新測試） |
| `bun run build` | PASS | exit 0（僅既有 chunk >500kB 警告） |
| `bun tauri dev` 讀 repo `plugins/` | PASS（測試層） | dev profile `debug_assertions` 開；cwd=`src-tauri` → `../plugins` 由新 debug 測試覆蓋。未實跑 `bun tauri dev`（會與使用者常駐 app 搶 single-instance / port 6736） |
| 實機 release exe，cwd=repo 根 | PASS（附註） | 見下 |

實機（`bun tauri build --no-bundle` → `src-tauri/target/release/openusage.exe` + `target/release/resources/bundled_plugins`，無 `mock`）：
- 停使用者 0.6.27（pid 39032）→ 以 `D:\ForgejoGit\@GitHub_Clone\openusage` 為 cwd 啟動測試 exe（repo 根有 `plugins/mock`）。
- `GET http://127.0.0.1:6736/v1/usage/mock` → **404**（未知 plugin = 沒載入 cwd plugins）；`/v1/usage/claude` → 200、`/v1/usage/devin` → 204（bundled/AppData plugins 已載入）。跑 2 次皆 404。
- 新 log 行無 `mock` 字樣（log 本身不記 plugin 目錄，故以 HTTP API 為主證據）。
- `settings.json` SHA256：前 `1F5230AC…D020`；測試後**有變**（`8C031D84…`/`8895EB79…`）。diff 只差 `plugins.disabled` / `plugins.order` 移除 `windsurf` —— 為 HEAD（0.6.29）retired-plugin 清理對 0.6.27 設定的遷移，與 cwd 無關；`mock` 不在改寫後內容。已從備份還原。
- 以安裝目錄 `C:\Users\Gower\AppData\Local\OpenUsage` 為 cwd 重啟使用者 app（現 pid 2528）→ `settings.json` SHA256 = `1F5230AC…D020`，與測前一致。AppData `plugins/windsurf` 被測試 exe 清掉，重啟後由 0.6.27 bundled 補回（另有備份於 scratchpad）。

### 同檔其他 cwd 行為（僅回報）

`plugin_engine/mod.rs` 內 `std::env::current_dir()` 只出現在 `find_dev_plugins_dir()`（與測試的 `CurrentDirGuard`）。`resolve_bundled_dir` 用 `resource_dir`、install dir 用 `app_data_dir`，皆不依 cwd。無同類問題。

### 偏差

- Gate「`settings.json` 不被改寫」字面未達：被改寫，但原因是版本遷移（`windsurf` 退役），非 cwd plugins；已還原並 SHA 比對一致。建議 Tower 接受；若要零改寫，需用與安裝版同版本或另一份 app data 測。
- `bun tauri dev` 只做測試層確認，未實跑。

### Commit

`fix(security): only load cwd plugins in debug builds (T0049)`= `1f9dd835`。未 push。
