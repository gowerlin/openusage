---
schema_version: 1
schema_kind: workorder
id: T0050
title: Show full text metric values in provider detail
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-014
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:26:13+08:00"
started_at: "2026-10-15T15:24:04+08:00"
completed_at: "2026-10-15T15:26:13+08:00"
commit: 439a9d81
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

### 狀態

DONE（2026-10-15T15:26:13+08:00）

### 落點檢查

WARN — C-0：frontmatter `repo` = absent，`basename(REPO_ROOT)` = `openusage`（repo identity unavailable）；C-1 PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）；C-3 PASS（`provider-card-metric-line.tsx` 存在，測試檔新建、父目錄存在）；C-2 不適用（無 `branch`，HEAD = `main`）。`BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅紀錄）。

### Commit

`fix(ui): show full text metric values (T0050)` → `439a9d81`。未 push / tag / 發行。

### 改動

| 檔案 | 改動 |
|---|---|
| `src/components/provider-card-metric-line.tsx` | text line value `max-w-[45%]` → `max-w-[70%]`。value 原本就 `flex-shrink-0 truncate` + `title`，label 原本就 `min-w-0 truncate` + `title`，所以 label 先讓位、value 超過 70% 才截斷。progress / badge / barChart 未動。 |
| `src/components/provider-card-metric-line.test.tsx`（新） | 斷言 label `min-w-0 truncate` + `title`；value `flex-shrink-0 max-w-[70%] truncate`、無 `max-w-[45%]`、有 `title`。 |
| `_ct-workorders/assets/T0050/metric-text-278px.png` | 寬度量測截圖（OLD/NEW 對照）。合成頁面，無 token / email / 帳號 ID。 |

### 驗證

| Gate | 指令 | 結果 | 證據 |
|---|---|---|---|
| test | `bun run test --run` | PASS | 70 files / 1200 tests passed（T0048 基準 69 / 1199 + 本單 1 檔 1 測試） |
| build | `bun run build` | PASS | exit 0（只有既有 chunk size 警告） |
| UI 寬度 | browser dev：Edge headless 載入 `dist/assets/index-CstkAU4v.css`，重建 text line 原 DOM/class，容器 278px | PASS | NEW（`max-w-[70%]` = 194.6px）：`$213.36 · 597M tokens` sw=cw=126、`$5165.74 · 13B tokens` 122、`Needs Node.js or Bun` 122、`需要 Node.js 或 Bun` 110，皆 `scrollWidth == clientWidth`。label `Yesterday` 54 / `昨天` 24 / `Last 30 Days` 70 / `過去 30 天` 56 / `Usage history` 77 / `用量歷史` 48，皆完整。對照 OLD（`max-w-[45%]` = 125px）：`$213.36 · 597M tokens` sw=126 cw=125 截斷，畫面「$213.36 · 597M toke…」與 BUG-014 一致，佐證量測準確。爆版測試：超長 value sw=282 → cw=195 截斷（70% 上限生效），label `過去 30 天` 仍完整。截圖 `_ct-workorders/assets/T0050/metric-text-278px.png`。 |
| runtime | 實機 smoke | 未執行 | 工單未要求；未停使用者 OpenUsage、未控制滑鼠、未動剪貼簿 |

### 偏差

- 只改一個 class：label 原本就是 `min-w-0 truncate` + `title`，value 原本就 `flex-shrink-0` + `title`，排版本來就是 label 先讓位，問題只在 45% 上限。
- 測試檔為工單指定的新檔 `provider-card-metric-line.test.tsx`（原本不存在）。
- 寬度驗證用 browser dev（Edge headless + 實際 CSS），非實機 WebView2；工單 gate 允許此做法（比照 T0048）。

### 阻礙

無。
