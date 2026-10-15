---
schema_version: 1
schema_kind: plan
id: PLAN-007
title: v0.6.32 - Token dashboard (TokenUsageInsights) launcher button
status: IN_PROGRESS
priority: Medium
plan_type: feature
created_at: "2026-10-15T18:42:22+08:00"
updated_at: "2026-10-15T18:48:58+08:00"
completed_at: null
affects_files: []
depends_on:
  - PLAN-006
---

# PLAN-007 v0.6.32 Token Dashboard Launcher Button

## 目標（使用者 2026-10-15，D109）

側邊欄 ❓ 上方加一個按鈕，啟動 [doggy8088/TokenUsageInsights](https://github.com/doggy8088/TokenUsageInsights)（Token 戰情室，MIT）本機看板並開瀏覽器。

## 使用者決策

- 啟動方式：已安裝 `%USERPROFILE%\bin\token-usage-insights.cmd`（Windows）/ `~/.local/bin/token-usage-insights`（unix）優先，否則 `npx --yes token-usage-insights@latest`（D111）；兩者皆不可用 → 明確提示 + 安裝說明連結。**不自動執行遠端安裝腳本**。
- 按鈕行為：未執行 → 背景啟動、等 `localhost:3003` 就緒、開預設瀏覽器；已執行 → 直接開瀏覽器。按鈕顯示「執行中」小標記。
- 不顯示終端視窗、不佔工作列；**關閉 OpenUsage 時一併結束背景程式**（只結束 OpenUsage 自己啟動的）。
- 版本：v0.6.31 先發，本功能放 v0.6.32。

## 工單串接

T0069 實作 → T0072 BUG-019 tray 右鍵（D112）→ T0070 Windows smoke + NSIS → T0071 發行 v0.6.32（T0063 DONE 後開始）。

## 進度

- 2026-10-15：建立 PLAN-007 + T0069–T0071。
