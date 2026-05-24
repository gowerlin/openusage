---
schema_version: 1
schema_kind: workorder
id: T0013
title: Hide terminal windows for background shell commands
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 09:42:46 +08:00"
started_at: "2026-05-24T09:46:10+08:00"
completed_at: "2026-05-24T09:55:02+08:00"
updated_at: "2026-05-24T09:55:02+08:00"
commit: null
bug_id: BUG-002
plan_id: null
sizing: medium
affects_files:
  - src-tauri/src/plugin_engine/host_api.rs
  - _ct-workorders/BUG-002-background-shell-window-visible.md
  - _ct-workorders/T0013-background-shell-hide-window.md
depends_on:
  - BUG-002
---

# T0013 Hide Terminal Windows For Background Shell Commands

## 元資料
- **工單編號**：T0013
- **任務名稱**：Hide terminal windows for background shell commands
- **狀態**：DONE
- **建立時間**：2026-05-24 09:42:46 (UTC+8)
- **開始時間**：2026-05-24T09:46:10+08:00
- **完成時間**：2026-05-24T09:55:02+08:00
- **目標子專案**：Tauri backend / process execution
- **關聯 BUG**：BUG-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src-tauri/src/plugin_engine/host_api.rs`
  - `_ct-workorders/BUG-002-background-shell-window-visible.md`
  - `_ct-workorders/T0013-background-shell-hide-window.md`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 shell/process 啟動 seam 分散，先抽出最小 Windows helper，套用到已確認背景 shell path，未涵蓋位置列為 PARTIAL 缺口。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要定位 Tauri backend 中所有背景 shell / child process 啟動 path，並執行 Windows-specific 驗證。

## 規格層級自問

- [x] **目標層**：執行。修復使用者回報的 Windows UX bug。
- [x] **決策權歸屬**：Worker 可自行選擇最符合現有 Rust/Tauri 程式碼的 helper seam。
- [x] **資訊完整度**：BUG-002 已描述預期/實際行為；Worker 需用 `rg` 定位 shell/process 啟動點。
- [x] **回頭成本**：中。process 啟動 helper 可能影響多個 provider / plugin path，需測試 stdout/stderr 與 exit status。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/BUG-002-background-shell-window-visible.md`
- `src-tauri/Cargo.toml`
- 相關 Tauri backend source / test 檔案，由 Worker 用 `rg` 定位：
  - `Command::new`
  - `std::process::Command`
  - `tokio::process::Command`
  - `cmd.exe`
  - `powershell`
  - `spawn`
  - `output`
  - `CREATE_NO_WINDOW`
  - `creation_flags`

### 輸入上下文

使用者回報：背景跑 shell 會出現終端視窗，應該隱藏。

目前目標是 Windows UX bug fix，不是 process architecture rewrite。請保持簡單，沿用現有 command execution pattern。

### 實作要求

1. 定位背景 shell / child process 啟動來源：
   - 找出 Windows 下可能跳出 console window 的 `std::process::Command` / `tokio::process::Command` 使用點。
   - 區分背景工作與使用者主動開啟互動 terminal；只修背景工作。
2. Windows 隱藏終端視窗：
   - Rust process seam 優先使用 `std::os::windows::process::CommandExt` 的 `creation_flags(CREATE_NO_WINDOW)`。
   - `CREATE_NO_WINDOW` 可用常數 `0x08000000`，或使用既有 Windows API binding。
   - 若有共用 command builder/helper，優先集中處理，避免每個 call site 複製。
3. 保留行為：
   - stdout/stderr / exit code 必須維持原本處理。
   - command failure 仍需明確回傳錯誤或 log，不得 silent fallback。
   - 非 Windows 行為不應變更。
4. Regression test：
   - 優先補 helper-level unit test，確認 Windows command builder 會套用隱藏視窗 flag。
   - 若無法直接檢查 OS window 行為，至少以可測 helper / platform-gated test 覆蓋。
5. 收尾：
   - 更新 T0013 回報區。
   - 若修復完成，將 BUG-002 狀態更新為 FIXED，並寫入驗證摘要與 commit。

### 不做

- 不新增重型 process manager。
- 不修改 release workflow 或 updater。
- 不隱藏使用者明確要求開啟的互動 terminal。
- 不重構無關 provider / plugin code。

## 預期產出

- Windows 背景 shell / child process 不再顯示 terminal window。
- 相關 regression test。
- BUG-002 closeout 狀態更新為 FIXED（若驗證通過）。
- T0013 回報區包含修改檔案、驗證命令、剩餘風險。

## 驗收條件

- [ ] Windows 背景 shell / child process 不出現可見終端視窗。
- [ ] stdout/stderr / exit status 保持可用。
- [ ] 錯誤仍 fail loud。
- [ ] 非 Windows build/test 不被破壞。
- [ ] 不影響使用者主動開啟互動 terminal 的功能。
- [ ] Regression test 通過。
- [ ] 相關 build/typecheck/test 通過；若無法執行 Windows runtime smoke，清楚回報原因。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件中的文件。
4. 用 `rg` 定位背景 shell / child process 啟動點。
5. 實作最小可用修復。
6. 執行 regression test 與必要驗證。
7. 更新 BUG-002 與 T0013 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
FIXED

### 產出摘要
- `src-tauri/src/plugin_engine/host_api.rs`：新增 Windows background command helper；Windows 下套用 `CommandExt::creation_flags(CREATE_NO_WINDOW)`。
- 套用範圍：env shell stdout command、`ccusage` runner availability check、`ccusage` query command config。
- 保留原 stdout/stderr/exit status path；非 Windows helper 為 no-op。
- `_ct-workorders/BUG-002-background-shell-window-visible.md`：更新修復狀態與驗證摘要。
- commit：待回填

### 驗證
- `cmd /c "...VsDevCmd.bat... && set LIBCLANG_PATH=... && cargo test windows_background_commands_use_create_no_window_flag --lib"`：RED，修復前因缺少 `CREATE_NO_WINDOW` helper 失敗。
- `cmd /c "...VsDevCmd.bat... && set LIBCLANG_PATH=... && cargo test windows_background_commands_use_create_no_window_flag --lib"`：PASS，1 test。
- `cargo fmt`：PASS。
- `cmd /c "...VsDevCmd.bat... && set LIBCLANG_PATH=... && cargo test plugin_engine::host_api::tests --lib"`：PASS，67 tests。
- `cmd /c "...VsDevCmd.bat... && set LIBCLANG_PATH=... && cargo check"`：PASS。
- `cmd /c "...VsDevCmd.bat... && set LIBCLANG_PATH=... && cargo test --lib"`：PASS，100 tests。

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
- 首次 `cargo test` 未設定 Visual Studio/Clang 環境時被 `rquickjs-sys`/`bindgen` 擋下；改用 `VsDevCmd.bat -arch=x64` + `LIBCLANG_PATH` 後通過。
- 未執行 packaged app 視覺 smoke；本次以 Windows-specific creation flag、helper-level regression test、Rust build/test 驗證。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T09:55:02+08:00
