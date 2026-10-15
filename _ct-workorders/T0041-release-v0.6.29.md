---
schema_version: 1
schema_kind: workorder
id: T0041
title: Publish GitHub release v0.6.29 (upstream sync)
status: IN_PROGRESS
priority: High
type: release
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T14:54:09+08:00"
started_at: "2026-10-15T14:54:09+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0038
  - T0039
  - T0040
  - T0042
  - T0043
  - T0044
  - T0045
  - T0046
  - T0047
  - T0048
  - T0049
affects_files: []
---

# T0041 Publish GitHub Release v0.6.29 (Upstream Sync)

## 背景

PLAN-004 最後一步。版號 `0.6.29` 已由 T0038 在 merge commit 寫入四個版本檔，本單**不再 bump**。流程同 T0036。

## 授權範圍（使用者 2026-10-15 明確授權，D071）

- ✅ `git push origin main`
- ✅ 建立並 push **單一** tag `v0.6.29`：`git push origin v0.6.29`
- ❌ **嚴禁 `git push --tags` / `--follow-tags` / `--mirror`**（本機仍有共用歷史的舊上游 tag `v0.0.1`–`v0.6.23`、`v0.3.1`、`v0.4.1`，推上去會觸發舊 workflow、污染 fork Latest release）。
- ❌ 不得 force-push、移動 / 刪除既有 tag 或 release。需要時回報 BLOCKED。

## 前置條件（不符即 BLOCKED）

- T0038、T0039、T0042、T0043、T0045、T0046、T0047、T0048、T0049 `status: DONE`；**T0044** `status: DONE`（re-smoke 全 PASS）。T0040 為 PARTIAL（已由 T0042–T0044 解決，D074）。
- 四個版本檔皆為 `0.6.29`。
- `git status` 除塔台私有檔外乾淨；`git fetch origin` 後 main 只 ahead。
- `git ls-remote --tags origin v0.6.29` 為空。
- `git remote get-url --push origin` = `https://github.com/gowerlin/openusage.git`。

## 任務指令

1. README 支援 plugin 清單已由 T0038/T0039 更新 → 確認（AGENTS.md push 前要求）。
2. **Push 前隱私掃描（D081）**：對 `git diff origin/main..HEAD` 新增的檔案與 `_ct-workorders/assets/**` 檢查：無 API token / session token（`sk-`、`ghp_`、`github_pat_`、JWT `eyJ...`、`devin-session-token$...` 等）、無 email、無帳號 ID；截圖逐張目視確認無上述內容與背景視窗的私人內容。用量金額允許公開（使用者決定）。發現問題 → BLOCKED 回報，不自行改寫歷史。
3. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build` PASS。
4. 回報區先寫入 push 前狀態 commit：`chore: prepare release v0.6.29 (T0041)`（只含本工單）。
5. `git push origin main`。
6. `git tag -a v0.6.29 -m v0.6.29 <HEAD>`；`git push origin v0.6.29`（**只推這一個**）。
7. 追蹤 `gh run list -R gowerlin/openusage --workflow publish.yml` → `gh run watch -R gowerlin/openusage <id>`。
8. 驗證（全部加 `-R gowerlin/openusage`）：非 draft / 非 prerelease；assets 含 NSIS setup、`.sig`、`latest.json`；`latest.json` `version` = `0.6.29`、URL 指向 fork；`gh release list -R gowerlin/openusage` 確認 Latest = `v0.6.29`，且**沒有**任何非預期的新 release / tag 出現在 fork（`git ls-remote --tags origin` 比對 push 前清單）。
9. **發行重點說明**（繁中，格式同 `v0.6.27`）：`gh release edit v0.6.29 -R gowerlin/openusage --notes-file <檔>`。
   - 本版重點：**同步上游 OpenUsage Tauri 版（tauri-legacy v0.6.25–v0.6.28）的改進**，並保留本 fork 的 Windows 支援、繁中與主題。
   - 依使用者可感知分類列出：新功能（Usage Trend 圖、Codex rate-limit resets、menubar weekly metric、Copy Log Path、Devin 取代 Windsurf、Antigravity/agy…）、修正（Codex token refresh、Cursor、安全性依賴更新…）、fork 調整（保留 Gemini、不含退休通知、Devin Windows 行為、補繁中翻譯）；Windows 修正（Usage Trend / ccusage 在 Windows 可用 BUG-006、面板不佔工作列 BUG-007、面板失焦自動收起 BUG-008、log 遮蔽 Windows 使用者路徑 BUG-009、ccusage 逾時清理 BUG-010、缺少 Node.js / Bun 時顯示提示 BUG-011、正式版不再從工作目錄載入 plugin BUG-012）。
   - 上游項目可附上游 PR 連結（`robinebers/openusage/pull/N`）並註明「來自上游」；fork commit 用 fork 連結。
   - 寫入後 `gh release view` 與 `curl https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.29` 確認 body。

## 明確排除

- 不改功能程式碼、不改 `.github/workflows/**`。workflow 失敗 → 回報失敗步驟與 log 摘要。
- 不 commit 塔台私有檔。
- 已知未修（v0.6.30，D083）：BUG-013 / 014 / 015 —— 發行說明可列「已知問題」一段（可選）。

## 驗證 Gate

- PASS：Publish run 成功（run ID）
- PASS：release / assets / `latest.json` / Latest 標記
- PASS：fork 無非預期 tag / release
- PASS：release body + GitHub API body

## 回報區

### 狀態

進行中 — push 前狀態（本段寫於 push 前，2026-10-15T14:58:19+08:00）。

### Landing check

- 結果：WARN（只有 C-0）。
- C-0：frontmatter 沒有 `repo` 欄位（absent）→ WARN「repo identity unavailable」；`basename(REPO_ROOT)` = `openusage`。
- C-1：PASS（`D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/T0041-release-v0.6.29.md`）。
- C-3：`affects_files` 是空的 → not applicable。C-2：無 `branch` 欄位（HEAD = `main`）。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`；`CT_MODE=yolo`。

### 前置條件

| 項目 | 結果 |
|---|---|
| T0038 / T0039 / T0042 / T0043 / T0044 / T0045 / T0046 / T0047 / T0048 / T0049 | 全部 `status: DONE`；T0040 `PARTIAL`（D074） |
| 四個版本檔 | `package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.lock`（`openusage`）= `0.6.29` |
| `git status` | 乾淨 |
| `git fetch origin` 後 | `origin/main...HEAD` = `0 133`（只 ahead） |
| `git ls-remote --tags origin v0.6.29` | 空 |
| push URL | `https://github.com/gowerlin/openusage.git` |

### 步驟 1：README plugin 清單

PASS（附觀察）。README 有 Amp、Antigravity、Claude、Codex、Copilot、Cursor、Factory、Gemini、Grok、JetBrains AI Assistant、Kiro、Kimi、MiniMax、OpenCode Go、Devin（含 Windows 說明）、Z.ai；Windsurf 已移除。
- 觀察（不擋）：`plugins/perplexity`、`plugins/synthetic` 有打包進 `bundled_plugins`，但 README 沒列。上游 `tauri-legacy` README 一樣沒列、`origin/main`（v0.6.27）也沒列 → 既有缺口，不是本次合併造成。本單只 commit 工單，沒改 README；建議塔台另開小單補兩行。

### 步驟 2：Push 前隱私掃描（D081）

PASS（附觀察）。範圍：`git diff origin/main..HEAD`（54 個新增檔、全部新增行，排除 `*.png` / lock 檔）+ `_ct-workorders/assets/**` 21 張截圖。
- Token（`sk-`、`ghp_`、`gho_`、`github_pat_`、JWT `eyJ…`、`devin-session-token$`、`xox?-`、`AKIA`、private key）：只命中 placeholder / 測試假值（`devin-session-token$...`、`$cli`、`$app`、`$abcdef…123456` 等）與本工單文字。無真實 token。
- Email：`user@example.com`、`team@example.com`、`rob@sunstory.com`、`rob@....com`。後兩個在 `src-tauri/src/plugin_engine/host_api.rs` 的 redaction 測試資料，**上游 `upstream/tauri-legacy` 原本就有**（上游作者本人、已公開）。無使用者 email（`gower.tw` 0 筆）。
- 帳號 ID：`org-6b6e9de248db472bb25b296599ea3dc0` 同上，上游 redaction 測試資料；其餘為假值（`org-abcdef1234567890`、`other-account`）。
- 觀察（不擋）：`T0040`、`T0042`、`T0049` 工單文字有本機 Windows 使用者路徑 `C:\Users\Gower\…`。`origin/main` 已有 22 處同樣路徑（先例），不是 token / 帳號 ID。
- 截圖逐張目視（T0035 ×4、T0040 ×5、T0042 ×1、T0044 ×8、T0047 ×2、T0048 ×1）：只有 app UI 與用量數字 / 金額（允許公開）。背景觀察（不擋）：`T0040/about-dialog.png`、`T0040/overview-zh-TW.png`、`T0040/settings-metric-zh-TW.png` 背後是半透明的終端機工作文字（Devin / Windows 說明片段，與一串被切掉的數字）；`T0047/claude-detail-no-runner-hint.png` 背後有 scratchpad 路徑片段（`-afd6-a4b03db0527a\scratchpad`、`uia-norunner.txt`，session 目錄名）。都不是 token / email / 帳號 ID，也沒有其他私人視窗內容。

### 步驟 3：驗證

| Gate | 結果 | 證據 |
|---|---|---|
| `cargo fmt --check` | PASS | exit 0 |
| `bun run test --run` | PASS | 69 files / 1199 tests passed |
| `bun run build` | PASS | exit 0（只有 chunk > 500 kB 既有警告） |
| `cargo test --locked` | PASS | 第一次在 Git Bash 直接跑 exit 101：`Unable to find libclang`（本機環境，`rquickjs-sys`）。改在 VS18 `VsDevCmd` x64 + `LIBCLANG_PATH` + `CI=false` 重跑：`151 passed; 0 failed` |
