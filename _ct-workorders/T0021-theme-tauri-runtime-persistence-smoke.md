---
schema_version: 1
schema_kind: workorder
id: T0021
title: Theme Tauri runtime persistence smoke
status: DONE
priority: Medium
type: verification
plan_id: PLAN-003
created_at: "2026-05-24T15:35:59+08:00"
updated_at: "2026-05-24T15:49:49+08:00"
started_at: "2026-05-24T15:38:09+08:00"
completed_at: "2026-05-24T15:49:49+08:00"
commit: be029ba499d41b5c7e6b68a9da84392d580bd543
agent: codex
terminal_id: 79264ba994057240b1e0bf4a5b3f22c7
intervention_type: fire-and-forget
depends_on:
  - T0020
affects_files:
  - _ct-workorders/PLAN-003-add-macaron-theme-presets.md
  - _ct-workorders/T0021-theme-tauri-runtime-persistence-smoke.md
  - source/test files only if runtime smoke finds a direct theme persistence regression
---

# T0021 Theme Tauri Runtime Persistence Smoke

## 背景

T0020 已完成 browser visual smoke、screenshots，並修復 compact viewport theme selector 文字重疊。T0020 保持 PARTIAL 的唯一關鍵缺口是 browser dev server 不是 Tauri runtime，無法驗證 theme selection 在 reload / app restart 後由 Tauri Store 真正保持。

## 任務

補上 PLAN-003 最後 runtime gate：在 Tauri runtime 內驗證三個 macaron themes 的 persistence。

## 前置文件

開始前讀取：

- `AGENTS.md`
- `_ct-workorders/PLAN-003-add-macaron-theme-presets.md`
- `_ct-workorders/T0020-theme-visual-verification-closeout.md`
- `_ct-workorders/T0017-i18n-tauri-runtime-persistence-smoke.md`
- `package.json`
- theme persistence 相關 source / tests：
  - `src/lib/settings.ts`
  - `src/hooks/app/use-settings-bootstrap.ts`
  - `src/hooks/app/use-settings-display-actions.ts`
  - `src/hooks/app/use-settings-theme.ts`
  - `src/pages/settings.tsx`

## 驗證要求

1. 啟動 Tauri runtime。
   - 優先使用 `bun run tauri dev`。
   - 可沿用 T0017 的 Windows runtime pattern：VS Dev Cmd、`LIBCLANG_PATH`、temporary config identifier，例如 `com.sunstory.openusage.t0021`，以隔離 real app data。
   - 可用 packaged app smoke，但需記錄 executable / artifact。
   - 不得用純 `bun run dev` / localhost browser 當作 persistence 驗收。
2. Runtime guard。
   - 驗證 WebView 內有 Tauri internals / Tauri API 可用。
   - 記錄 app data dir 或 settings file location，避免污染真實使用者 settings。
3. Theme persistence smoke。
   - 在 Settings 選 `macaron-pink`，確認 root class / selected option 立即更新，reload WebView 或重啟 app 後仍保持。
   - 對 `macaron-green` 重複同樣驗證。
   - 對 `macaron-blue` 重複同樣驗證。
   - 可接受用 store file 內容輔助證明，但需搭配 runtime UI / root class reload 後結果。
4. 若 runtime smoke PASS：
   - 將 T0021 標記 DONE。
   - 將 PLAN-003 收斂為 DONE，填 completion time。
5. 若 runtime smoke FAIL：
   - 先區分是環境 BLOCKED 還是真實 regression。
   - 環境問題：T0021 標 BLOCKED / PARTIAL，PLAN-003 保持 IN_PROGRESS。
   - 真實 regression：允許做最小修復，補 focused tests，再重跑 `bun run build` 與 runtime smoke。

## 不做

- 不新增 theme preset。
- 不重做 visual design。
- 不重跑完整 browser screenshots，除非 runtime smoke 發現視覺 regression。
- 不處理 release workflow / updater。
- 不處理 BUG-001 / BUG-002。

## 預期產出

- Tauri runtime theme persistence 結論。
- 每個 macaron theme 的 reload / restart persistence 證據。
- 必要時的小型 persistence regression fix 與 focused verification。
- PLAN-003 final DONE 或明確剩餘缺口。

## 驗收條件

- [x] Tauri runtime 可啟動，或阻擋原因已明確記錄。
- [x] Runtime guard 確認不是純 browser。
- [x] `macaron-pink` reload / restart 後保持。
- [x] `macaron-green` reload / restart 後保持。
- [x] `macaron-blue` reload / restart 後保持。
- [x] 若修改 source，focused tests / `bun run build` 通過。（未修改 source，不適用）
- [x] PLAN-003 狀態依 runtime smoke 結論收斂。

## Sub-session 執行指示

> 開始前填 `started_at`。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟

1. 讀取本工單全部內容。
2. 更新 `started_at` / `agent`。
3. 載入前置文件。
4. 啟動隔離的 Tauri runtime。
5. 執行三個 macaron themes persistence smoke。
6. 必要時做最小修復與 focused verification。
7. 更新 T0021、PLAN-003、塔台相關索引。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯。

### 完成狀態

DONE

### 產出摘要

- Tauri runtime theme persistence smoke PASS。
- 使用隔離 Tauri identifier `com.sunstory.openusage.t0021`，app data 寫入 `C:\Users\Gower\AppData\Roaming\com.sunstory.openusage.t0021\settings.json`，未污染正式 `com.sunstory.openusage`。
- Runtime smoke 只產生驗證 artifacts，未修改 source/test files。
- PLAN-003 已依 runtime smoke 結論收斂為 DONE。
- Commit：`be029ba499d41b5c7e6b68a9da84392d580bd543` (`docs(theme): record T0021 runtime smoke`)。

### 驗證

- PASS：Tauri runtime 啟動；stdout 顯示 `OpenUsage v0.6.24 starting` 與 `app_data_dir: tail=com.sunstory.openusage.t0021`。
- PASS：Tauri WebView CDP target `http://127.0.0.1:9222/json/list` returned page `OpenUsage` at `http://127.0.0.1:1421/`。
- PASS：Runtime guard returned `hasTauriInternals: true` and `isTauriGlobal: true`。
- PASS：`macaron-pink` click + reload persistence；root class `theme-macaron-pink`，selected radio `true`，store `themeMode: "macaron-pink"`。
- PASS：`macaron-green` click + reload persistence；root class `theme-macaron-green`，selected radio `true`，store `themeMode: "macaron-green"`。
- PASS：`macaron-blue` click + reload persistence；root class `theme-macaron-blue`，selected radio `true`，store `themeMode: "macaron-blue"`。
- PASS：Screenshot sanity；5 PNG artifacts are non-zero size.
- Artifacts：
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\runtime-smoke-result.json`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\settings-before-theme.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\settings-macaron-pink-after-click.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\settings-macaron-green-after-click.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\settings-macaron-blue-after-click.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0021-20260524-154122\settings-macaron-blue-after-reload.png`

### 遭遇問題

- lean-ctx shell is bash-backed in this repo; Windows process / Visual Studio checks were run through PowerShell instead.
- `C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Auxiliary\Build\VsDevCmd.bat` was absent; actual working developer shell path was `C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat`.
- Initial CDP smoke waited for visible body text `Settings`, but Settings is an icon button with `aria-label="Settings"`; adjusted the smoke guard to query the aria label and reran successfully.

### 互動紀錄

無

### Renew 歷程

無

### 回報時間

2026-05-24T15:46:01+08:00
