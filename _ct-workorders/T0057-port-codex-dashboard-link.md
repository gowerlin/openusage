---
schema_version: 1
schema_kind: workorder
id: T0057
title: Port v0.7.x: Codex dashboard link fix
status: DONE
priority: Low
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:47:26+08:00"
started_at: "2026-10-15T16:42:58+08:00"
completed_at: "2026-10-15T16:47:26+08:00"
commit: dd69e501
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0056
affects_files:
  - plugins/codex/plugin.js
  - plugins/codex/plugin.json
  - plugins/codex/plugin.test.js
---

# T0057 Port v0.7.x: Codex dashboard link fix

## 背景

T0037 §7：上游 v0.7.15-beta.1 修正 Codex Dashboard 連結為 `chatgpt.com/settings/usage`；Tauri 版目前是 `chatgpt.com/codex/settings/usage`。

## 任務指令

1. 找上游該修正 commit，確認正確 URL。
2. 更新 fork Codex plugin 的 dashboard / 控制台連結。補測試斷言 URL。

## 移植通則（v0.7.x → Tauri plugin）

- 來源：上游 Swift 版 `upstream/main`（T0037 報告 §7）。用 `git log upstream/main --oneline -- <path>`、`git show upstream/main:<path>` 找對應 provider 實作、CHANGELOG 條目與測試 fixture。回報引用上游 commit / 檔案。
- 只移植**行為**（API endpoint、欄位、計算、顯示 line），用 fork 既有 plugin JS 寫法；不搬 Swift 架構。
- 新增 line label / value 加進 `src/lib/i18n-plugin-labels.ts`（zh-TW）。
- AGENTS.md：plugin 變動要稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單，新 request / response 欄位有缺口就補並加測試；`plugin.json` `brandColor` 維持 provider 真實品牌色；SVG 用 `currentColor`。
- 測試：用上游測試 fixture（或依 API 文件構造）補 `plugin.test.js`。
- Runtime：本機若有該 provider 的登入憑證就實機驗證；沒有則回報「未實機（無憑證）」，不得偽造。
- 若上游實作依賴 Tauri 版沒有的能力（例如需要新 host API），停下回報 BLOCKED 並說明，不自行擴大 host API。

## 驗證 Gate

- PASS：`bun run test --run plugins/codex`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
- PASS：`cargo test --locked`（若動 `host_api.rs`）
- Runtime：有憑證則實機（release exe，cwd `%TEMP%`）截詳細頁；無憑證則註明。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`feat(codex): update dashboard link from upstream v0.7.x (T0057)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

- 狀態：DONE
- Commit：見 frontmatter `commit`（`feat(codex): update dashboard link from upstream v0.7.x (T0057)`）。未 push / tag / 發行。
- 落點檢查：WARN — C-0 `repo` 欄位 absent（observed `openusage`）；C-1 PASS；C-3 3/3 present；C-2 無 branch 欄位（HEAD `main`）。`BAT_WORKSPACE_ID=7512690c-d1fd-4101-a2f5-f98f6f44e9c8`。`CT_MODE=yolo`。

### 上游引用

- `1c371767` `fix(codex): point the Dashboard link at chatgpt.com/settings/usage (#1364)` — `Sources/OpenUsage/Providers/Codex/CodexProvider.swift`：`https://chatgpt.com/codex/settings/usage` → `https://chatgpt.com/settings/usage`。
- `upstream/main:CHANGELOG.md` 第 9、27 行列此修正。

### 改動

- `plugins/codex/plugin.json`：`Usage dashboard` URL → `https://chatgpt.com/settings/usage`。label 保留 fork 既有 `Usage dashboard`（zh-TW「用量儀表板」已在 `i18n-plugin-labels.ts`），不跟上游改名 `Dashboard`。
- `plugins/codex/plugin.test.js`：新增 manifest `links` 斷言（仿 `plugins/opencode-go/plugin.test.js` 寫法）。
- `plugins/codex/plugin.js`：無需改（不含 dashboard URL）。
- 稽核：無新 request / response 欄位 → `host_api.rs` redaction 不需動；`brandColor` / SVG 未動。repo 內已無舊 URL（`src-tauri/resources/bundled_plugins` 為 gitignored 產物，`bundle:plugins` 後已更新）。

### 驗證

| Lane | 結果 | 證據 |
|---|---|---|
| `bun run test --run plugins/codex` | PASS | 2 files / 80 tests |
| `bun run test --run` | PASS | 70 files / 1207 tests |
| `bun run bundle:plugins` | PASS | Bundled 18 plugins；bundled codex `plugin.json` 為新 URL |
| `bun run build` | PASS | 僅既有 chunk size 警告 |
| `cargo test --locked` | N/A | 未動 `host_api.rs` |
| Runtime（release exe） | PASS | `bun tauri build --no-bundle`（VsDevCmd x64 + LIBCLANG_PATH + CI=false）→ exe 與 `resources/` 複製到 `%TEMP%\openusage-t0057`，cwd `%TEMP%` 啟動；`/v1/usage/codex` 200；UIA Invoke `Codex` 導覽 → 詳細頁有 `狀態`、`用量儀表板` Button；面板 region 截圖（region 外棋盤格，無 token/email/帳號 ID）存 scratchpad `t0057-codex-detail.png`，未 commit。 |

- 面板連結是 `openUrl` 按鈕，UI 不顯示 URL；URL 正確性由單元測試 + release `resources/bundled_plugins/codex/plugin.json` 內容證明。未點擊連結（會開使用者瀏覽器）。
- 未控制滑鼠（只用 UIA InvokePattern），未動剪貼簿 / registry / installer。

### 偏差 / 備註

- 使用者安裝版 OpenUsage（`%LOCALAPPDATA%\OpenUsage\openusage.exe`）執行中，smoke 前停用，結束後以安裝目錄為 cwd 重啟（已確認程序在跑）。`settings.json` SHA256 前後皆 `A7CC803B7D1E096F57B05B82C2E0573222726BF31D3F6C720397D359A63CF15E`，無改寫。
- 第一次 smoke 用 `cargo build --release` 產出的 exe 缺 `custom-protocol` feature，載入 devUrl（localhost 拒絕連線）；改用 `bun tauri build --no-bundle` 重建後通過。
