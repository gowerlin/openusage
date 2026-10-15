---
schema_version: 1
schema_kind: bug
id: BUG-005
title: In-app changelog reads upstream releases instead of fork
status: FIXED
severity: Medium
created_at: "2026-10-15T11:48:01+08:00"
updated_at: "2026-10-15T12:04:57+08:00"
related_workorder: T0034, T0035
affects_files:
  - src/hooks/use-changelog.ts
  - src/hooks/use-changelog.test.tsx
  - src/components/changelog-dialog.tsx
  - src/components/changelog-dialog.test.tsx
  - src/components/about-dialog.tsx
  - src/components/side-nav.tsx
  - src/lib/i18n.ts
  - src/App.test.tsx
depends_on: []
---

# BUG-005 In-App Changelog Reads Upstream Releases Instead Of Fork

## 問題描述

使用者要求 App 內看得到 fork 發行的更新說明。塔台查證（2026-10-15）：

- App updater（`src/hooks/use-app-update.ts`）不顯示 `latest.json` 的 `notes`；補 `latest.json` 無實際效果（使用者已選擇不處理）。
- App 內更新說明對話框資料來自 `src/hooks/use-changelog.ts:13` → `api.github.com/repos/robinebers/openusage/releases/tags/<version>`（上游）。
- 上游也有同名 tag（如 `v0.6.26`），因此 fork 使用者看到的是**上游**的發行說明，而非 fork 的。
- `src/components/changelog-dialog.tsx` 的 PR / commit / Releases 連結也指向 `robinebers/openusage`。

## 範圍擴充（2026-10-15 使用者截圖）

- 「關於」對話框：原作者 Robin Ebers 保留；GitHub 連結改 fork；維護者改 gowerlin，移除 validatedev / davidarny（T0035）。
- 側邊欄 ❓ 說明鈕：改 fork issues（T0035）。

## 驗收條件

- [x] Changelog API 讀取 `gowerlin/openusage` releases。（T0034 `a6c52aa`）
- [x] Changelog dialog 的 PR / commit / Releases 連結指向 `gowerlin/openusage`。（T0034）
- [x] About dialog 署名 / GitHub 連結、side-nav Help 連結改指向 fork（T0035 `353c412`）。
- [x] Tests 更新並 PASS。（全套 64 files / 1139 tests）
- [ ] 下次發行後使用者在 App 內確認看到 fork 的發行說明（使用者決定本次不發版）。

## 回報區

### 修復狀態
FIXED（2026-10-15T12:04:57+08:00）：T0034 `a6c52aa`（changelog）+ T0035 `353c412`（About 署名 / GitHub、Help issues）。非測試碼已無 `robinebers` / validatedev / davidarny。截圖：`_ct-workorders/assets/T0035/`。待下次發行後使用者 App 內實測再 CLOSED。
