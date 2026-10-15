---
schema_version: 1
schema_kind: workorder
id: T0030
title: Remove Windows panel cursor ignore toggle
status: DONE
priority: Medium
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T19:01:16+08:00"
updated_at: "2026-05-24T19:01:16+08:00"
started_at: "2026-05-24T18:52:00+08:00"
completed_at: "2026-05-24T19:01:16+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0029
affects_files:
  - src-tauri/src/panel_hit_test.rs
---

# T0030 Remove Windows Panel Cursor Ignore Toggle

## 背景

使用者在 T0029 安裝版驗收後補充：native title bar 不是滑鼠移出就出現，而是滑鼠點到別處、面板 deactive 時出現。

## 根因

T0029 trace 顯示 `window.set_ignore_cursor_events(...)` 在 transparent padding passthrough 切換時，會把 Windows decorated style bits 寫回 panel HWND：

- `cursor_ignore_changed ignore_cursor_events=true`
- 接著 `chrome_style_pruned before_style=0x14CB0000 after_style=0x14000000`

這表示 Tauri cursor-ignore API 本身就是 style 回寫來源之一；即使後續 prune，deactive / focus 轉換仍可能短暫顯示 native title bar。

## 修復

- 移除 Windows panel mask loop 裡的 `set_ignore_cursor_events(...)`。
- 移除 cursor position polling 與 `should_ignore_cursor_for_mask` helper。
- 將 `SetWindowRgn` region 改回精準 panel + arrow bounds，不再用 18px outset 擴張 shadow hit area。
- 保留可見期間 33ms chrome enforcement loop，作為其他 window-state style 回寫的保險。
- Trace 新增 `cursor_ignore_disabled`，標記目前透明 padding 由 native window region 負責。

## 驗證

- PASS：`cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，7 tests。
- PASS：`cargo test --lib`，107 tests。
- PASS：`rg "set_ignore_cursor_events|should_ignore_cursor|cursor_ignore_changed|WINDOW_REGION_OUTSET" src-tauri/src/panel_hit_test.rs` 無命中。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check` exit 0；只有既有 CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,287,033 bytes
- SHA256：`4084B52DC34F2FCD1AC4AFB0010B14A66BD771874AAC259C0E5D02845127431D`
- LastWriteTime：2026-05-24 19:01:05

## 狀態

Source / Rust tests / package build：DONE。

Final gate：等待使用者安裝新版後確認面板 deactive 時不再出現 Windows native title bar / title controls。

DONE

2026-05-24T19:01:16+08:00
