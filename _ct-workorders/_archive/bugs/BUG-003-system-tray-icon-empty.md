---
schema_version: 1
schema_kind: bug
id: BUG-003
title: System tray icon should use desktop icon
status: CLOSED
severity: Low
created_at: "2026-05-24T17:03:28+08:00"
updated_at: "2026-05-24T19:23:00+08:00"
related_workorder: T0024
affects_files:
  - src-tauri/src/tray.rs
  - src/hooks/app/use-tray-icon.ts
  - src/App.test.tsx
depends_on: []
---

# BUG-003 System Tray Icon Should Use Desktop Icon

## 問題描述

使用者回報 Windows System Tray icon 顯示為空白 / 不明顯，應使用與 Desktop Icon 一樣的圖示。

2026-05-24 追加實測回報：啟動瞬間可看到青綠色 OpenUsage desktop icon，但 React app 啟動後 tray icon 馬上變黑。

## 根因

- Tray 原本載入獨立的 `icons/tray-icon.png`。
- Tray icon 設成 `icon_as_template(true)`，在 Windows 上會以 template icon 方式顯示，容易變成空白或接近不可見。
- T0023 修正 Rust 初始 tray icon 後，前端 `useTrayIcon` 仍會在 app 啟動後呼叫 `tray.setIcon(...)` / `setIconAsTemplate(true)`，把 Rust 初始 desktop icon 覆寫成黑色動態 tray glyph。

## 修復策略

- 改用與 bundle desktop icon 同組的 `icons/32x32.png`。
- 使用 `Image::from_bytes(include_bytes!(...))` 內嵌圖示，避免 resource path 不一致。
- 關閉 `icon_as_template`，保留彩色桌面圖示。
- Windows 平台前端不再覆寫 tray icon，保留 Rust 建立的 desktop icon；macOS 原有動態 menubar icon 行為維持。

## 驗收條件

- [x] Tray icon source 改為 desktop icon set 的 PNG。
- [x] Tray icon 不再使用 template mode。
- [x] Windows 前端不再在啟動後覆寫 desktop tray icon。
- [x] 本機 Windows NSIS installer 可成功產出。
- [x] 使用者重新安裝後確認 System Tray icon 啟動後維持 OpenUsage desktop icon，不再變黑。

## 回報區

### 修復狀態
CLOSED

### 驗證紀錄

- `bun run test --run src/App.test.tsx -t "keeps the desktop tray icon on Windows"`：先 RED，確認會抓到前端覆寫 tray icon；修正後 PASS。
- `bun run test --run src/App.test.tsx`：PASS，79 tests。
- `bun run test --run`：PASS，64 files / 1139 tests。
- `bun run build`：PASS，Vite chunk size warning only。
- `cargo test --lib`：PASS，108 tests。
- 本機 NSIS package build：PASS，產出 `src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`，檔案大小 5,271,834 bytes，LastWriteTime 2026-05-24 17:51:13。
- `git diff --check`：PASS，只有既有 LF→CRLF warning。
- 使用者安裝版驗收：PASS，System Tray icon 正確。
- 使用者追加確認：2026-05-24T19:23:00+08:00 回報 BUG-003 驗收通過。

### 回報時間
2026-05-24T19:23:00+08:00
