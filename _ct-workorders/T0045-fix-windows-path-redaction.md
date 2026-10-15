---
schema_version: 1
schema_kind: workorder
id: T0045
title: Mask Windows user paths in host API redaction
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-009
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T13:41:38+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0043
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
---

# T0045 Mask Windows user paths in host API redaction

## 背景

BUG-009（T0039 稽核）：路徑 redaction 只遮 Unix 路徑。

## 任務指令

1. 找出 `host_api.rs` 內所有路徑 / 使用者名稱 redaction（regex、`redact_*` 函式）。
2. 加入 Windows 形式：`C:\Users\<name>\...`、`C:/Users/<name>/...`、JSON 字串內的雙反斜線形式、任意磁碟代號；`Users` 大小寫不敏感。遮蔽方式與既有 Unix 規則一致。
3. 補測試涵蓋上述形式 + Unix 不退步。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（≥143）
- PASS：`bun run test --run`、`bun run build`
- PASS：實機抽查：以 Debug log level 跑一次 release exe（cwd `%TEMP%`），`OpenUsage.log` 中 host_api 產生的行不出現實際使用者名稱（不分大小寫 grep）。若其他來源（非 host_api）仍出現，列出來源但不在本單修。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`fix(security): redact Windows user paths in host API logs (T0045)`，只含本單檔案 + 回報區。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
