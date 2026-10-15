---
schema_version: 1
schema_kind: workorder
id: T0070
title: Windows smoke + NSIS for 0.6.32 (token dashboard button)
status: PENDING
priority: High
type: verification
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
  - T0069
affects_files: []
---

# T0070 Windows Smoke + NSIS For 0.6.32

## 任務指令

1. 打 NSIS（版號仍 0.6.31 屬預期），7-Zip 解出測試（不執行 installer）。
2. Token 戰情室按鈕：T0069 實機項目全部重跑（啟動 / 已執行 / Quit 清理 / 強制結束清理 / 外部已開不關 / 無 npx 提示 / 無 console / 無工作列按鈕）。
3. 回歸精簡（各 1 次）：BUG-001 trace、BUG-002、BUG-004、BUG-007、BUG-008/013 點外收起、BUG-012 `mock` 404、BUG-016 拖低停頓 500ms 放開、側邊欄 ❓ / 設定仍正常、i18n。
4. 截圖存 `_ct-workorders/assets/T0070/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.32 (T0070)`。不 push。

## 回報區

（Worker 填寫）
