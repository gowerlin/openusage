---
schema_version: 1
schema_kind: workorder
id: T0004
title: Windows provider path audit
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 00:08:19 +08:00"
started_at: "2026-05-24T00:12:00+08:00"
completed_at: "2026-05-24T00:22:18+08:00"
updated_at: "2026-05-24T00:22:18+08:00"
plan_id: PLAN-001
sizing: medium
affects_files:
  - "plugins/**/*"
  - "src-tauri/src/plugin_engine/host_api.rs"
  - "src-tauri/src/**/*test*"
depends_on:
  - T0003
---

# T0004 Windows Provider Path Audit

## 元資料
- **工單編號**：T0004
- **任務名稱**：Windows provider path audit
- **狀態**：DONE
- **建立時間**：2026-05-24 00:08:19 (UTC+8)
- **開始時間**：2026-05-24T00:12:00+08:00
- **完成時間**：2026-05-24T00:22:18+08:00
- **目標子專案**：plugins / src-tauri
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0001, T0002, T0003
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `plugins/**/*`
  - `src-tauri/src/plugin_engine/host_api.rs`
  - `src-tauri/src/**/*test*`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 provider parity 需要 credential/sqlite/process-discovery 大改，先標 explicit unsupported + tests，回報 PARTIAL，交給後續專門工單。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：會掃多個 plugin 的 provider path 與 tests，需隔離塔台 context。

## 規格層級自問

- [x] **目標層**：執行。目標是 provider path/support audit 與最小修正。
- [x] **決策權歸屬**：Worker 可補 Windows path 或 explicit unsupported；不可做 release/signing/docs 工作。
- [x] **資訊完整度**：T0001/T0003 已列出 provider 與 host API 風險。
- [x] **回頭成本**：中。限定 plugin path/support 與 tests。
- [x] **記憶覆蓋**：本工單禁止 silent fallback；Windows 不支援要可見、可測、可回報。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0001-research-windows-porting.md`
- `_ct-workorders/T0002-windows-rust-build-baseline.md`
- `_ct-workorders/T0003-windows-host-api-mvp.md`
- `AGENTS.md`
- 相關 plugin 檔案與 tests
- `src-tauri/src/plugin_engine/host_api.rs`（僅在需要確認 redaction / host API response shape 時讀）

### 輸入上下文

T0003 已完成 Windows host API MVP：
- `ctx.host.keychain` Windows explicit unsupported。
- `ctx.host.ls.discover` Windows typed unsupported result。
- `ctx.host.sqlite` Windows explicit unsupported。
- Antigravity 已能處理 LS unsupported fallback。

T0001 初始 provider 風險：
- Cursor、Windsurf、Antigravity、Kiro、Perplexity、Gemini 多處 hardcode macOS paths。
- JetBrains plugin 已有 `ctx.app.platform === "windows"` path 分支，可作為模式。

### 範圍

本工單只處理 provider-specific path/support audit。

必做：
1. 確認目前在 `feat/windows-port-mvp`；若不是，切換過去，不覆蓋使用者變更。
2. 盤點以下 provider 的 Windows path/support：
   - Cursor
   - Windsurf
   - Antigravity
   - Kiro
   - Perplexity
   - Gemini
   - JetBrains
3. 分類每個 provider：
   - Windows path 可低風險補齊
   - Windows 暫不支援但可 fail loud / explicit unsupported
   - 需要後續專門工單
4. 對低風險項目補 Windows path 或 plugin-level explicit unsupported。
5. 補 regression tests。至少每個被修改 provider 要有 Windows path 或 unsupported test。
6. 若改 plugin-exposed request/response fields，必須審核 `host_api.rs` redaction list 並補測試。

不做：
- 不做 Windows release workflow / installer / signing。
- 不做 README/docs/shortcut UI polish。
- 不做完整 Credential Manager / sqlite sidecar / process-discovery 新架構。
- 不 commit，除非塔台後續明確要求。

### 建議驗證命令

```powershell
bun run build
bun run test
bun run bundle:plugins
cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'
```

若只改 plugin tests，可先跑相關 vitest，再跑完整 suite。

### 預期產出

- Provider Windows support matrix。
- 低風險 Windows path / unsupported 修正。
- Regression tests。
- 下一張工單建議：T0005 Windows packaging / release workflow。

### 驗收條件

- [x] 7 個 provider 的 Windows path/support 狀態已列清楚。
- [x] 修改過的 provider 有 regression tests。
- [x] Windows 不支援狀態不 silent fallback。
- [x] 若 request/response 欄位有變，redaction list 已審核並測試。
- [x] 驗證命令結果明確記錄。
- [x] 未碰 release workflow、installer、docs polish。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
DONE

### 產出摘要
- 本工單修改：
  - `plugins/cursor/plugin.js`
  - `plugins/cursor/plugin.test.js`
  - `plugins/windsurf/plugin.js`
  - `plugins/windsurf/plugin.test.js`
  - `plugins/perplexity/plugin.js`
  - `plugins/perplexity/plugin.test.js`
  - `plugins/kiro/plugin.js`
  - `plugins/kiro/plugin.test.js`
  - `plugins/gemini/plugin.js`
  - `plugins/gemini/plugin.test.js`
  - `_ct-workorders/T0004-windows-provider-path-audit.md`
  - `_ct-workorders/_tower-state.md`
  - `_ct-workorders/PLAN-001-windows-port.md`
- 關鍵變更：
  - Cursor / Windsurf / Perplexity：Windows 早期 fail loud，避免 macOS path + unsupported sqlite/keychain silent fallback。
  - Kiro：補 Windows AppData profile/state/log path；Windows 可用現有 token/profile 走 live usage。
  - Gemini：補 Windows npm / pnpm / Volta OAuth client candidate paths。
  - Antigravity：沿用 T0003 的 `ctx.host.ls.discover` typed unsupported fallback。
  - JetBrains：確認既有 Windows AppData path 與 regression test。
- 工作樹既有未提交變更仍存在，未回退：`plugins/antigravity/*`、`src-tauri/*` 相關 T0002/T0003 變更。
- 未碰 release workflow、installer、docs polish。

### Provider Windows support matrix
| Provider | Windows 狀態 | 處理 | 測試 |
|----------|--------------|------|------|
| Cursor | explicit unsupported | Windows 需要 Credential Manager 或 bundled sqlite；目前在 `probe` 起點 fail loud，不讀 sqlite/keychain。 | `fails explicitly on windows before touching sqlite or keychain` |
| Windsurf | explicit unsupported | Windows state DB 需要 bundled sqlite；目前在 `probe` 起點 fail loud，不讀 sqlite/http。 | `fails explicitly on windows before reading sqlite` |
| Antigravity | partial | LS discovery 在 Windows typed unsupported；保留 Cloud Code/cache fallback。SQLite Windows credential path 仍需後續 sqlite/path 工單。 | T0003 test `logs and falls back when LS discovery is unsupported`；本工單完整 test suite 覆蓋。 |
| Kiro | low-risk path added | 補 `~/AppData/Roaming/Kiro/...` profile/state/log path；token path `~/.aws/sso/cache/...` 保持跨平台。 | `reads the Kiro profile from AppData on windows for live usage` |
| Perplexity | explicit unsupported | 目前依賴 macOS app cache sqlite；Windows 先 fail loud，後續需確認 Windows app cache + bundled sqlite。 | `fails explicitly on windows before reading the mac app cache` |
| Gemini | low-risk path added | 補 Windows npm / pnpm / Volta OAuth client path candidates；`~/.gemini` creds 保持跨平台。 | `discovers oauth2.js from the Windows npm global directory` |
| JetBrains | supported existing | 已有 `~/AppData/Roaming/JetBrains` path branch；本工單未改。 | existing `discovers quota on windows` |

### Redaction audit
無欄位變更。

- 沒新增 plugin-exposed request/response fields。
- Kiro 仍使用既有 `profileArn` query；`host_api.rs` redaction list 已包含 `profilearn` / `profile_arn` / `profileArn`。
- Gemini 仍使用既有 OAuth `client_secret` / token fields；本工單只新增 candidate path，不新增欄位。

### 互動紀錄
無

### 驗證結果
- PASS：`bunx vitest run plugins/cursor/plugin.test.js plugins/windsurf/plugin.test.js plugins/perplexity/plugin.test.js plugins/kiro/plugin.test.js plugins/gemini/plugin.test.js -t "windows|Windows"`
  - RED：實作前 5 tests failed，失敗原因符合缺 Windows 行為。
  - GREEN：實作後 5 passed。
- PASS：`bunx vitest run plugins/cursor/plugin.test.js plugins/windsurf/plugin.test.js plugins/perplexity/plugin.test.js plugins/kiro/plugin.test.js plugins/gemini/plugin.test.js`
  - 5 files passed；168 tests passed。
- PASS：`bun run build`
- PASS：`bun run test`
  - exit 0；既有 Tauri store mock stderr 仍出現，但 test suite 通過。
- PASS：`bun run bundle:plugins`
  - Bundled 18 plugins。
- PASS：`cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'`
  - Visual Studio 2026 Developer Command Prompt v18.6.1；`Finished dev profile`。

### 遭遇問題
- `lean-ctx -c` 使用 bash-backed shell，直接跑 PowerShell `Get-Date` 與 nested `cmd.exe /c call` quoting 會失敗；已改用 `powershell -NoProfile` / PowerShell direct command rerun。
- `git status` 顯示多個既有 dirty files（T0002/T0003 相關）與 `_ct-workorders/` untracked；本工單未回退、未覆蓋。
- `git diff --name-only` 顯示 LF/CRLF warning；未做換行批次轉換。

### 建議下一步
T0005 Windows packaging / release workflow。另建議後續專門工單處理 bundled sqlite / Windows Credential Manager，解除 Cursor/Windsurf/Perplexity explicit unsupported。

### sprint-status.yaml 已更新
不適用（repo 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T00:22:18+08:00
