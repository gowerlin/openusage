---
schema_version: 1
schema_kind: workorder
id: T0035
title: Point about dialog credits and help link to fork
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-005
plan_id: null
created_at: "2026-10-15T11:50:06+08:00"
updated_at: "2026-10-15T11:51:17+08:00"
started_at: "2026-10-15T11:51:17+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0034
affects_files:
  - src/components/about-dialog.tsx
  - src/components/about-dialog.test.tsx
  - src/components/side-nav.tsx
  - src/components/side-nav.test.tsx
  - src/lib/i18n.ts
---

# T0035 Point About Dialog Credits And Help Link To Fork

## 背景

BUG-005 延伸：使用者截圖指出「關於」對話框的作者 / GitHub / 維護者，以及側邊欄 ❓ 說明鈕，仍指向上游 `robinebers/openusage`。使用者要求相關說明與連結改到我們的 repo。T0034 已處理 changelog（本單不碰 changelog 檔案）。

## 已定決策（使用者 2026-10-15 選擇，Worker 不得更改）

「關於」對話框顯示為：

```
原作者 Robin Ebers          ← 保留原作者署名與既有連結 https://itsbyrob.in/x
開源於 GitHub               ← 連結改 https://github.com/gowerlin/openusage
維護者：gowerlin            ← 連結 https://github.com/gowerlin；移除 validatedev / davidarny
```

- 側邊欄 ❓ 說明鈕（`side-nav.tsx` 約 L260）：`https://github.com/robinebers/openusage/issues` → `https://github.com/gowerlin/openusage/issues`。
- `LICENSE` 不改（MIT 要求保留 `Copyright (c) 2026 Robin Ebers`）。

## 任務指令

1. `src/lib/i18n.ts`：`about.builtBy` 文案改為表達「原作者」：
   - `en`：`"Originally by"`
   - `zh-TW`：`"原作者"`
   - key 名稱可維持 `about.builtBy`（避免多餘重命名）。`about.maintainers` 文案不變。
2. `src/components/about-dialog.tsx`：GitHub 連結改 fork；維護者清單改為單一 `gowerlin`（連 `https://github.com/gowerlin`），移除 validatedev / davidarny。
3. `src/components/side-nav.tsx`：Help 連結改 fork issues。
   - T0034 已在 `src/hooks/use-changelog.ts` 匯出 `GITHUB_REPO = "gowerlin/openusage"`；About / Help 的 repo URL 建議沿用此常數，不另建第二個常數。
4. 測試：
   - `about-dialog.test.tsx`：補 / 改斷言 GitHub 連結為 `gowerlin/openusage`、維護者為 `gowerlin`、不含 validatedev / davidarny。
   - `side-nav.test.tsx`：Help 點擊開啟 `gowerlin/openusage/issues`。
   - 若 i18n 有字典完整性測試，確認仍 PASS。

## 明確排除

- 不改 changelog 檔案（T0034 範圍）。
- 不改 `LICENSE`、`README.md`、`src-tauri/**`（含 `host_api.rs` 測試 fixture）。
- 不改 plugin、provider 相關 URL。
- 不發版、不 tag、不 push。

## 驗證 Gate

- PASS：`bun run test --run src/components/about-dialog.test.tsx src/components/side-nav.test.tsx`
- PASS：`bun run test --run`（全套）
- PASS：`bun run build`
- PASS：`grep -rn "robinebers\|validatedev\|davidarny" src --include=*.tsx --include=*.ts` 只剩測試 fixture 以外 0 筆（若有剩，回報區逐筆說明）
- 視覺變更：依 AGENTS.md，附 before / after 截圖（browser dev 模式開 About dialog 即可，en + zh-TW 各一）。存放路徑寫入回報區。
- `git diff --check` 無新 warning

Final gate：下次發行後使用者 App 內實測（使用者決定本次不發版）。

## 收尾

- Commit：只含本工單相關檔案 + 本工單回報區，message 以 `fix: point about dialog and help link to fork (T0035)` 開頭。
- 不 push。

## 回報區

### 結果：DONE

- 開始：2026-10-15T11:51:17+08:00（Worker，`CT_MODE=yolo`）
- Commit：見 frontmatter `commit`（message `fix: point about dialog and help link to fork (T0035)`），未 push。

### Landing check：WARN

- C-0：`repo` 欄位 absent → WARN（repo identity unavailable）；`basename(REPO_ROOT)` = `openusage`
- C-1：PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）
- C-3：PASS（5 個 `affects_files` 皆存在）
- C-2：無 `branch` 欄位；HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 改動

- `src/lib/i18n.ts`：`about.builtBy` en `"Built by"` → `"Originally by"`；zh-TW `"作者"` → `"原作者"`。key 不改；`about.maintainers` 不動。
- `src/components/about-dialog.tsx`：import `GITHUB_REPO`；GitHub 連結改 `` `https://github.com/${GITHUB_REPO}` ``；維護者改單一 `gowerlin`（`https://github.com/gowerlin`），移除 validatedev / davidarny。原作者 Robin Ebers 與 `https://itsbyrob.in/x` 保留。
- `src/components/side-nav.tsx`：import `GITHUB_REPO`；Help 改開 `` `https://github.com/${GITHUB_REPO}/issues` ``。
- `src/components/about-dialog.test.tsx`：mock 改 `importOriginal`（保留真實 `GITHUB_REPO`）；斷言 "Originally by"、Robin Ebers、`gowerlin`，且無 validatedev / davidarny；點擊 GitHub → `https://github.com/gowerlin/openusage`、gowerlin → `https://github.com/gowerlin`、Robin Ebers → `https://itsbyrob.in/x`。
- `src/components/side-nav.test.tsx`：Help 斷言改 `https://github.com/gowerlin/openusage/issues`。
- `src/App.test.tsx`（不在 `affects_files`，見偏差）：about 開關測試的文字 `"Built by"` → `"Originally by"`。
- `_ct-workorders/assets/T0035/*.png`：before / after 截圖。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| targeted tests | PASS | `about-dialog.test.tsx` + `side-nav.test.tsx`：2 files / 13 tests passed |
| `bun run test --run` | PASS | 64 files / 1139 tests passed（修 `App.test.tsx` 前為 1 failed：`App > covers about open/close callbacks` 找不到 "Built by"） |
| `bun run build` | PASS | exit 0；只有既有的 chunk > 500 kB 警告 |
| grep `robinebers\|validatedev\|davidarny`（src *.ts/*.tsx） | PASS | 只剩 2 筆，皆為 `about-dialog.test.tsx:35-36` 的「不存在」斷言（`queryByRole(...).not.toBeInTheDocument()`）；非測試碼 0 筆 |
| i18n 字典完整性 | PASS | 含在全套測試內；只改值未改 key |
| `git diff --check` | PASS | 無 whitespace 警告（只有既有 LF→CRLF 提示） |
| 視覺 before / after | PASS | browser dev（`bun run dev`，Vite :5199，非 Tauri，版本顯示 `v...` 屬正常）。在設定頁開 About 讓面板夠高、卡片置中後截圖 |
| Final gate | 待驗 | 下次發版後使用者 App 內實測（本次不發版） |

截圖路徑：

- `_ct-workorders/assets/T0035/before-en.png`（Built by / validatedev, davidarny）
- `_ct-workorders/assets/T0035/after-en.png`（Originally by / gowerlin）
- `_ct-workorders/assets/T0035/before-zh-TW.png`（作者 / validatedev, davidarny）
- `_ct-workorders/assets/T0035/after-zh-TW.png`（原作者 / gowerlin）

before 截圖做法：暫時 `git stash` `about-dialog.tsx` + `i18n.ts`，HMR 後截圖，再 `stash pop`；pop 後與備份逐 byte 比對一致。

### 偏差 / 阻塞

- 無阻塞。
- 偏差：改了 `src/App.test.tsx`（不在 `affects_files`）2 行文案斷言。原因：步驟 1 改 `about.builtBy` 文案直接讓這個既有測試失敗，全套 gate 要求 PASS；只改字串，沒動測試邏輯。
- 排除項（changelog 檔案、`LICENSE`、`README.md`、`src-tauri/**`、plugin / provider URL）未動。未發版、未 tag、未 push。
