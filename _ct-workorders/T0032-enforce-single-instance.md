---
schema_version: 1
schema_kind: workorder
id: T0032
title: Enforce single app instance
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-004
plan_id: null
created_at: "2026-10-15T10:39:24+08:00"
updated_at: "2026-10-15T10:40:17+08:00"
started_at: "2026-10-15T10:40:17+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on: []
affects_files:
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
---

# T0032 Enforce Single App Instance

## 背景

BUG-004：OpenUsage 可同時執行多個 instance。使用者要求改為不允許重複執行。

## 已定決策（Worker 不得更改）

- 使用官方 `tauri-plugin-single-instance`（Tauri v2 版本），不自製 mutex / lock file。
- 全平台啟用，不加 `#[cfg(windows)]` 限制。
- 第二次啟動時：新 instance 結束；既有 instance 在 callback 中叫出面板（顯示 + focus）。
- 叫出面板沿用既有 `panel.rs` 的 `show_panel(app_handle)`（Windows / macOS 兩個實作都已存在），不新增另一套顯示邏輯。

## 任務指令

1. 先查官方文件確認 Tauri v2 `tauri-plugin-single-instance` 的用法（AGENTS.md 研究規則）。重點：plugin **必須是第一個註冊**的 plugin。
2. `src-tauri/Cargo.toml` 加依賴；若官方文件要求 desktop-only target 區塊，照文件做。
3. `src-tauri/src/lib.rs` builder 最前面註冊 `tauri_plugin_single_instance::init(|app, _args, _cwd| { ... show_panel ... })`。
4. 確認 callback 內呼叫 `show_panel` 的 thread 要求（若需 main thread，用 `run_on_main_thread`）。
5. 檢查 updater relaunch（`tauri_plugin_process` relaunch）與 autostart 不會被誤擋：舊 process 結束後新 process 才啟動即可，不需額外處理；若發現衝突，回報而非自行加 fallback。
6. 不需改 capabilities（single-instance 無前端 permission）；若文件另有要求，照文件。

## 明確排除

- 不改 tray / panel 位置、chrome、mask 邏輯（BUG-001 已 CLOSED，勿動 `panel_hit_test.rs`）。
- 不加前端 UI / toast / i18n 字串。
- 不做 release / tag / push。

## 驗證 Gate

- PASS：`cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check`
- PASS：`cargo test --lib`（於 `src-tauri`）
- PASS：`bun run build`
- PASS：本機 Windows NSIS package build（依既有 T0031 流程：VS x64 dev env + `LIBCLANG_PATH`），記錄 installer path / size / SHA256 / LastWriteTime
- 手動 smoke（若可行）：啟動 packaged/dev app 兩次 → 確認只有一個 process、第二次會叫出面板
- `git diff --check` 無新 warning

Final gate：使用者安裝新版後實測確認（Tower 負責收斂 BUG-004）。

## 收尾

- Commit：只 commit 本工單相關檔案（含本工單回報區），message 以 `fix: enforce single app instance (T0032)` 開頭。
- 不 push。

## 回報區

### Landing Zone

- 結果：WARN（僅 C-0）。
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage` → WARN "repo identity unavailable"，改用 C-3 + C-1。
- C-1：PASS（工單位於 REPO_ROOT 下）。
- C-3：PASS（4/4 testable entries present）。
- C-2：無 `branch` 欄位，略過。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。

### 研究（官方文件 + plugin 原始碼）

- 文件：https://v2.tauri.app/plugin/single-instance/ — 必須第一個註冊；`cargo add ... --target 'cfg(any(target_os = "macos", windows, target_os = "linux"))'`；無 JS API，不需 capabilities。
- 版本：最新 `2.5.x` 要求 tauri `^2.12`，`cargo add` 會把 tauri 2.11.1→2.12.4、wry 0.55→0.57 等大量升級。改鎖 `~2.4.5`（要求 tauri `^2.10`），Cargo.lock 只新增 1 個套件。
- Callback thread：Windows 在隱藏視窗 WndProc（main thread）；macOS 在 tokio task（非 main thread）→ callback 一律 `app.run_on_main_thread(...)` 呼叫 `panel::show_panel`。
- Updater relaunch：前端 `relaunch()` → plugin-process `restart` → `AppHandle::request_restart()` → `RunEvent::Exit` → single-instance `destroy`（釋放 mutex / 移除 socket）→ 之後才 spawn 新 process。不衝突。
- Windows updater install：`std::process::exit(0)` 後由 NSIS 啟動新版，OS 回收 mutex。不衝突。
- Autostart：開機僅一次啟動，不衝突。

### 改動檔案

- `src-tauri/Cargo.toml`：desktop target 區塊加 `tauri-plugin-single-instance = "~2.4.5"`。
- `src-tauri/Cargo.lock`：只新增 `tauri-plugin-single-instance 2.4.5`（+17 行）。
- `src-tauri/src/lib.rs`：builder 最前面註冊 `tauri_plugin_single_instance::init`，callback 經 `run_on_main_thread` 呼叫既有 `panel::show_panel`。
- `src-tauri/src/panel.rs`：未改（沿用既有 `show_panel`）。

### 驗證

- PASS：`cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check`（exit 0）。
- PASS：`cargo test --lib`（於 `src-tauri`）：110 passed, 0 failed。
- PASS：`bun run build`（exit 0；僅既有 chunk size warning）。
- PASS：本機 Windows NSIS package build（`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`，VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`）。
  - Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.25_x64-setup.exe`
  - Size：5,261,482 bytes
  - SHA256：`807633E48DF563FE5069455F571C9BD3237D64F7EC74D5F5DB398CFE06887F5F`
  - LastWriteTime：2026-10-15 10:54:55
  - 註：installer 產出後 CLI exit 1：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY`（本機無 updater 簽章私鑰，只影響 `.sig`，不影響 installer）。
- PASS：手動 smoke（release `openusage.exe`）：第 1 次啟動 pid 36556；第 2 次啟動 exit code 0，`openusage` process 數 = 1；再試 1 次同樣 exit 0、process 數 = 1，且前景視窗 pid = 36556（面板已顯示 + focus）。smoke 結束後已關閉 pid 36556。
  - 註：callback 的 `log::info!` 未出現在 `OpenUsage.log`（每次啟動後只有 3 行，推測前端啟動後調高 runtime log level），不影響功能證據。
- PASS：`git diff --check` exit 0（只有既有 LF/CRLF warning）。
- 未驗：macOS / Linux runtime（本機僅 Windows）。

### 環境處理

- 本機 VS 18 的 `VC\Tools\Llvm\x64\bin\libclang.dll` 已不存在（只剩 clang-format / clang-tidy），`rquickjs-sys` build 失敗：`Unable to find libclang`。
- 經使用者同意（「幫我裝」），以 VS Installer 加裝 `Microsoft.VisualStudio.Component.VC.Llvm.Clang`（`setup.exe modify --passive --norestart`，exit 0），之後 gate 全部通過。
- 環境另有空的 `CI` 變數，造成 `tauri build` 報 `error: a value is required for '--ci'`；build 時設 `CI=false` 解決。

### 互動紀錄

- Q：本機缺 libclang.dll，cargo test / NSIS build 跑不了，怎麼處理？ A：幫我裝。

### 偏離

- 依賴版本鎖 `~2.4.5` 而非最新 `2.5.4`：避免連帶升級 tauri / wry 等核心套件（超出工單範圍）。日後升 tauri 2.12+ 時可一併改 `2.5`。

### Commit

- 見 frontmatter `commit`。未 push。

### 狀態

DONE（source / tests / package / Windows smoke）。Final gate：使用者安裝新版實測（Tower 收斂 BUG-004）。
