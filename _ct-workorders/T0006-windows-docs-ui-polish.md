---
schema_version: 1
schema_kind: workorder
id: T0006
title: Windows docs UI polish
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 00:45:12 +08:00"
started_at: "2026-05-24T00:48:38+08:00"
completed_at: "2026-05-24T00:58:04+08:00"
updated_at: "2026-05-24T00:58:04+08:00"
plan_id: PLAN-001
sizing: small
affects_files:
  - "README.md"
  - "docs/**/*"
  - "src/components/global-shortcut-section.tsx"
  - "src/**/*test*"
depends_on:
  - T0005
---

# T0006 Windows Docs UI Polish

## 元資料
- **工單編號**：T0006
- **任務名稱**：Windows docs UI polish
- **狀態**：DONE
- **建立時間**：2026-05-24 00:45:12 (UTC+8)
- **開始時間**：2026-05-24T00:48:38+08:00
- **完成時間**：2026-05-24T00:58:04+08:00
- **目標子專案**：docs / frontend
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0001, T0002, T0003, T0004, T0005
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `README.md`
  - `docs/**/*`
  - `src/components/global-shortcut-section.tsx`
  - `src/**/*test*`

## 工作量預估
- **預估規模**：小
- **Context Window 風險**：低
- **降級策略**：若 UI screenshot/runtime 需要 app launch 但環境不足，完成 source/docs/tests 並回報 PARTIAL，明確列出未驗證項。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：會改 docs/frontend polish，避免和塔台 context 混在一起。

## 規格層級自問

- [x] **目標層**：執行。目標是 Windows docs/UI polish，不是 release verification。
- [x] **決策權歸屬**：Worker 可修 docs 與小型 UI 文案；不可宣稱 Windows public release ready。
- [x] **資訊完整度**：T0001-T0005 已提供 Windows MVP 狀態與限制。
- [x] **回頭成本**：低。限定 docs/UI label。
- [x] **記憶覆蓋**：T0005 仍 PARTIAL，文案必須保留 release/signing 邊界。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0001-research-windows-porting.md`
- `_ct-workorders/T0005-windows-packaging-release-workflow.md`
- `AGENTS.md`
- `README.md`
- `docs/capture-logs.md`（若存在）
- `src/components/global-shortcut-section.tsx`（若存在）
- 相關 tests

### 輸入上下文

T0005 狀態是 PARTIAL：
- Windows NSIS packaging 本機通過。
- Updater `.sig/latest.json` 需要 `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 與 tag release 驗證。
- 不得把 Windows release 描述成「正式公開下載已可用」，除非 Worker 能從目前 repo/release artifact 證明。

### 範圍

必做：
1. 確認目前在 `feat/windows-port-mvp`；若不是，切換過去，不覆蓋使用者變更。
2. 更新 README 中的平台支援/下載文字：
   - 可描述 Windows MVP / Windows installer path 已建立。
   - 必須明確標示 Windows release artifact / updater verification 仍待 tag release/signing secret 驗證。
   - 不可新增不存在的下載連結。
3. 更新 log capture docs：
   - macOS log path 保留。
   - 補 Windows log path 或說明如何定位 Tauri/plugin logs。
4. 更新 shortcut display：
   - macOS 顯示 `Cmd` / `Opt`。
   - Windows/Linux 顯示 `Ctrl` / `Alt` 或 repo 既有平台判斷模式。
5. 補或更新 regression tests，避免 Windows UI/docs 行為回退。
6. 若有 UI 視覺變更，嘗試提供 before/after screenshot 或明確回報未能截圖的原因；目前不建立 PR。

不做：
- 不做 release workflow / installer/signing 修改。
- 不做 provider parity / Credential Manager / bundled sqlite。
- 不 push、不 PR、不 commit。
- 不宣稱 Windows public release 完成。

### 建議驗證命令

```powershell
bun run build
bun run test
bun run bundle:plugins
```

若改 Rust/Tauri config 才需要跑：

```powershell
cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'
```

### 預期產出

- README Windows wording aligned with current PARTIAL release state.
- Windows log docs.
- Platform-aware shortcut label.
- Tests / verification result.
- 下一步建議：T0007 release verification or closeout decision。

### 驗收條件

- [ ] README 沒有不存在的 Windows download claim。
- [ ] Windows release/signing/updater boundary 明確。
- [ ] Windows log path/docs 補齊或明確說明限制。
- [ ] Shortcut label 在 Windows 不顯示 macOS-only `Cmd` / `Opt`。
- [ ] 有測試或明確驗證。
- [ ] 未改 release workflow / installer/signing。
- [ ] 未 push / 未 PR / 未 commit。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
DONE

### 產出摘要
- 修改：`README.md`
  - Download 區改為 macOS auto-update 文字。
  - 新增 Windows MVP 邊界：NSIS installer build path 已在 source tree，但 public Windows release artifacts、updater `latest.json`、updater signatures 仍待 tag-release/signing secret 驗證。
  - 未新增不存在的 Windows 下載連結。
- 修改：`docs/capture-logs.md`
  - Platform 改為 macOS / Windows。
  - 保留 macOS `~/Library/Logs/com.sunstory.openusage`。
  - 補 Windows `%LOCALAPPDATA%\com.sunstory.openusage\logs` 與 fallback 定位方式。
- 修改：`src/components/global-shortcut-section.tsx`
  - Shortcut display 依 `navigator.platform` 顯示 macOS `Cmd` / `Opt`，Windows/Linux 顯示 `Ctrl` / `Alt`。
  - Tauri shortcut 儲存格式維持 `CommandOrControl` / `Alt`。
- 修改：`src/components/global-shortcut-section.test.tsx`
  - 新增 Windows persisted shortcut display regression。
  - 新增 Windows recording display regression。
- 修改：`src/App.test.tsx`
  - App 層既有 shortcut display 測試固定 macOS platform，避免 Windows runner 誤用 macOS 期望。
- 產出：`t0006-settings-shortcut-windows.png`
  - Vite browser screenshot，顯示 Windows shortcut label 為 `Ctrl + Alt + Slash`。
- 更新：`_ct-workorders/T0006-windows-docs-ui-polish.md`
- 未修改 release workflow / installer / signing。
- 未 push / 未 PR / 未 commit。

### Release boundary wording
README 明確描述 Windows 仍是 MVP：source tree 已有 Windows NSIS installer build path，但 public Windows release artifacts、updater `latest.json`、updater signatures 尚未經 tag-release/signing secret 驗證。README 仍只保留既有 releases/latest 連結，並未宣稱 Windows public release ready。

### UI / screenshot
有：`t0006-settings-shortcut-windows.png`。

說明：使用 Vite dev server + Playwright 開啟 Settings，設定 Windows shortcut 後畫面顯示 `Ctrl + Alt + Slash`。純瀏覽器環境缺 Tauri IPC，console 有 `Cannot read properties of undefined (reading 'invoke')` 類錯誤；此 screenshot 僅作 UI label proof，不視為完整 Tauri runtime smoke。

### 互動紀錄
無

### 驗證結果
- RED：`bun run test --run src/components/global-shortcut-section.test.tsx`
  - 預期失敗：2 tests failed，舊實作在 Windows 仍顯示 `Cmd + Opt`。
- PASS：`bun run test --run src/components/global-shortcut-section.test.tsx`
  - 13 tests passed。
- PASS：`bun run test --run src/App.test.tsx`
  - 78 tests passed。
- PASS：`bun run build`
  - `tsc && vite build` exit 0。
- PASS：`bun run test --run`
  - 61 files passed；1113 tests passed。
  - stderr 仍有既有 App tests 的 Tauri plugin-store `invoke` mock noise，但 exit 0。
- PASS：`bun run bundle:plugins`
  - Bundled 18 plugins。
- PASS：`git diff --check -- README.md docs/capture-logs.md src/components/global-shortcut-section.tsx src/components/global-shortcut-section.test.tsx src/App.test.tsx _ct-workorders/T0006-windows-docs-ui-polish.md`
  - exit 0；僅 CRLF warning。
- PASS：Playwright Vite screenshot smoke
  - `http://127.0.0.1:1420/` Settings screen captured as `t0006-settings-shortcut-windows.png`。

### 遭遇問題
- Browser plugin 需要的 Node REPL control tool 未暴露，改用可用的 Playwright fallback。
- Vite browser runtime 沒有 Tauri IPC，console 出現預期 `invoke` / `transformCallback` 類錯誤；未影響 UI label 截圖與 source/test 驗證。

### 建議下一步
T0007 release verification or closeout decision：用 tag release/signing secrets 驗證 Windows public artifacts、updater `.sig/latest.json` 與 release notes。

### sprint-status.yaml 已更新
不適用（repo root / `_bmad-output/` / `docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T00:58:04+08:00
