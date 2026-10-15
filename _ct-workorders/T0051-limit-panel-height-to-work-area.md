---
schema_version: 1
schema_kind: workorder
id: T0051
title: Keep panel within the Windows work area
status: PENDING
priority: Medium
type: bugfix
bug_id: BUG-015
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T15:22:35+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0050
affects_files:
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/panel.rs
---

# T0051 Keep panel within the Windows work area

## 背景

BUG-015：Settings 頁面板 1152px 高，在 1368px 工作區內面板下移後底部被工作列遮住；點到被遮處會點到工作列使面板收起。進 Settings 後存的位置被夾成 y=216。

塔台預查：`src/hooks/app/use-panel.ts:228` 高度上限 = `monitor.size.height * MAX_HEIGHT_FRACTION_OF_MONITOR`，用的是**整個螢幕**，未扣工作列、未考慮面板目前 y。

## 任務指令

1. 高度上限改用**工作區**：Tauri v2 `Monitor.workArea`（先確認 `@tauri-apps/api` 版本有此欄位並引用文件；沒有則由 Rust 端提供工作區給前端），上限 = 工作區底 − 面板目前 top − 小邊距（例如 8px），並保留既有比例上限取較小者。內容超出時面板內可捲動（現有 `maxPanelHeightPx` 應已支援，確認）。
2. **位置記憶**：只在使用者拖曳結束時儲存位置；高度變化或系統夾位置（clamp）時不覆寫 `panelPosition`。找出目前「進 Settings 後存成 y=216」的寫入點並修正。
3. macOS 行為不變（`currentMonitor` 路徑沿用；若改 Rust 只動 Windows `other` 模組）。
4. 補測試（上限計算抽純函式）。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo test --locked`（若動 Rust）、`bun run test --run`、`bun run build`
- PASS：實機（release exe，cwd `%TEMP%`）：把面板拖到偏下位置 → 開 Settings → 面板底部不被工作列遮住、內容可捲到「語言」；`panelPosition` 仍是拖曳時的值（不被改成夾過的 y）；關閉 Settings 回首頁高度恢復。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- Commit：`fix(windows): keep panel within work area and stop clamp overwriting position (T0051)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
