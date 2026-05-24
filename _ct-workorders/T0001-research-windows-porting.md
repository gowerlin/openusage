---
schema_version: 1
schema_kind: workorder
id: T0001
title: Research Windows porting plan
status: DONE
type: research
interaction_mode: enabled
intervention_type: context-dependent
renew_count: 0
created_at: "2026-05-23 22:43:03 +08:00"
started_at: "2026-05-23T22:47:53+08:00"
completed_at: "2026-05-23T22:57:09+08:00"
updated_at: "2026-05-24T09:08:40+08:00"
plan_id: PLAN-001
sizing: medium
affects_files:
  - "無寫入"
depends_on:
  - PLAN-001
---

# T0001 Research Windows Porting Plan

## 元資料
- **工單編號**：T0001
- **任務名稱**：研究：Windows version porting plan
- **狀態**：DONE
- **類型**：research
- **互動模式**：enabled
- **Renew 次數**：0
- **建立時間**：2026-05-23 22:43:03 (UTC+8)
- **開始時間**：2026-05-23T22:47:53+08:00
- **完成時間**：2026-05-23T22:57:09+08:00
- **關聯 PLAN**：PLAN-001
- **intervention_type**：context-dependent
- **affects_files**：
  - `無寫入`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 context 不足，先完成阻塞點盤點與分支策略，回報 PARTIAL。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要讀取專案設定、建置腳本、Tauri/平台相關檔案，避免污染塔台 context。

## 研究目標

釐清 OpenUsage 移植到 Windows 版本的實際工作範圍，產出可拆成實作工單的決策結論。

## 已知資訊

- 使用者要求：「建立新分支, 實作 Windows 版本移植」。
- PLAN-001 已建立，優先級 High，類型架構調整。
- 目前本工單只做研究；不要修改 source，不要建立 branch，不要 commit。
- 專案 AGENTS.md 要求：簡單、精準、不要 over-engineer；錯誤處理 fail loud；研究優先使用技能與新資料。

## 調查範圍

- 目前 repo 的技術棧、package manager、build/test/package 指令。
- Tauri / Rust / Node / frontend 對 Windows 的平台差異。
- 現有 workflow / release / updater / installer 是否支援 Windows。
- Windows shell/path/signing/installer/icon/permissions 相關阻塞點。
- 是否已有跨平台抽象或只支援單一平台的假設。
- 建議分支名稱與基底分支。

## 研究指引

1. 先讀 `AGENTS.md`、`README.md`、package / Tauri / workflow 設定，不要改檔。
2. 若確認是 Tauri 專案，使用 `tauri-v2` / `tauri-development` skill 的規則判斷 Windows 移植點。
3. 若需要查官方文件，優先查 Tauri / Rust / GitHub Actions 官方文件；不要依賴過時記憶。
4. 盤點現況時區分：
   - 已支援 Windows
   - 需要小修
   - 需要架構決策
   - 需要人工環境或憑證
5. 提出 2-3 個可行方案，並推薦一個最小可行路徑。

## 互動規則

- Worker 可主動向使用者提問以縮小範圍。
- 每次提問不超過 3 個問題。
- 每個問題需提供選項 + 「其他：________」兜底。
- 互動紀錄必須寫入回報區。

## 預期產出

- Windows 移植阻塞點清單。
- 建議分支名稱與建立時機。
- 需要修改的檔案/模組候選清單。
- 建議拆出的後續實作工單列表。
- Windows 驗證命令建議：build / test / run / package。

## 驗收條件

- [x] 結論可決策，不只是調查紀錄。
- [x] 明確回答是否應先建立分支，建議分支名與基底。
- [x] 明確列出後續實作工單候選。
- [x] 明確列出 Windows runtime/build/package 驗證方式。
- [x] 若有外部限制，標成 BLOCK/PARTIAL，不得暗示已完成。

## 塔台收斂註記

**時間**：2026-05-24 09:08:40 (UTC+8)
**狀態調整**：PARTIAL → DONE
**理由**：本研究工單的可決策結論已被 PLAN-001 後續工單採用，Windows build/package/release blocker 已由 T0002-T0009 收斂完成。原回報區保留當時 `libclang` blocker 與 PARTIAL 證據。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
PARTIAL

### 產出摘要
- 修改：`_ct-workorders/T0001-research-windows-porting.md`
- 同步：`_ct-workorders/_tower-state.md`
- Source 修改：無
- Branch 建立：無
- Commit：未 commit（工單明示不要 commit）
- Git 狀態：`_ct-workorders/` 目前為 untracked；未自動加入 git index

### 互動紀錄
> [HH:MM] Q: <問題摘要> → A: <使用者回覆> → Action: <採取的行動>

無

### 調查結論
結論：可以移植，但不是「只加 Windows workflow」即可。最小可行路徑是先讓 Windows build/run 起來，先接受部分 provider 在 Windows 顯示明確 unsupported，再逐步補齊 plugin host API 與 provider 路徑。

現況分級：

- 已支援 Windows：
  - Tauri v2 / React / Vite / Bun 架構本身可支援 Windows。
  - 本機 `bun tauri info` 顯示 Windows host、WebView2、MSVC、Rust MSVC toolchain 均存在。
  - `src-tauri/src/main.rs` 已有 `windows_subsystem = "windows"`。
  - `tauri.conf.json` 已包含 `icons/icon.ico` 與 updater 設定。
  - `bun install`、`bun run build`、`bun run test` 可在本機 Windows 通過。

- 需要小修：
  - `README.md` 目前只標 macOS download；Windows 發版前需更新。
  - `docs/capture-logs.md` 只寫 macOS `~/Library/Logs/...`。
  - `src/components/global-shortcut-section.tsx` 顯示 `Cmd` / `Opt`，Windows 應顯示 `Ctrl` / `Alt`。
  - `scripts/build-release.sh` 是 Bash + DMG/app output；Windows 需要 PowerShell 或 workflow 直接跑 Tauri build。

- 需要架構決策：
  - `src-tauri/src/panel.rs` / `tray.rs` / `lib.rs` 強依賴 `tauri-nspanel`、`NSPanel`、`objc2`，目前是 macOS panel model。Windows 需要 normal `WebviewWindow` tray popover fallback，macOS NSPanel 需 `cfg(target_os = "macos")` 隔離。
  - `src-tauri/src/lib.rs#get_log_path` hardcodes `~/Library/Logs/{bundleIdentifier}`，需改成 platform-aware 或回傳 log plugin 實際路徑。
  - `ctx.host.keychain` 目前非 macOS 會 throw `keychain API is only supported on macOS`。受影響 plugin：Claude、Codex、Cursor、Copilot、Factory。Windows 需決定用 Windows Credential Manager，或先標 unsupported/file-only。
  - `ctx.host.ls.discover` 使用 `/bin/ps` + `lsof`。受影響 plugin：Antigravity、Windsurf。Windows 需 PowerShell/CIM/netstat 替代，或先 unsupported。
  - `ctx.host.sqlite` 使用外部 `sqlite3` command。受影響 plugin：Cursor、Windsurf、Antigravity、Kiro、OpenCode Go、Perplexity。Windows 需 bundle sqlite sidecar 或改 Rust sqlite crate。
  - 多個 provider hardcode macOS paths：Cursor、Windsurf、Antigravity、Kiro、Perplexity、Gemini。JetBrains plugin 已有 `ctx.app.platform === "windows"` path 分支，可作為模式。

- 需要人工環境或憑證：
  - `cargo check --manifest-path src-tauri/Cargo.toml` 在本機 Windows 先被 `rquickjs-sys` 擋住：缺 `clang.dll` / `libclang.dll`，需安裝 LLVM/libclang 並設 `LIBCLANG_PATH`。
  - Tauri 官方 Windows prerequisites：Microsoft C++ Build Tools、WebView2、MSVC Rust toolchain；本機已有這些，但缺 libclang。
  - MSI build 若 `targets = "all"`，Windows 可能需要 VBSCRIPT optional feature。
  - Windows code signing非執行必需，但未簽名從瀏覽器下載會有 SmartScreen warning。內部 2-5 人可先 unsigned MVP；公開發版再補 EV/OV/Azure signing。

外部資料來源：

- Tauri Windows prerequisites: https://v2.tauri.app/start/prerequisites/
- Tauri Windows installer: https://v2.tauri.app/distribute/windows-installer/
- Tauri updater signatures: https://v2.tauri.app/plugin/updater/
- Tauri Windows code signing: https://v2.tauri.app/distribute/sign/windows/

驗證結果：

- PASS: `bun install`
- PASS: `bun run build`
- PASS: `bun run test`（61 files / 1105 tests passed；有既有 test stderr noise，但 exit 0）
- PASS: `bun tauri info`
- BLOCKED: `cargo check --manifest-path src-tauri/Cargo.toml`
  - error: `Unable to find libclang: "couldn't find any valid shared libraries matching: ['clang.dll', 'libclang.dll'], set the LIBCLANG_PATH environment variable..."`
  - 因此尚未完成 Windows Rust compile/package/runtime proof。

### 建議方向
- [A] Windows MVP：先讓 Windows build/run/package 成功；macOS NSPanel 保留，Windows 用普通 tray window；plugin host API 先 fail loud / unsupported。優點：最快、符合內部小團隊；缺點：部分 provider 初期不可用。
- [B] Windows parity：一次補齊 panel、Credential Manager、sqlite sidecar/Rust sqlite、LS discovery、provider path、release signing。優點：接近正式 Windows 版本；缺點：範圍大，容易拖成多張工單。
- [C] Package-only experiment：只補 workflow/artifact，先不保證 provider/runtime。優點：最快拿 installer；缺點：目前 source 還未能 Windows compile，且使用者體驗風險高。
- **推薦**：A。先開 `feat/windows-port-mvp`，基底 `main` / `origin/main`。建立分支時機：T0001 收尾後、第一張實作工單開始前；本研究工單不建分支。

### 建議下一步
- [x] 開實作工單（建議方案：A / Windows MVP）
- [ ] 繼續研究（Renew，新方向：若要先決定 Windows Credential Manager vs file-only auth）
- [ ] 放棄（原因：無）

建議後續工單：

- T0002：建立 `feat/windows-port-mvp`，修 Windows Rust build baseline。
  - 內容：安裝/記錄 LLVM libclang prerequisite；`cfg` 隔離 `tauri-nspanel` / `objc2` / App Nap / WebKit；Windows 使用普通 `WebviewWindow` panel fallback。
  - 驗收：Windows `cargo check --manifest-path src-tauri/Cargo.toml` pass。
- T0003：Windows host API 最小化。
  - 內容：`keychain` 非 macOS fail loud message 正規化；`sqlite` 選 sidecar 或 Rust sqlite；`ls.discover` 先 unsupported 或 Windows implementation。
  - 驗收：受影響 plugin 有 Windows tests，不 silent fallback。
- T0004：Provider path audit。
  - 內容：Cursor/Windsurf/Antigravity/Kiro/Perplexity/Gemini/JetBrains path inventory；能支援就補 platform path，不能支援就明確 badge。
  - 驗收：plugin tests 覆蓋 Windows path 或 unsupported result。
- T0005：Windows packaging / release workflow。
  - 內容：`.github/workflows/publish.yml` 加 `windows-latest` matrix；決定 NSIS-only 或 MSI+NSIS；更新 `build-release` 或移除 shell dependency。
  - 驗收：GitHub Release 產出 Windows installer、`.sig`、`latest.json` platform entry。
- T0006：Windows docs/UI polish。
  - 內容：README download wording、log capture docs、shortcut display `Ctrl/Alt`、Windows smoke checklist。
  - 驗收：docs 不再暗示 macOS-only。

建議 Windows 驗證命令：

```powershell
bun install
bun run build
bun run test
bun tauri info
cargo check --manifest-path src-tauri/Cargo.toml
bun tauri dev
bun tauri build --target x86_64-pc-windows-msvc
```

若從非 Windows cross build，參考 Tauri 官方建議：

```bash
bun tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
```

### Renew 歷程
（若有 Renew 則記錄每次 Renew 的摘要，無則填「無」）

無

### 遭遇問題
（若有問題或需要指揮塔介入的事項，在此描述）

- 工單明示「不要修改 source，不要建立 branch，不要 commit」，因此本輪只更新工單回報，不建立分支、不改 source、不做 git commit。
- Windows Rust proof 卡在本機缺 `libclang.dll` / `LIBCLANG_PATH`；後續 compile error 尚未能展開。
- `_ct-workorders/` 目前整個目錄在 git 中是 untracked，未自動加入。

### sprint-status.yaml 已更新
（是 / 否 / 不適用）

不適用（repo 內未找到 `sprint-status.yaml`）

### 回報時間
2026-05-23T22:57:09+08:00
