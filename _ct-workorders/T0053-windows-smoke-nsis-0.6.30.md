---
schema_version: 1
schema_kind: workorder
id: T0053
title: Windows smoke + NSIS for 0.6.30 candidate
status: PENDING
priority: Medium
type: verification
bug_id: null
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0050
  - T0051
  - T0052
affects_files: []
---

# T0053 Windows smoke + NSIS for 0.6.30 candidate

## 背景

PLAN-005：T0050–T0052 完成後，發行前驗證。方法沿用 T0044（7-Zip 解 installer 內容測、不執行 installer、UIA + trace + log）。版號此時仍為 0.6.29（T0054 才 bump），installer 檔名為 0.6.29 屬預期。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. 新增項目：
   - BUG-014：詳細頁數值（昨天 / 過去 30 天）完整顯示；no-runner 提示 en / zh-TW 不截斷。
   - BUG-015：面板拖到偏下 → Settings 不被工作列遮、可捲到「語言」；`panelPosition` 不被 clamp 改寫。
   - BUG-013：各種點外情境都收起（每種 ≥3 次）；trace 有 `WM_NCACTIVATE(0)` 檢查紀錄。
3. 回歸（精簡版，各 1 次即可）：BUG-001 trace、BUG-002 無 console、BUG-004 single-instance、BUG-005 About/❓、BUG-006 Usage Trend、BUG-007 工作列、BUG-008 tray 連點、BUG-009 log 無使用者名稱、BUG-010 無殘留 node、BUG-012 cwd=repo 根 `mock` 404、i18n / 主題切換。
4. 截圖存 `_ct-workorders/assets/T0053/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.30 (T0053)`。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
