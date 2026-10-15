---
schema_version: 1
schema_kind: plan
id: PLAN-006
title: v0.6.31 - BUG-016, v0.7.x provider ports, docs and CI
status: IN_PROGRESS
priority: Medium
plan_type: feature
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:47:34+08:00"
completed_at: null
affects_files: []
depends_on:
  - PLAN-005
---

# PLAN-006 v0.6.31

## 目標（使用者 2026-10-15「繼續開單處理」，D093）

1. BUG-016：拖到偏下後面板暫時超出螢幕。
2. v0.7.x 移植（T0037 報告 §7 標「移植」）：Codex 連結、Grok weekly、Claude reset grants / Fable weekly、OpenCode Go 官方 API、Copilot AI Credits。
3. README 補 Perplexity / Synthetic；`publish.yml` Node 20 deprecated 警告。
4. Smoke + 發行 `v0.6.31`（沿用使用者「修完再發」模式）。

## 工單串接（前一張 DONE 才派下一張；非 DONE 停下問使用者）

T0055 BUG-016 → T0056 README + CI → T0057 Codex 連結 → T0058 Grok weekly → T0059 Claude reset grants + Fable → T0060 OpenCode Go API → T0061 Copilot AI Credits → T0065 Grok credits 單一路徑（D098）→ T0066 Claude resets i18n + docs（D099）→ T0062 smoke（PARTIAL）→ T0067 BUG-016 重做 + BUG-018 → T0068 re-smoke（D105）→ T0064 pre-release 驗證 CI（D096）→ T0063 發行 v0.6.31

## 進度

- 2026-10-15：建立 T0055–T0063，派發 T0055。
