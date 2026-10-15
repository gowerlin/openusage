---
schema_version: 1
schema_kind: workorder
id: T0062
title: Windows smoke + NSIS for 0.6.31 candidate
status: PENDING
priority: High
type: verification
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:29:08+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0055
  - T0056
  - T0057
  - T0058
  - T0059
  - T0060
  - T0061
affects_files: []
---

# T0062 Windows smoke + NSIS for 0.6.31 candidate

## 背景

PLAN-006 發行前驗證。方法沿用 T0053（7-Zip 解 installer 內容測、不執行 installer、UIA + trace + log）。版號此時仍為 0.6.30（T0063 才 bump）。

## 任務指令

1. 打 NSIS，記錄 path / size / SHA256 / LastWriteTime；7-Zip 解出測試。
2. 新增項目：
   - BUG-016：真實拖曳到偏下 → 放開後面板下緣 ≤ 工作區底。
   - 移植項：Codex 連結 URL；Grok / Claude（Rate Limit Resets、Fable）/ OpenCode Go / Copilot 詳細頁——有憑證者實機截圖，無憑證者確認 plugin 載入且錯誤提示合理（不崩潰、不空白）。
   - README 渲染（GitHub 預覽或本機 markdown）含 Perplexity / Synthetic。
3. 回歸（精簡，各 1 次）：BUG-001 trace、BUG-002、BUG-004、BUG-005、BUG-006、BUG-007、BUG-008/013 點外收起、BUG-009、BUG-010、BUG-012、BUG-014、BUG-015、i18n / 主題。
4. 截圖存 `_ct-workorders/assets/T0062/`。FAIL 不修，回報 PARTIAL / FAILED。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：回報區 + 截圖，`docs: windows smoke for 0.6.31 (T0062)`。不 push。

## 回報區

（Worker 填寫：狀態、commit、改動、上游引用、驗證證據、偏差）
