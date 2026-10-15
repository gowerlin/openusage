---
schema_version: 1
schema_kind: workorder
id: T0040
title: Windows runtime smoke + local NSIS package for 0.6.29
status: PENDING
priority: High
type: verification
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T12:39:32+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0038
  - T0039
affects_files: []
---

# T0040 Windows Runtime Smoke + Local NSIS Package For 0.6.29

## 背景

PLAN-004：T0038（merge + i18n）、T0039（Devin Windows）完成後，在發行前驗證 Windows runtime 沒有退步。T0037 報告「殘留風險」：NSIS 打包、CI、Devin / Antigravity runtime 皆未驗證。

## 任務指令

1. 本機 NSIS 打包：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`。
   - 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH` + `CI=false`；從 PowerShell `cmd.exe /c`。
   - 本機無 `TAURI_SIGNING_PRIVATE_KEY`，產出 installer 後 exit 1 屬預期（只缺 `.sig`）。
   - 記錄 installer path / size / SHA256 / LastWriteTime。
2. Runtime smoke（執行 release `openusage.exe`；可搭配 `panel-window-trace.log` 與 `OpenUsage.log`）。逐項記錄 PASS / FAIL / 無法驗證：
   - Panel：顯示 / 隱藏、不規則透明遮罩、拖曳與位置記憶、**deactive 後無 native title bar**（BUG-001 回歸）。
   - Single-instance：第二次啟動 → process 數 = 1、面板到前景（BUG-004 回歸）。
   - 背景 shell 不跳 console 視窗（BUG-002 回歸）。
   - Tray：圖示為 desktop icon（BUG-003 回歸）；新選單 **Copy Log Path** 複製的是 Windows 路徑（`%LOCALAPPDATA%\com.sunstory.openusage\logs\...` 或實際 app_log_dir），不是 `~/Library/...`。
   - Settings：新 Metric（Default / Weekly）區塊在 zh-TW 下為中文；切 Weekly 後 tray tooltip 正常。
   - Overview：**無退休橫幅**；Usage Trend 圖可渲染（有資料的 provider）。
   - About / ❓ / 變更紀錄：仍指向 `gowerlin/openusage`（BUG-005 回歸）。
   - Providers：Gemini 仍在且可運作或給出既有 Windows 行為；Devin 依 T0039 行為；舊 Windsurf plugin 目錄在啟動後被清除（若本機有）。
   - i18n / theme：zh-TW 與 macaron 主題切換仍正常。
3. 截圖：Settings Metric 區塊（zh-TW）、Overview（含 Usage Trend）、About dialog —— 存 `_ct-workorders/assets/T0040/`。
4. 若發現 FAIL：**不修**，回報 PARTIAL / FAILED 並附證據，由塔台開修正工單。

## 明確排除

- 不改程式碼、不 push、不 tag、不發行。
- 不安裝到使用者正式環境以外的位置（直接跑 build 出來的 exe 即可）；smoke 結束關閉 process。

## 驗證 Gate

- PASS：NSIS installer 產出
- PASS：上列 smoke 項目全部 PASS（無法驗證者需說明原因，不算 PASS）

## 收尾

- Commit：只含回報區 + 截圖，`docs: windows smoke for 0.6.29 (T0040)`。不 push。

## 回報區

（Worker 填寫：狀態、installer 資訊、smoke 逐項結果表、截圖路徑、FAIL 證據）
