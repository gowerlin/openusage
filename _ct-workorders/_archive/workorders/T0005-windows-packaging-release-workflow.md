---
schema_version: 1
schema_kind: workorder
id: T0005
title: Windows packaging release workflow
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 00:23:30 +08:00"
started_at: "2026-05-24T00:26:22+08:00"
completed_at: "2026-05-24T00:41:00+08:00"
updated_at: "2026-05-24T09:08:40+08:00"
plan_id: PLAN-001
sizing: medium
affects_files:
  - ".github/workflows/*"
  - "scripts/*"
  - "src-tauri/tauri.conf.json"
  - "src-tauri/Cargo.toml"
  - "package.json"
depends_on:
  - T0004
---

# T0005 Windows Packaging Release Workflow

## 元資料
- **工單編號**：T0005
- **任務名稱**：Windows packaging release workflow
- **狀態**：DONE
- **建立時間**：2026-05-24 00:23:30 (UTC+8)
- **開始時間**：（sub-session 開始時填入）
- **完成時間**：2026-05-24T00:41:00+08:00
- **目標子專案**：release / packaging
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0001, T0002, T0003, T0004
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `.github/workflows/*`
  - `scripts/*`
  - `src-tauri/tauri.conf.json`
  - `src-tauri/Cargo.toml`
  - `package.json`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若完整 installer build 受簽章、VBSCRIPT、runner image 或憑證阻塞，完成 workflow/config 最小修正並回報 PARTIAL，明確列出人工前置。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：會讀寫 release workflow / packaging config，與前面 source/plugin 改動分離。

## 規格層級自問

- [x] **目標層**：執行。目標是讓 Windows packaging / release workflow 有可跑路徑。
- [x] **決策權歸屬**：Worker 可選 NSIS-only 或現有 Tauri target 最小配置；不可引入簽章服務或公開發版流程。
- [x] **資訊完整度**：T0001 已列 packaging 風險，T0002-T0004 已建立 Windows build/plugin baseline。
- [x] **回頭成本**：中。限定 workflow/config/script。
- [x] **記憶覆蓋**：本工單不 push、不 create PR、不 commit；若簽章缺失，要明確 unsigned MVP / blocker。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0001-research-windows-porting.md`
- `_ct-workorders/T0002-windows-rust-build-baseline.md`
- `_ct-workorders/T0003-windows-host-api-mvp.md`
- `_ct-workorders/T0004-windows-provider-path-audit.md`
- `AGENTS.md`
- `package.json`
- `src-tauri/tauri.conf.json`
- 既有 `.github/workflows/*`
- 既有 `scripts/*` release/build scripts

### 輸入上下文

目前 Windows MVP 已有：
- Rust build baseline 通過。
- Host API 在 Windows fail loud / explicit unsupported。
- Provider path audit 已完成：Kiro/Gemini 補 Windows path，Cursor/Windsurf/Perplexity explicit unsupported。

本工單要讓 Windows packaging / release workflow 走到可驗證 MVP。

### 範圍

必做：
1. 確認目前在 `feat/windows-port-mvp`；若不是，切換過去，不覆蓋使用者變更。
2. 盤點現有 workflow / scripts / Tauri bundle 設定。
3. 建立或修正 Windows release/build workflow：
   - `windows-latest` runner。
   - 安裝 Bun / Rust / Tauri prerequisites。
   - 設定 VS x64 dev env / `LIBCLANG_PATH`，沿用 T0002 已驗證路徑或 runner 可用做法。
   - 跑 plugin bundle、frontend build、Tauri build。
4. 決定 Windows bundle target：
   - 優先最小 MVP（例如 NSIS-only）；
   - MSI 若需要 VBSCRIPT 或額外前置，先不要擴大，明確記錄。
5. 確認 updater artifacts / `.sig` / `latest.json` 行為是否需要 Windows entry；若 workflow 尚不能 live publish，記錄為 PARTIAL。
6. 不做 code signing 整合；只保留 unsigned internal MVP 或 placeholder，明確說明 SmartScreen 風險。
7. 跑可行的本機驗證命令並填回報區。

不做：
- 不做 README/docs/shortcut UI polish（T0006）。
- 不做 provider parity / Credential Manager / bundled sqlite。
- 不建立 PR，不 push，不 commit。
- 不處理視覺變更。

### 建議驗證命令

```powershell
bun run build
bun run test
bun run bundle:plugins
cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'
bun tauri build
```

若本機 `bun tauri build` 需要額外 installer prerequisites，回報 BLOCKED/PARTIAL，附精準錯誤與建議。

### 預期產出

- Windows packaging / release workflow 更新。
- Bundle target 決策與理由。
- 本機或 workflow 可執行驗證結果。
- 下一張工單建議：T0006 Windows docs/UI polish。

### 驗收條件

- [ ] Windows release/build workflow 有明確 runner 與命令。
- [ ] Windows bundle target 決策清楚。
- [ ] unsigned / signing / SmartScreen 風險明確。
- [ ] updater artifacts / latest.json 影響已盤點。
- [ ] 驗證命令結果明確記錄。
- [ ] 未碰 README/docs/shortcut UI polish。
- [ ] 未 push / 未 PR / 未 commit。

## 塔台收斂註記

**時間**：2026-05-24 09:08:40 (UTC+8)
**狀態調整**：PARTIAL → DONE
**理由**：本工單當時留下的 updater `.sig/latest.json` signing gate 已由 T0009 完成驗證；release `v0.6.24` 已產生 Windows NSIS setup、`.sig`、`latest.json` Windows entries。原回報區保留當時缺本機 signing secret 的 PARTIAL 證據。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
PARTIAL

### 產出摘要
- 修改：`.github/workflows/publish.yml`
  - release matrix 新增 `windows-latest`。
  - Windows build 使用 `x86_64-pc-windows-msvc` + `--bundles nsis`。
  - Windows runner 補 `ilammy/msvc-dev-cmd@v1` 與 `LIBCLANG_PATH` 探測，支援 `rquickjs`/bindgen release build。
  - macOS certificate import 限定 macOS runner。
  - Bash-only 驗證步驟明確指定 `shell: bash`。
  - `tauri-action` 更新為 `@v1`，使用 `uploadUpdaterJson: true` 與 `updaterJsonPreferNsis: true`。
- 修改：`src-tauri/tauri.conf.json`
  - Windows NSIS installer 明確設定 `installMode: "currentUser"`。
- 修改：`scripts/build-release.sh`
  - 清除 target triple bundle output。
  - build 完成後列出 macOS / Windows bundle、`.sig`、`latest.json` 產物。
- 更新：`_ct-workorders/T0005-windows-packaging-release-workflow.md`
- 未碰 README/docs/shortcut UI polish。
- 未 push / 未 PR / 未 commit。

### Packaging 決策
- Workflow：沿用 tag push `Publish` workflow；同一 matrix 增加 Windows，不加 `max-parallel`。
- Bundle target：Windows 選 `x86_64-pc-windows-msvc` + NSIS `-setup.exe`。
- Signing：CI 仍需既有 `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 做 updater artifact 簽章；本工單未加入 Windows Authenticode code signing cert，未簽 Windows app 可能出現 SmartScreen 警告。
- Updater / latest.json：`tauri-action@v1` 上傳 updater JSON，並優先使用 NSIS 產物寫入 Windows entry。

### 互動紀錄
無

### 驗證結果
- PASS：`ruby -e "require 'yaml'; YAML.load_file('.github/workflows/publish.yml'); puts 'publish.yml ok'"`
- PASS：`bun -e "JSON.parse(await Bun.file('src-tauri/tauri.conf.json').text()); console.log('tauri.conf.json ok')"`
- PASS：`bash -n scripts/build-release.sh`
- PASS：`git diff --check -- .github/workflows/publish.yml src-tauri/tauri.conf.json scripts/build-release.sh _ct-workorders/T0005-windows-packaging-release-workflow.md _ct-workorders/PLAN-001-windows-port.md _ct-workorders/_tower-state.md`
  - 僅 CRLF warning，exit code 0。
- PASS：`bun run build`
- PASS：`bun run test`
  - 61 files passed；1111 tests passed。
  - 有既有 Tauri store mock stderr，測試仍 pass。
- PASS：`bun run bundle:plugins`
  - Bundled 18 plugins。
- PASS：`cmd.exe /d /c 'call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64 && set "LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin" && cargo check --manifest-path src-tauri/Cargo.toml'`
- BLOCKED：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`
  - 先產出 `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/OpenUsage_0.6.24_x64-setup.exe`。
  - 最後因本機缺 `TAURI_SIGNING_PRIVATE_KEY` 失敗：`A public key has been found, but no private key. Make sure to set TAURI_SIGNING_PRIVATE_KEY environment variable.`
- PASS：`bun tauri build --target x86_64-pc-windows-msvc --bundles nsis --config '{"bundle":{"createUpdaterArtifacts":false}}'`
  - 純 Windows NSIS packaging 通過並產出 `OpenUsage_0.6.24_x64-setup.exe`。

### 遭遇問題
- 本機沒有 `.env`，也沒有 `TAURI_SIGNING_PRIVATE_KEY`；因此只能驗證 NSIS packaging，不能驗證 updater `.sig/latest.json` 簽章輸出。
- 本機 Tauri CLI 若 `CI` env 是空值會報 `a value is required for '--ci'`；驗證時改設 `CI=true` 後可繼續。
- 只設 `LIBCLANG_PATH` 仍不足以跑 release build；`rquickjs-sys` 需要 MSVC Developer Command Prompt 的 include/lib 環境，workflow 已補 `ilammy/msvc-dev-cmd@v1`。

### 建議下一步
- 由塔台/maintainer 確認 GitHub repo secret 已有 `TAURI_SIGNING_PRIVATE_KEY` 與 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
- 推 tag 後檢查 GitHub Release assets 是否有 Windows NSIS installer、`.sig`、`latest.json` Windows platform entry。
- 若要正式公開 Windows download，再派 T0006 更新 README/docs/shortcut UI polish。

### sprint-status.yaml 已更新
不適用（repo 根目錄、`_bmad-output/`、`docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T00:41:00+08:00
