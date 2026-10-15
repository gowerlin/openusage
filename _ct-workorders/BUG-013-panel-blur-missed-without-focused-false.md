---
schema_version: 1
schema_kind: bug
id: BUG-013
title: Panel occasionally stays open when blur arrives only as WM_NCACTIVATE
status: CLOSED
severity: Low
created_at: "2026-10-15T14:53:32+08:00"
updated_at: "2026-10-15T16:28:34+08:00"
related_workorder: T0052
target_version: "0.6.30"
affects_files:
  - src-tauri/src/panel_blur.rs
  - src-tauri/src/panel_hit_test.rs
depends_on: []
---

# BUG-013 Panel occasionally stays open when blur arrives only as WM_NCACTIVATE

## 問題描述（T0044 觀察 1）

一次失焦未收起：trace 只有 `WM_NCACTIVATE(0)`（`message=0x0086 wparam=0x0`），沒有 `Focused(false)`。4 次刻意重現皆正常。建議在 `WM_NCACTIVATE(0)` / `WM_ACTIVATE(WA_INACTIVE)` 也觸發同一個 150ms 前景檢查。⚠️ 涉及 BUG-001 subclass 高風險區。

## 驗收條件

- [x] 只有 `WM_NCACTIVATE(0)` 的失焦路徑也會收起。
- [x] BUG-001 / BUG-008 不退步（trace 證據）。

## 回報區

### 修復狀態
CLOSED（2026-10-15T16:28:34+08:00）：使用者安裝 `v0.6.30` 實測通過（D092）。
FIXED：T0052 `585a34d1`。subclass 遇 `WM_NCACTIVATE(0)` 額外排程 `panel_blur::schedule_blur_check`（return 1 不變）；實機 61 次 NCACTIVATE(0) 皆排程、其中 23 次無 `Focused(false)` 仍收起；BUG-001 `has_chrome_bits=true` 0 次。待 T0053 與使用者實測。
