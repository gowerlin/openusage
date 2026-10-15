---
schema_version: 1
schema_kind: workorder
id: T0002
title: Windows Rust build baseline
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-23 23:00:20 +08:00"
started_at: "2026-05-23T23:34:26+08:00"
completed_at: "2026-05-23T23:47:56+08:00"
updated_at: "2026-05-23T23:47:56+08:00"
plan_id: PLAN-001
sizing: medium
affects_files:
  - "src-tauri/*"
  - "src-tauri/src/*"
  - "src-tauri/Cargo.toml"
  - "src-tauri/Cargo.lock"
depends_on:
  - T0001
---

# T0002 Windows Rust Build Baseline

## 元資料
- **工單編號**：T0002
- **任務名稱**：Windows Rust build baseline
- **狀態**：DONE
- **建立時間**：2026-05-23 23:00:20 (UTC+8)
- **開始時間**：2026-05-23T23:34:26+08:00
- **完成時間**：2026-05-23T23:47:56+08:00
- **目標子專案**：src-tauri
- **關聯 PLAN**：PLAN-001
- **基於研究工單**：T0001
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src-tauri/*`
  - `src-tauri/src/*`
  - `src-tauri/Cargo.toml`
  - `src-tauri/Cargo.lock`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 Windows Rust compile 被缺少 `libclang.dll` / `LIBCLANG_PATH` 擋住，停止 source 實作並回報 BLOCKED 或 PARTIAL，附最小安裝/設定步驟。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：此工單會讀寫 Rust/Tauri source，必須與塔台 context 隔離。

## 規格層級自問

- [x] **目標層**：執行。目標是讓 Windows `cargo check` baseline 可跑，或明確卡在外部 prerequisite。
- [x] **決策權歸屬**：Worker 可做最小 source/cfg 調整；不可做大型 plugin parity 重寫。
- [x] **資訊完整度**：T0001 回報已提供阻塞點與推薦方案。
- [x] **回頭成本**：中。限制在 Windows build baseline，不碰 release/signing/docs。
- [x] **記憶覆蓋**：本工單不得靜默安裝全域系統套件；缺工具時 fail loud。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0001-research-windows-porting.md`
- `AGENTS.md`
- `README.md`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- 其他 Tauri/Rust entrypoints（由 Worker 自行判斷）

### 輸入上下文

T0001 結論：推薦方案 A / Windows MVP。

目標不是一次完成 Windows parity；本工單只處理 Windows Rust build baseline：
- 建立或切換到 `feat/windows-port-mvp`。
- 隔離 macOS-only Rust dependencies/code path。
- 讓 Windows 可執行 `cargo check --manifest-path src-tauri/Cargo.toml`，或明確卡在外部 prerequisite。

重要限制：
- 可以修改 source。
- 可以建立/switch branch：`feat/windows-port-mvp`。
- 不要 commit，除非塔台後續明確要求。
- 不要靜默安裝全域系統套件（例如 LLVM）。若缺 `libclang.dll` / `LIBCLANG_PATH`，先搜尋既有安裝；找不到就回報 BLOCKED/PARTIAL 和精準安裝/設定命令。
- 不要處理 plugin host API parity、provider path audit、release workflow、docs/UI polish；那些留給後續 T0003+。

### 執行步驟

1. 更新本工單開始時間與狀態為 IN_PROGRESS。
2. 檢查目前 Git branch。
3. 若不在 `feat/windows-port-mvp`，建立或切換該分支。若分支已存在，切換到既有分支，不覆蓋使用者變更。
4. 重跑 preflight：
   - `bun install`
   - `bun run build`
   - `bun run test`
   - `cargo check --manifest-path src-tauri/Cargo.toml`
5. 若 `cargo check` 被 `libclang` 擋住：
   - 不做猜測性 source 大改。
   - 搜尋常見 LLVM 安裝位置。
   - 若可設定 `LIBCLANG_PATH` 並通過，記錄設定。
   - 若找不到，回報 BLOCKED 或 PARTIAL，附精準 install/setup 指令。
6. 若 `cargo check` 能跑到 source compile errors：
   - 做最小 `cfg(target_os = "macos")` / Windows fallback 調整。
   - 保留 macOS NSPanel 行為。
   - Windows fallback 使用普通 Tauri window 或明確 no-op，優先讓 compile pass。
7. 完成後填寫回報區，列出實際修改檔案與驗證結果。

### 預期產出

- Git branch：`feat/windows-port-mvp`。
- Windows Rust build baseline 修正，或外部 prerequisite blocker 的精準回報。
- 實際修改檔案清單。
- 下一張工單建議：T0003 host API / plugin support。

### 驗收條件

- [x] 已在 `feat/windows-port-mvp` 分支或清楚說明無法切換的原因。
- [x] `bun run build` 結果明確。
- [x] `bun run test` 結果明確。
- [x] `cargo check --manifest-path src-tauri/Cargo.toml` pass，或 BLOCKED/PARTIAL 且 blocker 是外部 prerequisite。
- [x] 沒有靜默 fallback；Windows unsupported path 必須 fail loud。
- [x] 未碰 release workflow、docs/UI polish、provider path audit。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Branch：`feat/windows-port-mvp`
- 修改：`src-tauri/Cargo.toml`
  - `tauri-nspanel` 移到 `target_os = "macos"` dependency，避免 Windows 編譯 macOS-only crate。
- 修改：`src-tauri/src/lib.rs`
  - `tauri_nspanel::init()` 僅在 macOS 註冊。
  - `hide_panel` 改走跨平台 `panel` API。
- 修改：`src-tauri/src/panel.rs`
  - macOS 保留 NSPanel 行為。
  - Windows/non-mac fallback 使用普通 Tauri window show/hide/focus。
  - 找不到 main window 時 `log::error!`，不靜默 fallback。
- 修改：`src-tauri/src/tray.rs`
  - tray click 改呼叫跨平台 `toggle_panel_at_tray_icon`。
- 更新：`_ct-workorders/T0002-windows-rust-build-baseline.md`
- 更新：`_ct-workorders/_tower-state.md`
- 更新：`_ct-workorders/PLAN-001-windows-port.md`
- 產生：`src-tauri/resources/bundled_plugins/*`（由 `bun run bundle:plugins` 產生；已被 `.gitignore` 忽略）
- Commit：未 commit（工單明確要求「不要 commit，除非塔台後續明確要求」）

### 互動紀錄
無

### 驗證結果
- PASS: `git switch -c feat/windows-port-mvp`
- PASS: `bun install`（no changes）
- PASS: `bun run build`
- PASS: `bun run test`（61 files / 1105 tests；有既有 Tauri store mock stderr，但 exit code 0）
- FAIL then resolved: `cargo check --manifest-path src-tauri/Cargo.toml`
  - 初次失敗：`Unable to find libclang`
  - 找到既有 libclang：`C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin\libclang.dll`
  - 單設 `LIBCLANG_PATH` 後仍失敗：`stdbool.h file not found`
  - 使用 VS x64 dev env 後進入 source compile error：`tauri-nspanel` Windows 編譯失敗
- PASS: `bun run bundle:plugins`（18 plugins）
- PASS: `cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'`
- INFO: `cargo fmt --manifest-path src-tauri/Cargo.toml --check` 仍會對既有未觸及檔案提出格式差異（`config.rs`、`local_http_api/*`、`webkit_config.rs`）；未納入本工單變更。

### 遭遇問題
- Windows shell 直接跑 `cargo check` 需要兩個環境前置：
  - VS Developer Command Prompt / `VsDevCmd.bat -arch=x64`
  - `LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin`
- Direct `cargo check` 不會執行 Tauri `beforeBuildCommand`，所以需要先跑 `bun run bundle:plugins`，否則會缺 `resources/bundled_plugins/**/*`。
- `git status` 顯示幾個 rustfmt touched 檔案為 modified，但 `git diff --name-only` 只有 4 個實際 source 內容變更檔案：`Cargo.toml`、`lib.rs`、`panel.rs`、`tray.rs`。

### 建議下一步
T0003：host API / plugin support Windows parity。

### sprint-status.yaml 已更新
不適用（未找到 `sprint-status.yaml`）

### 回報時間
2026-05-23T23:47:56+08:00
