---
schema_version: 1
schema_kind: workorder
id: T0044
title: Windows re-smoke + NSIS for 0.6.29 after T0042/T0043
status: PENDING
priority: High
type: verification
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T14:07:49+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0042
  - T0043
  - T0045
  - T0046
  - T0047
  - T0048
  - T0049
affects_files: []
---

# T0044 Windows Re-Smoke + NSIS For 0.6.29

## 背景

T0040 PARTIAL（Usage Trend FAIL）。T0042（ccusage runner）、T0043（taskbar / blur hide）、T0045–T0048（後續小問題，D076）完成後，發行前重新驗證。方法沿用 T0040 回報區（release exe、cwd `%TEMP%`、UIA、trace log）。

## 任務指令

1. 重新打 NSIS（環境同 T0040），記錄 path / size / SHA256 / LastWriteTime。
2. 重跑 T0040 smoke **全部 17 項**，並新增：
   - Usage Trend / Today / Yesterday / Last 30 Days 顯示（BUG-006）。
   - 工作列無按鈕（BUG-007）。
   - 失焦自動收起 + tray 連點無閃爍 + 拖曳 / 下拉 / About 不誤收（BUG-008；T0048 搬移後不退步）。
   - Debug log 中 host_api 路徑不含實際使用者名稱（BUG-009）。
   - 一般情況 ccusage 正常、無殘留 node（BUG-010）。
   - 無 runner 時顯示「用量歷史」提示（BUG-011，可用只對測試 process 改 PATH 的方式）。
   - 安裝版從 repo 目錄啟動不載入 repo `plugins/`（BUG-012）。
   - ccusage 逾時後 process tree 清空（BUG-010；可沿用 T0046 的暫時 timeout build 做法，不 commit）。
3. 截圖存 `_ct-workorders/assets/T0044/`（**截圖前確認畫面沒有其他視窗的私人內容**）。
4. FAIL 不修，回報 PARTIAL / FAILED。

## 明確排除 / 環境限制

- 不改程式碼、不 push、不 tag。
- **不改 registry**（T0040 曾暫改 WebView2 policy，本單禁止）。
- 不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`（T0043 曾暫時覆蓋）。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重新啟動並還原 `settings.json`（SHA256 比對）。
- NSIS 安裝版 smoke 優先：用 T0044 產出的 installer 裝到**暫存位置**測試不可行時，用 release exe + `resources/` 一起帶。

## 驗證 Gate

- PASS：NSIS 產出
- PASS：全部 smoke 項目 PASS

## 收尾

- Commit：回報區 + 截圖，`docs: windows re-smoke for 0.6.29 (T0044)`。不 push。

## 回報區

（Worker 填寫：狀態、installer 資訊、逐項結果表、截圖、清理紀錄）
