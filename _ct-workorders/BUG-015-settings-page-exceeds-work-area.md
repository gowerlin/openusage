---
schema_version: 1
schema_kind: bug
id: BUG-015
title: Settings panel taller than the Windows work area
status: OPEN
severity: Low
created_at: "2026-10-15T14:53:32+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
related_workorder: T0051
target_version: "0.6.30"
affects_files:
  - src-tauri/src/panel.rs
  - src/pages/settings.tsx
depends_on: []
---

# BUG-015 Settings panel taller than the Windows work area

## 問題描述（T0040 / T0044 觀察 3）

Settings 頁面板 1152px 高，在 1368px 工作區內面板下移後底部被工作列遮住；點到被遮處會點到工作列使面板收起。進 Settings 後存的位置被夾成 y=216。

## 驗收條件

- [ ] 面板高度限制在工作區內（內容可捲動），不被工作列遮住。
- [ ] 位置記憶不因 Settings 頁高度被改寫。

## 回報區

### 修復狀態
OPEN（排入 v0.6.30，D083）
