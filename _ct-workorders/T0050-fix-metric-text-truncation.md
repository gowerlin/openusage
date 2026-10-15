---
schema_version: 1
schema_kind: workorder
id: T0050
title: Show full text metric values in provider detail
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-014
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0041
affects_files:
  - src/components/provider-card-metric-line.tsx
  - src/components/provider-card-metric-line.test.tsx
---

# T0050 Show full text metric values in provider detail

## 背景

BUG-014：Claude 詳細頁「昨天 $213.36 · 597M toke…」被截斷。`provider-card-metric-line.tsx:89` text value 為 `truncate flex-shrink-0 max-w-[45%]`。

## 任務指令

1. 改排版讓**label 先讓位**：value 不再固定 `max-w-[45%]`；label `min-w-0 truncate`（保留 `title`），value 優先完整顯示。
2. value 仍需上限防爆版（例如 `max-w-[70%]` 或等效），超過時 value 才截斷並保留 `title`。
3. 驗證典型值在 400px 面板完整顯示：`$213.36 · 597M tokens`、`$5165.74 · 13B tokens`、`Needs Node.js or Bun`、`需要 Node.js 或 Bun`；label `過去 30 天` / `Last 30 Days` / `用量歷史` 不被擠到不可讀（至少可見前幾字 + title）。
4. 只改 text line；progress / badge 等其他 line 不動。補測試（class / title 斷言即可）。

## 驗證 Gate

- PASS：`bun run test --run`、`bun run build`
- PASS：寬度量測（比照 T0048：browser dev / Edge headless + 實際 CSS，內容寬 278px），上列 4 個 value 皆 `scrollWidth == clientWidth`；附截圖。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：`fix(ui): show full text metric values (T0050)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
