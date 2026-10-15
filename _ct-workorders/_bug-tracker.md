---
schema_version: 1
schema_kind: index
id: _bug-tracker
index_kind: bugs
generated_at: "2026-10-15T16:08:42+08:00"
generator: control-tower-sync
source_globs:
  - _ct-workorders/BUG-*.md
exclude_globs:
  - _ct-workorders/_archive/**
total: 13
breakdown:
  OPEN: 1
  FIXING: 0
  FIXED: 10
  VERIFY: 0
  CLOSED: 2
  WONTFIX: 0
---

# Bug Tracker

> 此文件由 `*sync` 自動生成，請勿手動編輯。
> 已歸檔單據（BUG-001~003）見 `_archive/bugs/`；不計入本索引。

## 統計
- Open: 1 | Fixing: 0 | Fixed: 10 | Verify: 0 | Closed: 2 | Won't Fix: 0 | **Total: 13**

## Open

| ID | 標題 | 嚴重度 | 建立時間 | 連結 |
|----|------|--------|---------|------|
| BUG-016 | Panel can extend below the screen right after dragging low | 🟢 Low | 2026-10-15T16:08:42+08:00 | [BUG-016-panel-overflows-screen-after-drag.md](BUG-016-panel-overflows-screen-after-drag.md) |

## Fixing

| ID | 標題 | 嚴重度 | 建立時間 | 連結 |
|----|------|--------|---------|------|

## Fixed

| ID | 標題 | 嚴重度 | 修復時間 | 連結 |
|----|------|--------|---------|------|
| BUG-013 | Panel occasionally stays open when blur arrives only as WM_NCACTIVATE | 🟢 Low | 2026-10-15T15:56:44+08:00 | [BUG-013-panel-blur-missed-without-focused-false.md](BUG-013-panel-blur-missed-without-focused-false.md) |
| BUG-015 | Settings panel taller than the Windows work area | 🟢 Low | 2026-10-15T15:33:39+08:00 | [BUG-015-settings-page-exceeds-work-area.md](BUG-015-settings-page-exceeds-work-area.md) |
| BUG-014 | Long text metric values are truncated in provider detail | 🟢 Low | 2026-10-15T15:26:47+08:00 | [BUG-014-metric-text-value-truncated.md](BUG-014-metric-text-value-truncated.md) |
| BUG-012 | Release build loads plugins from the working directory | 🟡 Medium | 2026-10-15T14:27:43+08:00 | [BUG-012-release-loads-plugins-from-cwd.md](BUG-012-release-loads-plugins-from-cwd.md) |
| BUG-011 | Usage history silently disappears when no ccusage runner is available | 🟢 Low | 2026-10-15T14:18:43+08:00 | [BUG-011-usage-history-silent-when-no-runner.md](BUG-011-usage-history-silent-when-no-runner.md) |
| BUG-010 | ccusage runner on Windows leaves child processes on timeout and tries yarn classic | 🟢 Low | 2026-10-15T14:07:49+08:00 | [BUG-010-ccusage-windows-process-robustness.md](BUG-010-ccusage-windows-process-robustness.md) |
| BUG-009 | Log redaction does not mask Windows user paths | 🟡 Medium | 2026-10-15T13:48:15+08:00 | [BUG-009-host-api-windows-path-redaction.md](BUG-009-host-api-windows-path-redaction.md) |
| BUG-008 | Panel does not auto-hide when it loses focus on Windows | 🟢 Low | 2026-10-15T13:41:38+08:00 | [BUG-008-panel-not-hidden-on-blur-windows.md](BUG-008-panel-not-hidden-on-blur-windows.md) |
| BUG-007 | Panel window shows a taskbar button on Windows | 🟢 Low | 2026-10-15T13:41:38+08:00 | [BUG-007-panel-taskbar-button-windows.md](BUG-007-panel-taskbar-button-windows.md) |
| BUG-006 | Usage Trend and ccusage history do not render on Windows | 🟡 Medium | 2026-10-15T13:29:13+08:00 | [BUG-006-usage-trend-ccusage-runner-windows.md](BUG-006-usage-trend-ccusage-runner-windows.md) |

## Verify

| ID | 標題 | 嚴重度 | 驗證時間 | 連結 |
|----|------|--------|---------|------|

## Closed

| ID | 標題 | 嚴重度 | 關閉時間 | 連結 |
|----|------|--------|---------|------|
| BUG-004 | App allows multiple running instances | 🟡 Medium | 2026-10-15T11:41:34+08:00 | [BUG-004-multiple-instances-allowed.md](BUG-004-multiple-instances-allowed.md) |
| BUG-005 | In-app changelog reads upstream releases instead of fork | 🟡 Medium | 2026-10-15T12:24:49+08:00 | [BUG-005-changelog-reads-upstream-releases.md](BUG-005-changelog-reads-upstream-releases.md) |

## Won't Fix

| ID | 標題 | 嚴重度 | 標記時間 | 連結 |
|----|------|--------|---------|------|
