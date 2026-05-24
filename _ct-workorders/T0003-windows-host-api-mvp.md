---
schema_version: 1
schema_kind: workorder
id: T0003
title: Windows host API MVP
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-23 23:51:29 +08:00"
started_at: "2026-05-23T23:54:46+08:00"
completed_at: "2026-05-24T00:05:05+08:00"
updated_at: "2026-05-24T00:05:05+08:00"
plan_id: PLAN-001
sizing: medium
affects_files:
  - "src-tauri/src/plugin_engine/host_api.rs"
  - "src-tauri/src/plugin_engine/*"
  - "src-tauri/src/**/*test*"
  - "plugins/**/*"
depends_on:
  - T0002
---

# T0003 Windows Host API MVP

## 元資料
- **工單編號**：T0003
- **任務名稱**：Windows host API MVP
- **狀態**：DONE
- **建立時間**：2026-05-23 23:51:29 (UTC+8)
- **開始時間**：2026-05-23T23:54:46+08:00
- **完成時間**：2026-05-24T00:05:05+08:00
- **目標子專案**：src-tauri / plugins
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0001, T0002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src-tauri/src/plugin_engine/host_api.rs`
  - `src-tauri/src/plugin_engine/*`
  - `src-tauri/src/**/*test*`
  - `plugins/**/*`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 host API 實作會膨脹成 provider parity，停在明確 unsupported + tests，回報 PARTIAL，讓 T0004 處理 provider paths。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要讀 host API、plugin request/response shape、測試，避免污染塔台 context。

## 規格層級自問

- [x] **目標層**：執行。目標是 Windows host API MVP，不是完整 Windows parity。
- [x] **決策權歸屬**：Worker 可選擇「小型 Windows 實作」或「明確 unsupported」；不可引入大型架構重寫。
- [x] **資訊完整度**：T0001/T0002 已給出阻塞點、驗證方式與 branch 狀態。
- [x] **回頭成本**：中。限制在 host API 和必要 tests。
- [x] **記憶覆蓋**：本工單禁止 silent fallback；缺能力時要 explicit result/error。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0001-research-windows-porting.md`
- `_ct-workorders/T0002-windows-rust-build-baseline.md`
- `AGENTS.md`
- `src-tauri/src/plugin_engine/host_api.rs`
- 相關 plugin tests / host API tests
- 受影響 plugin manifest / request shape（只讀取需要的檔案）

### 輸入上下文

T0002 已在 `feat/windows-port-mvp` 完成 Windows Rust build baseline：
- Windows `cargo check` 在 VS x64 dev env + `LIBCLANG_PATH` 下通過。
- 現有 source 有 T0002 的未提交修改；不要 revert。

T0001 指出 Windows host API 風險：
- `ctx.host.keychain` 非 macOS 目前 unsupported。
- `ctx.host.ls.discover` 使用 `/bin/ps` + `lsof`，Windows 不適用。
- `ctx.host.sqlite` 使用外部 `sqlite3` command，Windows 需 sidecar/Rust sqlite 或 fail loud。
- 若改 plugin-exposed request/response 欄位，需比對 `src-tauri/src/plugin_engine/host_api.rs` redaction lists 並補測試。

### 範圍

本工單做 Windows MVP，不做完整 provider path audit。

必做：
1. 確認目前在 `feat/windows-port-mvp`；若不是，切換過去，不覆蓋使用者變更。
2. 盤點 `ctx.host.keychain` / `ctx.host.ls.discover` / `ctx.host.sqlite` 的 Windows 行為。
3. 對每個 API 選最小可維護處理：
   - 若小修可支援 Windows，就實作小修。
   - 若超出本工單，回傳明確 unsupported / typed error，不能 silent fallback。
4. 補回歸測試，至少覆蓋 Windows path 或 unsupported result。
5. 若修改 plugin-exposed request/response fields，審核 redaction list 並加測試。
6. 跑必要驗證並填回報區。

不做：
- 不做 provider path inventory（T0004）。
- 不做 release workflow / installer / signing（T0005）。
- 不做 README/docs/shortcut UI polish（T0006）。
- 不 commit，除非塔台後續明確要求。

### 建議驗證命令

```powershell
bun run build
bun run test
bun run bundle:plugins
cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'
```

若測試命令不同，以 repo 實際 scripts 為準。

### 預期產出

- Windows host API MVP 修正或 explicit unsupported policy。
- Regression tests。
- 更新工單回報，列出每個 API 的 Windows 行為。
- 下一張工單建議：T0004 provider path audit。

### 驗收條件

- [x] Windows host API 不 silent fallback。
- [x] `keychain` Windows 行為明確。
- [x] `ls.discover` Windows 行為明確。
- [x] `sqlite` Windows 行為明確。
- [x] 有 regression tests 覆蓋新增/修正行為。
- [x] 若 request/response 欄位有變，redaction list 已審核並測試。
- [x] 驗證命令結果明確記錄。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Branch：`feat/windows-port-mvp`
- 修改：`src-tauri/src/plugin_engine/host_api.rs`
  - 新增 `UnsupportedHostApiResult`，欄位為 `status/api/platform/reason`。
  - `ctx.host.keychain` 非 macOS 錯誤改為包含實際平台的 explicit unsupported。
  - `ctx.host.ls.discover` Windows 回 typed unsupported JSON，不再 silent `null`。
  - `ctx.host.sqlite.query/exec` Windows fail loud，不再嘗試 PATH 上的 `sqlite3`。
- 修改：`plugins/antigravity/plugin.js`
  - 收到 `ls.discover` unsupported result 時記錄 log，並走既有 fallback。
- 修改：`plugins/antigravity/plugin.test.js`
  - 補 unsupported LS discovery fallback regression test。
- 新增 Rust regression tests：
  - `keychain_api_reports_unsupported_platform`
  - `ls_discover_returns_explicit_unsupported_result_on_windows`
  - `sqlite_api_reports_unsupported_on_windows`
- 既有 T0002 未提交 dirty files 仍保留；未 revert。
- Commit：未 commit（工單明示不 commit，除非塔台後續要求）。

### API 行為摘要
- `ctx.host.keychain`：Windows/non-macOS 會 throw `ctx.host.keychain is unsupported on windows; supported: macOS`。
- `ctx.host.ls.discover`：Windows 回 `{ status: "unsupported", api: "ctx.host.ls.discover", platform: "windows", reason: "process discovery is unsupported on Windows" }`。
- `ctx.host.sqlite`：Windows `query/exec` 會 throw `ctx.host.sqlite is unsupported on windows; supported: non-Windows hosts with sqlite3 command; Windows needs bundled sqlite3 or Rust sqlite`。
- Redaction audit：新增 response 欄位 `status/api/platform/reason` 均為非敏感、靜態描述；未新增 token/path/account 類欄位，redaction list 不需更新。已用 Rust/plugin regression tests 覆蓋 response shape 與 plugin handling。

### 互動紀錄
無

### 驗證結果
- RED（預期失敗）：`cargo test --manifest-path src-tauri/Cargo.toml unsupported --lib`
  - FAIL expected：keychain message 舊格式、`ls.discover` 回 `null`、sqlite 回 `sqlite3 exec failed: program not found`。
- RED（預期失敗）：`bunx vitest run plugins/antigravity/plugin.test.js -t "logs and falls back when LS discovery is unsupported"`
  - FAIL expected：unsupported result 未記錄 log。
- PASS：`cargo fmt --manifest-path src-tauri/Cargo.toml`
- PASS：`cargo test --manifest-path src-tauri/Cargo.toml unsupported --lib`
  - 3 passed。
- PASS：`bunx vitest run plugins/antigravity/plugin.test.js -t "logs and falls back when LS discovery is unsupported"`
  - 1 passed。
- PASS：`bun run build`
- PASS：`bun run test`
  - 61 test files passed；1106 tests passed。
  - stderr 有既有 `@tauri-apps/plugin-store` test mock `invoke` 訊息；未造成 failure。
- PASS：`bun run bundle:plugins`
  - Bundled 18 plugins。
- PASS：`cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'`

### 遭遇問題
- BAT 環境有 `BAT_SESSION=1`，但 `CT_MODE` 未傳入；依 Worker 規則降級為 ask。
- `_ct-workorders/` 目前整個目錄為 untracked；仍依工單更新檔案，但未 commit。
- 未找到 `sprint-status.yaml`。

### 建議下一步
建立 / 派發 T0004 provider path audit，處理 provider-specific Windows auth/state path parity。

### sprint-status.yaml 已更新
不適用（未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T00:05:05+08:00
