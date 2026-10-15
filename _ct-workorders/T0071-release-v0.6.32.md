---
schema_version: 1
schema_kind: workorder
id: T0071
title: Bump version and publish GitHub release v0.6.32
status: PENDING
priority: High
type: release
plan_id: PLAN-007
bug_id: null
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T18:42:22+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0070
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0071 Bump Version And Publish GitHub Release v0.6.32

## 背景

PLAN-007 最後一步，流程同 T0063（含 push 前隱私掃描、只推單一 tag、Node 24 workflow）。

## 授權範圍（D109：使用者「功能放 v0.6.32」）

- ✅ 版號 `0.6.31` → `0.6.32`；`git push origin main`；建立並 push **單一** tag `v0.6.32`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`；不得 force-push、移動 / 刪除既有 tag 或 release

## 前置條件（不符即 BLOCKED）

- T0069、T0072 `DONE`、T0070 `DONE`（smoke 全 PASS）；`git status` 乾淨；main 只 ahead；`v0.6.32` tag 不存在。

## 任務指令

同 T0063 步驟 1–6（版號 → 0.6.32）。發行重點說明（繁中）：本版重點 = 側邊欄新增「Token 戰情室」按鈕（背景啟動 [TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights) 並開啟看板，關閉 OpenUsage 時自動結束；需要 Node.js 18.18+ 或已安裝的 token-usage-insights）。另列 BUG-019（tray 右鍵不再開關面板）。已知問題沿用 BUG-017。

## 驗證 Gate

- PASS：Publish run 成功且無 Node 20 annotation；release / assets / `latest.json` 0.6.32 / Latest；fork 無非預期 tag；release body = API body

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

（Worker 填寫）
