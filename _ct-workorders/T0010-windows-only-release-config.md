---
schema_version: 1
schema_kind: workorder
id: T0010
title: Windows-only release config for fork
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 01:33:33 +08:00"
started_at: "2026-05-24T01:36:04+08:00"
completed_at: "2026-05-24T01:39:28+08:00"
updated_at: "2026-05-24T01:39:28+08:00"
commit: null
plan_id: PLAN-001
sizing: small
affects_files:
  - ".github/workflows/*"
  - "src-tauri/tauri.conf.json"
  - "README.md"
  - "_ct-workorders/*"
depends_on:
  - T0009
---

# T0010 Windows-Only Release Config For Fork

## 元資料
- **工單編號**：T0010
- **任務名稱**：Windows-only release config for fork
- **狀態**：DONE
- **建立時間**：2026-05-24 01:33:33 (UTC+8)
- **開始時間**：2026-05-24T01:36:04+08:00
- **完成時間**：2026-05-24T01:39:28+08:00
- **目標子專案**：release / config
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0009
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `.github/workflows/*`
  - `src-tauri/tauri.conf.json`
  - `README.md`
  - `_ct-workorders/*`

## 使用者決策

使用者在塔台選擇 **C**：

> 開 T0010：同時改 Windows-only workflow + updater endpoint 改 `gowerlin/openusage`。

## 工作量預估
- **預估規模**：小
- **Context Window 風險**：低
- **降級策略**：若 workflow scope 或 endpoint 影響不明，回報 PARTIAL 並列出需塔台決策事項。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：會修改 release workflow 與 updater endpoint，需獨立驗證。

## 規格層級自問

- [x] **目標層**：執行。目標是解除 T0009 的 workflow scope / endpoint blocker。
- [x] **決策權歸屬**：Worker 可把 release workflow 改為 Windows-only，並把 updater endpoint 改到 `gowerlin/openusage`。
- [x] **資訊完整度**：T0009 已列出 blockers。
- [x] **回頭成本**：中。Updater endpoint 是 runtime-facing config，需清楚記錄。
- [x] **記憶覆蓋**：本工單仍不允許 push/tag/release/commit；只做本地 source/config change。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0009-fork-release-flow.md`
- `AGENTS.md`
- `.github/workflows/publish.yml`
- `src-tauri/tauri.conf.json`
- `README.md`（若 release wording 需要同步）
- `package.json`

### 目標

處理 T0009 preflight blocker 的兩個可由 source 解決的部分：
1. Release workflow 改為 Windows-only，避免缺 Apple/macOS secrets 阻擋 fork release。
2. Updater endpoint 改為 `https://github.com/gowerlin/openusage/releases/latest/download/latest.json`，讓 fork release 的 `latest.json` 成為 app updater target。

### 範圍

必做：
1. 確認目前在 `feat/windows-port-mvp`；若不是，切換過去，不覆蓋使用者變更。
2. 修改 `.github/workflows/publish.yml`：
   - release matrix 僅保留 Windows job。
   - 移除或停用 macOS signing/notarization/import certificate steps。
   - 保留 Windows `x86_64-pc-windows-msvc --bundles nsis`。
   - 保留 updater artifact upload/signing path。
3. 修改 `src-tauri/tauri.conf.json` updater endpoint 到 `gowerlin/openusage`。
4. 若 README 已描述 endpoint/release boundary，補最小更新；不可宣稱 public release ready。
5. 驗證 YAML/JSON parse。
6. 跑必要本地驗證：
   - `bun run build`
   - `bun run test`
   - `bun run bundle:plugins`
   - cargo check with VS dev env + `LIBCLANG_PATH`
7. 回報 T0009 可否 Renew：仍需 GitHub Actions secrets `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。

不做：
- 不設定 secrets。
- 不 push。
- 不 create tag。
- 不 publish release。
- 不 commit，除非塔台後續明確要求。
- 不改 provider parity / docs polish 之外的內容。

## 驗收條件

- [x] `publish.yml` 為 Windows-only release workflow。
- [x] macOS-only signing/notarization steps 不會在 fork Windows release 中執行。
- [x] updater endpoint 指向 `gowerlin/openusage`。
- [x] README 若有相關文字，邊界清楚且不宣稱 public release ready。
- [x] YAML/JSON parse pass。
- [x] build/test/plugin bundle/cargo check 結果明確。
- [x] 未 push / 未 tag / 未 release / 未 commit。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- `.github/workflows/publish.yml`
  - Release matrix 改為單一 `windows-latest`。
  - 保留 `x86_64-pc-windows-msvc --bundles nsis`。
  - 保留 `tauri-apps/tauri-action@v1`、`uploadUpdaterJson: true`、`updaterJsonPreferNsis: true`。
  - 移除 macOS matrix、Apple certificate import、Apple-only secret env。
- `src-tauri/tauri.conf.json`
  - updater endpoint 改為 `https://github.com/gowerlin/openusage/releases/latest/download/latest.json`。
  - 保留 Windows NSIS `currentUser` installer config。
- `README.md`
  - Download link 改為 fork release page。
  - 文字標明 Windows release 尚需 signed tag-release 驗證。
- `_ct-workorders/T0010-windows-only-release-config.md`
  - 填寫開工、驗收、收尾回報。
- `_ct-workorders/_tower-state.md`
  - 同步 T0010 狀態與 PLAN-001 下一步。

### Release config summary
- Workflow scope：Windows-only GitHub Actions release workflow。
- Updater endpoint：`https://github.com/gowerlin/openusage/releases/latest/download/latest.json`。
- Remaining release gate：仍需 GitHub Actions secrets `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`，之後才可 Renew T0009 跑 tag/release。

### 驗證結果
- PASS：`ruby -e "require 'yaml'; YAML.load_file('.github/workflows/publish.yml'); puts 'publish.yml OK'"`
- PASS：`node -e "JSON.parse(require('fs').readFileSync('src-tauri/tauri.conf.json','utf8')); console.log('tauri.conf.json OK')"`
- PASS：`bun run build`
- PASS：`CI=1 bun run test`（61 files / 1113 tests passed；仍有既有 Tauri store mock stderr，未造成失敗）
- PASS：`bun run bundle:plugins`（Bundled 18 plugins）
- PASS：`cmd.exe /d /c "call \"C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat\" -arch=x64 && set \"LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin\" && cargo check --manifest-path src-tauri/Cargo.toml"`

### 遭遇問題
- 無程式阻塞。
- 未 push / 未 tag / 未 release / 未 commit，符合本工單驗收條件。
- `LEAN-CTX.md` 在 repo root 未找到；本次依 AGENTS 內提供內容與 lean-ctx tool 執行。

### 建議下一步
- T0009 可 Renew 的前提尚未滿足：仍需使用者在 `gowerlin/openusage` 設定 `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
- secrets 設定完成後，建議 Renew T0009 執行 tag/release 驗證。

### sprint-status.yaml 已更新
不適用（未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T01:39:28+08:00
