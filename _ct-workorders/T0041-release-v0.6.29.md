---
schema_version: 1
schema_kind: workorder
id: T0041
title: Publish GitHub release v0.6.29 (upstream sync)
status: DONE
priority: High
type: release
plan_id: PLAN-004
bug_id: null
created_at: "2026-10-15T12:39:32+08:00"
updated_at: "2026-10-15T15:12:55+08:00"
started_at: "2026-10-15T14:54:09+08:00"
completed_at: "2026-10-15T15:12:55+08:00"
commit: 5a93b5a1
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

DONE — v0.6.29 已發行，4 個驗證 Gate 全 PASS。下方「Landing check」到「步驟 3」寫於 push 前（2026-10-15T14:58:19+08:00），已含在 push 的 commit 裡；「步驟 4」之後寫於 2026-10-15T15:12:03+08:00。

| 項目 | 值 |
|---|---|
| push 前狀態 commit | `5a93b5a1bc87f3504f115ebf195dcaf1d28222e0`（`chore: prepare release v0.6.29 (T0041)`） |
| tag | `v0.6.29`（annotated，tag object `db5f5d2e747315cf84386d96c52dd68b25981af0` → `5a93b5a1`） |
| Publish run | `38695730149` success（job `116291746773`，12m6s） |
| Release | https://github.com/gowerlin/openusage/releases/tag/v0.6.29 |

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

### 步驟 4–6：commit / push / tag

- `git commit --only _ct-workorders/T0041-release-v0.6.29.md` → `5a93b5a1`（只含本工單）。
- `git push origin main`：`016db271..5a93b5a1  main -> main`。
- `git tag -a v0.6.29 -m v0.6.29 5a93b5a1`；`git push origin v0.6.29`：`* [new tag] v0.6.29 -> v0.6.29`。**沒有**用 `--tags` / `--follow-tags` / `--mirror`、沒有 force-push、沒有動既有 tag / release。

### 步驟 7：Publish workflow

- `gh run list -R gowerlin/openusage --workflow publish.yml` → run `38695730149`（`v0.6.29`，push）。
- `gh run watch -R gowerlin/openusage 38695730149 --exit-status` → exit 0。`✓ publish (windows-latest, --target x86_64-pc-windows-msvc --bundles nsis, x86_64-pc-windows-msvc) in 12m6s`。
- Annotation（只是警告）：`Node.js 20 is deprecated … actions/checkout@v4, ilammy/msvc-dev-cmd@v1` 被強制改用 Node.js 24。本單不改 workflow。

### 步驟 8：Release 驗證

| 項目 | 結果 |
|---|---|
| draft / prerelease | `false` / `false`；publishedAt `2026-10-15T07:09:48Z` |
| assets | `OpenUsage_0.6.29_x64-setup.exe`（5431339 bytes）、`OpenUsage_0.6.29_x64-setup.exe.sig`（420）、`latest.json`（1276） |
| `latest.json` | `"version": "0.6.29"`；`windows-x86_64` 與 `windows-x86_64-nsis` 的 `url` = `https://github.com/gowerlin/openusage/releases/download/v0.6.29/OpenUsage_0.6.29_x64-setup.exe`，都有 signature |
| updater endpoint | `releases/latest/download/latest.json` → `"version": "0.6.29"` |
| Latest | `gh release list -R gowerlin/openusage`：`v0.6.29 Latest`；其餘 `v0.6.27`、`v0.6.26`、`v0.6.25`、`v0.6.25-pre.1`（Pre-release）、`v0.6.24` 不變，沒有新的非預期 release |

**push 前後 tag 清單比對（`git ls-remote --tags origin`）**

- push 前：`v0.6.24`、`v0.6.24^{}`、`v0.6.25`、`v0.6.25^{}`、`v0.6.25-pre.1`、`v0.6.26`、`v0.6.26^{}`、`v0.6.27`、`v0.6.27^{}`
- push 後 `diff`：只多了 `refs/tags/v0.6.29`、`refs/tags/v0.6.29^{}`。沒有任何舊上游 tag（`v0.0.1`–`v0.6.23`、`v0.3.1`、`v0.4.1`、`v0.6.28`、`v0.7.*`）出現在 fork。

### 步驟 9：發行說明

- `gh release edit v0.6.29 -R gowerlin/openusage --notes-file <scratchpad>/release-notes-v0.6.29.md`。
- `gh release view --json body` 與檔案一致（正規化 CRLF 後 `true`）。
- `curl https://api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.29`：body 與檔案一致（`true`，4088 字元），`draft=false`、`prerelease=false`。第一次比對顯示不一致，原因是我的 node 比對腳本把 UTF-8 分塊直接拼字串造成亂碼；存檔後再解析就一致，GitHub 上的內容沒有問題。

發行說明全文：

```markdown
本版重點：同步上游 OpenUsage Tauri 版（tauri-legacy v0.6.25–v0.6.28）的改進，並保留本 fork 的 Windows 支援、繁體中文與主題；另修正多項 Windows 問題（PLAN-004，合併 commit [996aff2](https://github.com/gowerlin/openusage/commit/996aff286ba3bf0f7cb8f5803ec3f924edb05836)）。

### 新功能（來自上游）
- Claude 詳細頁新增「用量趨勢」圖與各模型用量百分比（[#542](https://github.com/robinebers/openusage/pull/542)）
- Codex 顯示 rate limit 重置資訊（[#577](https://github.com/robinebers/openusage/pull/577)）
- 選單列可改顯示「每週」指標（設定 → 指標）（[#555](https://github.com/robinebers/openusage/pull/555)）
- Tray 選單新增「Copy Log Path」，一鍵複製 log 路徑（[#541](https://github.com/robinebers/openusage/pull/541)）
- Devin 取代 Windsurf；舊的 Windsurf plugin 會在啟動時自動移除（[#551](https://github.com/robinebers/openusage/pull/551)、[cad8468](https://github.com/robinebers/openusage/commit/cad84687)）
- Antigravity 支援 `agy`（[#538](https://github.com/robinebers/openusage/pull/538)）
- Codex credits 顯示調整（[#567](https://github.com/robinebers/openusage/pull/567)）
- MiniMax 改用 Token Plan API（含中國區）（[#534](https://github.com/robinebers/openusage/pull/534)、[#539](https://github.com/robinebers/openusage/pull/539)）

### 修正（來自上游）
- Codex token refresh：refresh token 被重複使用、401 時重新載入登入資訊（[#568](https://github.com/robinebers/openusage/pull/568)）
- Cursor 免費帳號的共用額度顯示（[#544](https://github.com/robinebers/openusage/pull/544)）
- Claude tray 百分比的備用來源、extra usage 改顯示在總覽（[#548](https://github.com/robinebers/openusage/pull/548)）
- Grok 過期登入 token 自動刷新（[#540](https://github.com/robinebers/openusage/pull/540)）
- Provider 側邊欄可以捲動（[#543](https://github.com/robinebers/openusage/pull/543)）
- Devin - Next app 的登入支援（[16bb1e1](https://github.com/robinebers/openusage/commit/16bb1e19)）
- 效能與穩定性：限制同時執行的 probe 數、每個 probe 有執行時限、面板隱藏時暫停計時器、用量 API 快取寫入合併（[#499](https://github.com/robinebers/openusage/pull/499)、[#500](https://github.com/robinebers/openusage/pull/500)、[#490](https://github.com/robinebers/openusage/pull/490)、[#503](https://github.com/robinebers/openusage/pull/503)、[#502](https://github.com/robinebers/openusage/pull/502)、[#498](https://github.com/robinebers/openusage/pull/498)）
- 安全性依賴更新（npm 與 Rust）（[#537](https://github.com/robinebers/openusage/pull/537)、[#570](https://github.com/robinebers/openusage/pull/570)、[#712](https://github.com/robinebers/openusage/pull/712)）

### Windows 修正
- 「用量趨勢」/ ccusage 在 Windows 可用（找得到 `bunx` / `npx` 等 runner）（BUG-006 / T0042，[1a439dc](https://github.com/gowerlin/openusage/commit/1a439dccb221a56d56974c56391e2f3d27779479)）
- 面板不再佔用工作列按鈕（BUG-007 / T0043，[0597397](https://github.com/gowerlin/openusage/commit/059739769ebb6b9388f6a9d2cb6c4f3f07a2b26b)）
- 面板失焦時自動收起（BUG-008 / T0043、T0048，[0597397](https://github.com/gowerlin/openusage/commit/059739769ebb6b9388f6a9d2cb6c4f3f07a2b26b)、[02a94c7](https://github.com/gowerlin/openusage/commit/02a94c744fbc72832bea8d28a4b218eba1c4d283)）
- Log 會遮蔽 Windows 使用者路徑（BUG-009 / T0045，[2f357ac](https://github.com/gowerlin/openusage/commit/2f357ac01932581f966c8f6a168dc7772538a762)）
- ccusage 逾時會清掉整個程序樹，不留殘留程序（BUG-010 / T0046，[61698e6](https://github.com/gowerlin/openusage/commit/61698e68af901579d72c01824a39777e940f7d6b)）
- 沒有 Node.js / Bun 時，「用量歷史」顯示提示而不是空白（BUG-011 / T0047、T0048，[96fc3ad](https://github.com/gowerlin/openusage/commit/96fc3ad8bb219c65f59b38dc4e84f8d5afb70ce2)、[84a814e](https://github.com/gowerlin/openusage/commit/84a814e8334803a5d50d63dc21206007c9fb8a50)）
- 正式版不再從工作目錄載入 plugin（BUG-012 / T0049，[1f9dd83](https://github.com/gowerlin/openusage/commit/1f9dd8350d0dfe33dbb5f463562520c3b5981e82)）

### Fork 調整
- 保留 Gemini（上游已移除）（T0038）
- 不含上游的退休通知橫幅（[ea22c26](https://github.com/gowerlin/openusage/commit/ea22c261a0883c91a408d87620dcee7cb7cb53cc)）
- Devin 在 Windows 只支援 Devin CLI 登入，找不到時明確提示（T0039，[2189965](https://github.com/gowerlin/openusage/commit/218996555d8485cc76dcc4c55b3aa53fd17d49e7)）
- 上游新增的介面文字補上繁體中文（T0038，[c4ea900](https://github.com/gowerlin/openusage/commit/c4ea90068596ca88a6508b8a8664f923b92d3b7f)）

### 已知問題（預計 v0.6.30 修正）
- 面板偶爾失焦後沒有收起（BUG-013）
- 詳細頁較長的文字數值會被截斷（BUG-014）
- 設定頁高度超過 Windows 工作區（BUG-015）

**Full Changelog**: [v0.6.27...v0.6.29](https://github.com/gowerlin/openusage/compare/v0.6.27...v0.6.29)
```

### 驗證 Gate

| Gate | 結果 | 證據 |
|---|---|---|
| Publish run 成功 | PASS | run `38695730149` success |
| release / assets / `latest.json` / Latest | PASS | 非 draft / 非 prerelease；NSIS setup + `.sig` + `latest.json`；version `0.6.29`、URL 指向 fork；`v0.6.29 Latest` |
| fork 無非預期 tag / release | PASS | tag diff 只多 `v0.6.29`；release 清單只多 `v0.6.29` |
| release body + GitHub API body | PASS | `gh release view` 與 API body 都等於發行說明檔 |

### 偏離 / 阻塞 / 後續

- 阻塞：無。
- 偏離：無。`cargo test` 第一次是本機 libclang 環境問題，依既有環境做法重跑 PASS。
- 收尾 commit（本段 + metadata）只在本機，**沒有 push**（授權範圍只有步驟 5 的一次 `git push origin main`）。塔台需要時再推。
- 後續建議：
  1. README 補 `Perplexity`、`Synthetic` 兩行（既有缺口，見步驟 1）。
  2. `publish.yml` 的 Node.js 20 deprecation 警告（`actions/checkout@v4`、`ilammy/msvc-dev-cmd@v1`）— 之後可升版，本單不動 workflow。
  3. 截圖背景會帶到終端機文字（步驟 2 觀察）；之後 smoke 截圖可以只截 panel 區域或背景放空白視窗。
