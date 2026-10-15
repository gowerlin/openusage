---
schema_version: 1
schema_kind: workorder
id: T0039
title: Devin plugin Windows behavior (credentials path or fail loud)
status: IN_PROGRESS
priority: Medium
type: implementation
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:51:33+08:00"
started_at: "2026-10-15T12:50:01+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0038
affects_files:
  - plugins/devin/plugin.js
  - plugins/devin/plugin.test.js
  - src-tauri/src/plugin_engine/host_api.rs
  - README.md
---

# T0039 Devin Plugin Windows Behavior

## 背景

T0038 合併上游後，Devin plugin 取代 Windsurf。T0037 報告 §3：Devin 在 Windows 讀 `~/.local/share/devin/credentials.toml`（Windows 路徑**未驗證**），失敗後 fallback 到 sqlite（Windows 不支援，被 catch 只記 warn），最後顯示登入提示，**不會 fail loud** —— 違反 AGENTS.md「Unexpected issues: fail LOUD」。

## 任務指令

1. 研究（AGENTS.md 研究規則，先查官方文件 / Devin CLI 原始碼或文件）：Devin CLI / Devin app 在 Windows 的憑證檔位置（例如 `%APPDATA%`、`%LOCALAPPDATA%`、`%USERPROFILE%\.local\share\devin`）。記錄來源 URL。
2. 二擇一（依研究結果，Worker 決定，回報理由）：
   - **A. 找得到可靠 Windows 路徑**：plugin 在 Windows 讀該路徑；sqlite fallback 在 Windows 跳過（不要觸發 unsupported warn 噪音）。
   - **B. 找不到 / 不可靠**：比照 fork 先前 Windsurf 做法（`3a94c9eb`，T0004），Windows 上**明確 throw unsupported**（使用者看得到的清楚訊息）。
3. 測試：在 `plugin.test.js` 補 Windows 分支測試（比照 fork 其他 plugin 的 Windows 測試寫法）。
4. AGENTS.md：plugin 變動 → 稽核 `src-tauri/src/plugin_engine/host_api.rs` redaction 清單是否涵蓋 Devin request/response 欄位（上游已加 Devin token redaction，確認在 fork 合併後仍完整），有缺口補測試。
5. README：若 Windows 不支援 Devin，在支援表註明。

## 明確排除

- 不改 Antigravity / Gemini / 其他 plugin。
- 不 push、不 tag、不發行。

## 驗證 Gate

- PASS：`bun run test --run plugins/devin`、`bun run test --run`（全套）
- PASS：`cargo test --locked`（若動到 `host_api.rs`）
- PASS：`bun run bundle:plugins`、`bun run build`
- `git diff --check` 無新 warning

## 收尾

- Commit：`fix(devin): explicit Windows behavior (T0039)`，只含本單檔案 + 回報區。不 push。

## 回報區

### 結果

- 狀態：DONE
- 選擇：**A**（Windows 讀 `%APPDATA%\devin\credentials.toml`；Windows 跳過 sqlite fallback）
- Commit：見 frontmatter `commit`（`fix(devin): explicit Windows behavior (T0039)`）。未 push。

### 落點檢查

- C-0：WARN — frontmatter 無 `repo` 欄位；實際 `basename(REPO_ROOT)` = `openusage`（`D:/ForgejoGit/@GitHub_Clone/openusage`）
- C-1：PASS — 工單在 REPO_ROOT 下
- C-3：PASS — 4 個 `affects_files` 全部存在
- C-2：N/A — 無 `branch` 欄位（目前 `main`）
- `BAT_WORKSPACE_ID`：`7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 研究來源

- 官方 Devin docs（Windsurf legacy auth）：https://docs.devin.ai/cli/enterprise/windsurf-auth.md
  - macOS / Linux：`$XDG_DATA_HOME/devin/credentials.toml`，否則 `~/.local/share/devin/credentials.toml`
  - Windows：`%APPDATA%\devin\credentials.toml`（通常 `C:\Users\<you>\AppData\Roaming\devin\credentials.toml`）
- 官方 Devin docs（Devin Enterprise auth，zh）：https://docs.devin.ai/zh/cli/enterprise/devin-auth.md — 同上 Windows 路徑
- 第三方佐證：https://www.codeagentswarm.com/en/guides/devin-cli-on-windows — config dir `%APPDATA%\devin`（native Windows 驗證）

### 選 A 理由

- 官方文件兩頁一致明列 Windows 路徑 → 可靠。
- Devin app 的 `state.vscdb` 需 `ctx.host.sqlite`，Windows host 直接 throw unsupported → Windows 跳過 app auth 迴圈，不再產生 `failed to read Devin app auth` warn 噪音。
- 無憑證 / 憑證被拒時，Windows 顯示專屬訊息：`Run devin auth login and try again. On Windows only Devin CLI credentials are supported.`（使用者看得到，非靜默）。

### 變更檔案

- `plugins/devin/plugin.js`：新增 `WINDOWS_CREDENTIALS_PATH = "~/AppData/Roaming/devin/credentials.toml"`、`WINDOWS_LOGIN_HINT`、`isWindows()`；Windows 讀 Windows 路徑、跳過 sqlite。
- `plugins/devin/plugin.test.js`：+4 Windows 測試（讀 %APPDATA% 路徑且不碰 sqlite；Windows 忽略 macOS 路徑；無憑證時 Windows hint 且無 warn/sqlite/http；憑證 401 時 Windows hint）。
- `src-tauri/src/plugin_engine/host_api.rs`：+1 測試 `redact_body_redacts_devin_request_metadata_api_key`。
- `README.md`：Devin 列加註 `(Windows: Devin CLI login only)`。

### Redaction 稽核（host_api.rs）

- Request：`metadata.apiKey` → `sensitive_keys` 含 `apiKey` + `devin-session-token$` regex（body/log 兩處）。
- Response：`orgId`/`org_id`/`accountDisplayName`/`account_display_name`/`email` 皆在 `sensitive_keys`，上游測試保留。
- 合併後完整。缺口：無測試覆蓋「不帶 `devin-session-token$` 前綴的 JSON `apiKey`」（legacy Windsurf Enterprise key）→ 已補測試，實作本身已涵蓋，未改 redaction 程式碼。

### 驗證證據

| Gate | 結果 | 證據 |
|---|---|---|
| `bun run test --run plugins/devin` | PASS | 1 file，20 passed |
| `bun run test --run` | PASS | 68 files，1196 passed |
| `cargo test --locked` | PASS | 138 passed / 0 failed（VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`；Git Bash 直跑因 libclang 找不到失敗，為環境問題） |
| `bun run bundle:plugins` | PASS | Bundled 18 plugins（含 devin） |
| `bun run build` | PASS | built in 743ms（既有 chunk >500 kB 警告，非新） |
| `git diff --check` | PASS | exit 0，僅 LF→CRLF 提示 |

Runtime smoke（實機 Windows 讀真實 `%APPDATA%\devin\credentials.toml`）：未執行 — 本機無 Devin 帳號憑證，非本單 gate。

### 偏差 / 後續建議

- 未處理 `XDG_DATA_HOME`（上游 macOS/Linux 原本也未處理，非本單範圍）。
- `%APPDATA%` 被重導（非預設 Roaming 位置）時讀不到 —— host 端 `~` 展開不讀 env，屬少見情況，未處理。
- `host_api.rs` 路徑 redaction regex 只涵蓋 Unix 路徑（`/Users/...`），Windows `C:\Users\...` 不會被遮 —— 通用問題，非 Devin 專屬，建議塔台另開單。
- `docs/providers/devin.md` 未列 Windows 路徑（不在 `affects_files`），建議後續補。
