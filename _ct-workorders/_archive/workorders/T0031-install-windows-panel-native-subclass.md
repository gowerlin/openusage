---
schema_version: 1
schema_kind: workorder
id: T0031
title: Install Windows panel native subclass
status: DONE
priority: High
type: bugfix
bug_id: BUG-001
plan_id: null
created_at: "2026-05-24T19:14:36+08:00"
updated_at: "2026-05-24T19:14:36+08:00"
started_at: "2026-05-24T19:05:00+08:00"
completed_at: "2026-05-24T19:14:36+08:00"
commit: null
agent: codex
intervention_type: direct
depends_on:
  - T0030
affects_files:
  - src-tauri/Cargo.toml
  - src-tauri/src/panel_hit_test.rs
---

# T0031 Install Windows Panel Native Subclass

## 背景

T0030 移除 `set_ignore_cursor_events(...)` 後，使用者安裝測試仍發現其他途徑會出現 Windows native title bar。

## 研究結論

- Microsoft DWM custom frame 文件指出，移除標準 window frame 的根層做法是處理 `WM_NCCALCSIZE` 並讓整個 window 成為 client area。
- Microsoft `WM_NCACTIVATE` 文件指出，`DefWindowProc` 會在 active / inactive 狀態切換時繪製 title bar 或 icon title；這符合使用者回報的 deactive 觸發。
- Tauri `decorations: false` 是高階設定；Windows transparent / custom frame 仍有 caveat，不能保證攔住所有 native non-client redraw path。

## LOG 根因

T0030 後 trace 已出現：

- `cursor_ignore_disabled native window region owns panel hit area`

但後續仍有：

- `Focused(false)`
- `chrome_style_pruned before_style=0x04CB0000 after_style=0x04000000`
- `chrome_style_pruned before_style=0x14CB0000 after_style=0x14000000`

因此 root cause 不是單一 Tauri API，而是 Windows / Tao 在 native non-client message 或 frame recalculation 時仍會寫回 / 重畫 chrome。

## 修復

- 新增 Windows `SetWindowSubclass` native subclass。
- `WM_NCCALCSIZE` 且 `wParam != 0` 時 return `0`，移除 standard frame。
- `WM_NCACTIVATE` return `1`，避免 `DefWindowProc` 重畫 inactive title bar。
- `WM_NCPAINT` return `0`，避免標準 non-client frame paint。
- `WM_STYLECHANGING` 若目標為 `GWL_STYLE`，直接修改 `STYLESTRUCT.styleNew`，在 style 寫入前移除 caption/system menu/frame/min/max bits。
- 保留既有 `SetWindowRgn`，它只負責不規則 panel + arrow region。

## 驗證

- RED：新增 subclass policy tests 後，`cargo test panel_hit_test::tests::subclass_policy --lib` 因 `windows_panel_subclass_policy` 不存在失敗。
- GREEN：補實作後同命令 PASS，3 tests。
- PASS：`cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check`。
- PASS：`cargo test panel_hit_test --lib`，10 tests。
- PASS：`cargo test --lib`，110 tests。
- PASS：本機 Windows NSIS package build。
- PASS：`git diff --check` exit 0；只有既有 CRLF warning。

## 產出

- Installer：`src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\OpenUsage_0.6.24_x64-setup.exe`
- Size：5,281,424 bytes
- SHA256：`4FEDB23E41083D63F1AF7ACC4939122B2D04AB0F9BBE94E62006A565E4BE1126`
- LastWriteTime：2026-05-24 19:14:24

## 狀態

Source / Rust tests / package build：DONE。

Final gate：等待使用者安裝新版後確認面板 deactive / focus 切換後不再出現 Windows native title bar / title controls。

DONE

2026-05-24T19:14:36+08:00
