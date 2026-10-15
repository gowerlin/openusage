---
schema_version: 1
schema_kind: workorder
id: T0039
title: Devin plugin Windows behavior (credentials path or fail loud)
status: PENDING
priority: Medium
type: implementation
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:39:32+08:00"
started_at: null
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

（Worker 填寫：狀態、commit、研究來源、選 A 或 B 與理由、驗證證據）
