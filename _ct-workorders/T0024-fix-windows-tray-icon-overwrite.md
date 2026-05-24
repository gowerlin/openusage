---
schema_version: 1
schema_kind: workorder
id: T0024
title: Fix Windows tray icon overwritten after startup
status: DONE
priority: Low
type: bugfix
bug_id: BUG-003
plan_id: null
created_at: "2026-05-24T17:51:46+08:00"
updated_at: "2026-05-24T17:51:46+08:00"
started_at: "2026-05-24T17:45:46+08:00"
completed_at: "2026-05-24T17:51:46+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0023
affects_files:
  - src/hooks/app/use-tray-icon.ts
  - src/App.test.tsx
---

# T0024 Fix Windows Tray Icon Overwritten After Startup

## 背景

使用者安裝測試回報：啟動瞬間可看到青綠色 OpenUsage desktop icon，但 app 啟動後 tray icon 馬上變黑。

## 根因

T0023 已修 Rust 初始 tray icon；但 React `useTrayIcon` 啟動後仍會 render provider / usage bars icon，並呼叫 `tray.setIcon(...)` 與 `tray.setIconAsTemplate(true)`，覆寫 Rust 建立的 desktop icon。Windows 上該動態 glyph 會顯示為黑色。

## 修復摘要

- `src/hooks/app/use-tray-icon.ts` 新增 Windows 平台判斷。
- Windows 取得 tray handle 後不再執行前端 `setIcon` / `setIconAsTemplate`，保留 Rust 初始 desktop icon。
- macOS / 非 Windows 原有動態 menubar icon 行為維持。
- `src/App.test.tsx` 新增 Windows 回歸測試，確認不會覆寫 desktop tray icon。

## 驗證

- RED：`bun run test --run src/App.test.tsx -t "keeps the desktop tray icon on Windows"`，確認現況會呼叫 `renderTrayBarsIcon`。
- PASS：`bun run test --run src/App.test.tsx -t "keeps the desktop tray icon on Windows"`。
- PASS：`bun run test --run src/App.test.tsx`，79 tests。
- PASS：`bun run test --run`，64 files / 1139 tests。
- PASS：`bun run build`，Vite chunk size warning only。
- PASS：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis --config "%TEMP%\openusage-tauri-no-updater.json"` under `VsDevCmd.bat -arch=x64` + `LIBCLANG_PATH`。
- PASS：`git diff --check`，只有既有 LF→CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,271,834 bytes
- LastWriteTime：2026-05-24 17:51:13

## 驗收狀態

- Source / tests / package build：DONE。
- 安裝版視覺驗收：待使用者重新安裝後確認 tray icon 不再由青綠色變黑。

## 回報區

### 完成狀態
DONE

### 回報時間
2026-05-24T17:51:46+08:00
