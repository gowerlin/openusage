---
schema_version: 1
schema_kind: workorder
id: T0068
title: Windows focused re-smoke + NSIS for 0.6.31 after T0067
status: PENDING
priority: High
type: verification
plan_id: PLAN-006
bug_id: null
created_at: "2026-10-15T17:51:22+08:00"
updated_at: "2026-10-15T17:51:22+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0067
affects_files: []
---

# T0068 Windows Focused Re-Smoke + NSIS For 0.6.31

## 背景

T0062 PARTIAL（BUG-016 停頓放開 FAIL），其餘 13 項回歸與移植項全 PASS。T0067 修正後重驗。方法同 T0062（7-Zip 解 installer 內容測，不執行 installer）。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. **BUG-016 完整矩陣**（真實滑鼠，控滑鼠前先問）：拖低立即放開 / 停頓 150ms / 停頓 500ms；先拖低再拖回上方立即 / 停頓 500ms 放開——每種 ≥3 次，記錄放開後 0 / 100 / 500 / 1500ms 的 rect 與可見 region。
3. BUG-018：trace log `trace_ready` 行無使用者名稱。
4. 受 T0067 影響的回歸：BUG-001 trace、BUG-008/013 點外收起（3 種）、BUG-008 tray 連點、BUG-015 偏下開 Settings、BUG-004 二次啟動、拖曳中面板不收起。
5. 精簡抽查（各 1 次）：Claude Fable /「可用 N 次」、BUG-006 Usage Trend、BUG-009 OpenUsage.log 無使用者名稱、BUG-012 `mock` 404。
6. 截圖存 `_ct-workorders/assets/T0068/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows re-smoke for 0.6.31 (T0068)`。不 push。

## 回報區

（Worker 填寫：狀態、installer 資訊、BUG-016 矩陣表、逐項結果、截圖、清理紀錄）
