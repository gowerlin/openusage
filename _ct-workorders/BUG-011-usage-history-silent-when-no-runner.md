---
schema_version: 1
schema_kind: bug
id: BUG-011
title: Usage history silently disappears when no ccusage runner is available
status: CLOSED
severity: Low
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T16:28:34+08:00"
related_workorder: T0047
affects_files:
  - plugins/claude/plugin.js
  - plugins/codex/plugin.js
depends_on: []
---

# BUG-011 Usage history silently disappears when no ccusage runner is available

## 問題描述（T0042 回報）

Host 回 `{"status":"no_runner"}` 時，claude / codex plugin 直接省略 Today / Yesterday / Last 30 Days / Usage Trend 行，畫面沒有任何說明。使用者無從得知需要安裝 Node.js 或 Bun。違反 AGENTS.md「fail LOUD」精神。

## 驗收條件

- [x] `no_runner` 時詳細頁顯示一行明確提示，en / zh-TW。
- [x] 有 runner 時行為不變。
- [x] 補測試。

## 回報區

### 修復狀態
CLOSED（2026-10-15T16:28:34+08:00）：使用者安裝 `v0.6.30` 實測通過（D092）。
FIXED：T0047 `96fc3ad8`。`no_runner` 時顯示「用量歷史」提示行（claude / codex），有 runner 時不顯示；實機兩種情境 PASS。文案在 400px 面板被截斷 → T0048 附帶改短（D079）。
