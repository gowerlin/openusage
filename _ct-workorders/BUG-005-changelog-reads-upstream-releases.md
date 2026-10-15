---
schema_version: 1
schema_kind: bug
id: BUG-005
title: In-app changelog reads upstream releases instead of fork
status: OPEN
severity: Medium
created_at: "2026-10-15T11:48:01+08:00"
updated_at: "2026-10-15T11:48:01+08:00"
related_workorder: T0034
affects_files:
  - src/hooks/use-changelog.ts
  - src/hooks/use-changelog.test.tsx
  - src/components/changelog-dialog.tsx
  - src/components/changelog-dialog.test.tsx
depends_on: []
---

# BUG-005 In-App Changelog Reads Upstream Releases Instead Of Fork

## 問題描述

使用者要求 App 內看得到 fork 發行的更新說明。塔台查證（2026-10-15）：

- App updater（`src/hooks/use-app-update.ts`）不顯示 `latest.json` 的 `notes`；補 `latest.json` 無實際效果（使用者已選擇不處理）。
- App 內更新說明對話框資料來自 `src/hooks/use-changelog.ts:13` → `api.github.com/repos/robinebers/openusage/releases/tags/<version>`（上游）。
- 上游也有同名 tag（如 `v0.6.26`），因此 fork 使用者看到的是**上游**的發行說明，而非 fork 的。
- `src/components/changelog-dialog.tsx` 的 PR / commit / Releases 連結也指向 `robinebers/openusage`。

## 驗收條件

- [ ] Changelog API 讀取 `gowerlin/openusage` releases。
- [ ] Changelog dialog 的 PR / commit / Releases 連結指向 `gowerlin/openusage`。
- [ ] Tests 更新並 PASS。
- [ ] 下次發行後使用者在 App 內確認看到 fork 的發行說明（使用者決定本次不發版）。

## 回報區

### 修復狀態
OPEN
