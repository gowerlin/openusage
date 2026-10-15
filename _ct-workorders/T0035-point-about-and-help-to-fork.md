---
schema_version: 1
schema_kind: workorder
id: T0035
title: Point about dialog credits and help link to fork
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-005
plan_id: null
created_at: "2026-10-15T11:50:06+08:00"
updated_at: "2026-10-15T11:50:06+08:00"
started_at: null
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

（Worker 填寫：狀態、commit SHA、改動檔案、驗證證據、截圖路徑、阻塞）
