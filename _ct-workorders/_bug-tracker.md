---
schema_version: 1
schema_kind: index
id: _bug-tracker
index_kind: bugs
generated_at: "2026-10-15T18:15:37+08:00"
generator: control-tower-sync
source_globs:
  - _ct-workorders/BUG-*.md
exclude_globs:
  - _ct-workorders/_archive/**
total: 15
breakdown:
  OPEN: 1
  FIXING: 0
  FIXED: 2
  VERIFY: 0
  CLOSED: 12
  WONTFIX: 0
---

# Bug Tracker

> 此文件由 `*sync` 自動生成，請勿手動編輯。
> 已歸檔單據（BUG-001~003）見 `_archive/bugs/`；不計入本索引。

## 統計
- Open: 1 | Fixing: 0 | Fixed: 2 | Verify: 0 | Closed: 12 | Won't Fix: 0 | **Total: 15**

## Open

| ID | 標題 | 嚴重度 | 建立時間 | 連結 |
|----|------|--------|---------|------|
| BUG-017 | Copilot cannot read the gh token on Windows | 🟡 Medium | 2026-10-15T17:20:06+08:00 | [BUG-017-copilot-windows-gh-token.md](BUG-017-copilot-windows-gh-token.md) |

## Fixing

| ID | 標題 | 嚴重度 | 建立時間 | 連結 |
|----|------|--------|---------|------|

## Fixed

| ID | 標題 | 嚴重度 | 修復時間 | 連結 |
|----|------|--------|---------|------|
| BUG-016 | Panel can extend below the screen right after dragging low | 🟢 Low | 2026-10-15T18:15:37+08:00 | [BUG-016-panel-overflows-screen-after-drag.md](BUG-016-panel-overflows-screen-after-drag.md) |
| BUG-018 | panel-window-trace.log startup line contains the Windows user name | 🟢 Low | 2026-10-15T18:15:37+08:00 | [BUG-018-trace-log-user-path.md](BUG-018-trace-log-user-path.md) |

## Verify

| ID | 標題 | 嚴重度 | 驗證時間 | 連結 |
|----|------|--------|---------|------|

## Closed

| ID | 標題 | 嚴重度 | 關閉時間 | 連結 |
|----|------|--------|---------|------|
| BUG-004 | App allows multiple running instances | 🟡 Medium | 2026-10-15T11:41:34+08:00 | [BUG-004-multiple-instances-allowed.md](BUG-004-multiple-instances-allowed.md) |
| BUG-005 | In-app changelog reads upstream releases instead of fork | 🟡 Medium | 2026-10-15T12:24:49+08:00 | [BUG-005-changelog-reads-upstream-releases.md](BUG-005-changelog-reads-upstream-releases.md) |
| BUG-006 | Usage Trend and ccusage history do not render on Windows | 🟡 Medium | 2026-10-15T16:28:34+08:00 | [BUG-006-usage-trend-ccusage-runner-windows.md](BUG-006-usage-trend-ccusage-runner-windows.md) |
| BUG-007 | Panel window shows a taskbar button on Windows | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-007-panel-taskbar-button-windows.md](BUG-007-panel-taskbar-button-windows.md) |
| BUG-008 | Panel does not auto-hide when it loses focus on Windows | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-008-panel-not-hidden-on-blur-windows.md](BUG-008-panel-not-hidden-on-blur-windows.md) |
| BUG-009 | Log redaction does not mask Windows user paths | 🟡 Medium | 2026-10-15T16:28:34+08:00 | [BUG-009-host-api-windows-path-redaction.md](BUG-009-host-api-windows-path-redaction.md) |
| BUG-010 | ccusage runner on Windows leaves child processes on timeout and tries yarn classic | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-010-ccusage-windows-process-robustness.md](BUG-010-ccusage-windows-process-robustness.md) |
| BUG-011 | Usage history silently disappears when no ccusage runner is available | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-011-usage-history-silent-when-no-runner.md](BUG-011-usage-history-silent-when-no-runner.md) |
| BUG-012 | Release build loads plugins from the working directory | 🟡 Medium | 2026-10-15T16:28:34+08:00 | [BUG-012-release-loads-plugins-from-cwd.md](BUG-012-release-loads-plugins-from-cwd.md) |
| BUG-013 | Panel occasionally stays open when blur arrives only as WM_NCACTIVATE | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-013-panel-blur-missed-without-focused-false.md](BUG-013-panel-blur-missed-without-focused-false.md) |
| BUG-014 | Long text metric values are truncated in provider detail | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-014-metric-text-value-truncated.md](BUG-014-metric-text-value-truncated.md) |
| BUG-015 | Settings panel taller than the Windows work area | 🟢 Low | 2026-10-15T16:28:34+08:00 | [BUG-015-settings-page-exceeds-work-area.md](BUG-015-settings-page-exceeds-work-area.md) |

## Won't Fix

| ID | 標題 | 嚴重度 | 標記時間 | 連結 |
|----|------|--------|---------|------|
