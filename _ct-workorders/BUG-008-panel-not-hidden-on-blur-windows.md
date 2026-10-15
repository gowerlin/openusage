---
schema_version: 1
schema_kind: bug
id: BUG-008
title: Panel does not auto-hide when it loses focus on Windows
status: CLOSED
severity: Low
created_at: "2026-10-15T13:18:05+08:00"
updated_at: "2026-10-15T16:28:34+08:00"
related_workorder: T0043
affects_files:
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
depends_on: []
---

# BUG-008 Panel does not auto-hide when it loses focus on Windows

## 問題描述

T0040 觀察：Windows 上點面板以外的地方，面板不會收起，只會被其他視窗蓋住（macOS 版是失焦自動收起）。使用者決定修（2026-10-15，D074）。

## 驗收條件

- [ ] 面板失焦（點其他視窗 / 桌面）後自動隱藏。
- [ ] 點 tray icon 開關面板不會「剛收起又打開」閃爍。
- [ ] 拖曳面板、開啟面板內對話框 / 下拉選單時不會誤收。
- [x] 使用者安裝新版後實測。（`v0.6.30`）

## 回報區

### 修復狀態
CLOSED（2026-10-15T16:28:34+08:00）：使用者安裝 `v0.6.30` 實測通過（D092）。
FIXED：T0043 `05973976`。`Focused(false)` 後 150ms 以 `GetForegroundWindow` / `GA_ROOTOWNER` 判斷再 `hide_panel`；tray 500ms debounce。實機：點外收起、tray 連點無閃爍、拖曳 / About / Changelog / 右鍵選單 / 快捷鍵 / 第二次啟動皆正常；BUG-001 trace `has_chrome_bits=true` 0 次。已知限制：前景鎖擋下 `SetForegroundWindow` 時面板不會自動收起（未重現）。待 T0044 re-smoke 與使用者安裝實測。
