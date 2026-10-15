---
report_for: T0037
plan_id: PLAN-004
created_at: "2026-10-15T12:34:17+08:00"
upstream_ref: "upstream/tauri-legacy @ 0a08306d (v0.6.28)"
fork_ref: "main @ 016db271 (v0.6.27)"
merge_base: "f415ddd (v0.6.24)"
---

# T0037 上游同步研究報告

## 1. 摘要

`upstream/tauri-legacy`（65 commit，含 merge）可以合併進 fork。以當下 `main` 重跑 `git merge-tree`，衝突是 **17 個檔**。數量跟塔台預查一樣，但 PLAN-004 的清單只列了 16 個，漏掉的是 `src/lib/settings.test.ts`。全部都是小 hunk，沒有一個需要重寫邏輯。

在暫存 worktree 做了完整試合併（照下表解法 + 移除退休橫幅 + 保留 Gemini），結果全綠：
- `cargo check --all-targets`：PASS（1 個 dead_code 警告：`run_ccusage_with_runner`）
- `cargo test --locked`：PASS（137 passed）。`--locked` 通過，代表 `Cargo.lock` 的文字合併結果一致
- `tsc --noEmit`：PASS
- `vitest run`：PASS（67 files / 1156 tests），另 Gemini 還原後 32/32 PASS

試合併另外修了 2 個「不是衝突、但合併後會壞」的點：`provider-card.tsx` 自動合併進來沒用到的 `UsageSparkline` import（tsc 錯），以及 fork 的 antigravity 測試仍期待舊訊息 `Start Antigravity and try again.`（上游 `2fa079a7` 改了訊息）。

**推薦方案 A**：一張實作工單做 merge + 衝突解決 + 必要修正（版號 `0.6.29`），i18n 補字串、Devin Windows 行為另開小工單，最後走既有發行流程。v0.7.x 的功能只當作點子清單，不在這次合併範圍。

使用者已決定（本工單互動）：**保留 Gemini（fork 專屬）**、**版號 0.6.29**。

## 2. 衝突總表

風險：低 = 機械性處理；中 = 需要移植或還原檔案；高 = 可能破壞 Windows 行為（本表沒有高風險項目）。

| # | 檔案 | 類型 | 上游改動 | fork 改動 | 建議解法 | 風險 |
|---|---|---|---|---|---|---|
| 1 | `package.json` | content | 版號 0.6.28（`0a08306d`）；依賴升級見 §5/§Q7 | 版號 0.6.27（T0036） | 版號寫 `0.6.29`，其他自動合併 | 低 |
| 2 | `src-tauri/Cargo.toml` | content | 版號；`rquickjs 0.12`、`tauri-plugin-clipboard-manager 2.3.2`、`serial_test 3.5.0`（已自動合併） | 版號；`tauri-nspanel` 改成只在 macOS、`windows` crate、`tauri-plugin-single-instance`（已保留） | 版號 `0.6.29` | 低 |
| 3 | `src-tauri/tauri.conf.json` | content | 版號 | 版號 | `0.6.29`。updater endpoint 仍是 `gowerlin/openusage`（已確認） | 低 |
| 4 | `src-tauri/Cargo.lock` | content | 版號 + `cargo update` 安全更新（`19209e85`、`b1b4d32b`） | 版號 + windows/single-instance 依賴 | 只有 `openusage` 版號這一個 hunk；寫 `0.6.29`。`cargo test --locked` 已證實其他部分一致 | 低 |
| 5 | `src-tauri/src/lib.rs` | content | `.plugin(tauri_plugin_clipboard_manager::init())`（`f33e6c09` Copy Log Path）；`tauri_nspanel::init()` 沒加條件 | single-instance 放第一個（T0032）；`tauri_nspanel` 只在 macOS（Windows port） | 保留 fork 結構，在 store plugin 前插入 clipboard plugin。以下已自動合併：probe worker pool（`abc68e85`）、`log_path`（`53d10b83`）、離開時 flush cache（`810b1226`）、`weekly_candidate`（`14653257`） | 中（試合併已驗證） |
| 6 | `src-tauri/src/panel.rs` | content（對齊錯位） | `aa424a4c`：panel 被 clamp 在可見螢幕內（macOS 選單列自動隱藏時） | 整檔拆成 `macos` / `other` 兩個模組（T0022–T0031 subclass/mask、`b354778a` 位置記憶） | 衝突 hunk 取 fork 版（`show_panel`）；clamp 手動套用到 `macos::position_panel_at_tray_icon` 的 `panel_y`：`(icon_logical_y + icon_logical_h - nudge_up).max(mon_logical_y)` | 低（只影響 macOS；Windows 沒有執行路徑） |
| 7 | `src-tauri/src/tray.rs` | content | Copy Log Path 選單項（`f33e6c09`/`53d10b83`），import 了 `tauri_nspanel::ManagerExt`、`Manager` | 移除 nspanel import，改用 `toggle_panel_at_tray_icon`（Windows port、T0023/T0024） | 保留 fork 的 import，再加 `tauri_plugin_clipboard_manager::ClipboardExt` 和 `crate::log_path`。選單項本身已自動合併 | 低 |
| 8 | `src-tauri/src/local_http_api/cache.rs` | content | cache 寫入改成 debounce + `flush_cache()`（`810b1226`） | 只有 rustfmt 格式調整 | 取上游 | 低 |
| 9 | `src/components/provider-card.tsx` | content | `MetricLineRenderer` 加 `barChart`（Usage Trend）和 text 行版面調整（`a6b581fb`） | renderer 已搬到 `provider-card-metric-line.tsx`（T0015 i18n） | 取 fork 版（刪掉上游整段）；刪掉自動合併進來沒用到的 `UsageSparkline` import；把 3 處改動移植到 `provider-card-metric-line.tsx`（import、text 行 class、`barChart` 分支用翻譯後的 `label`） | 中 |
| 10 | `src/components/skeleton-lines.tsx` | content | `case "barChart"` → `SkeletonBarChart` | label 改用 `translateDisplayLabel`（T0015） | 兩邊都留：`SkeletonProgress label={label}` + `SkeletonBarChart label={label}` | 低 |
| 11 | `src/pages/overview.tsx` | content ×2 | 退休橫幅 `<RetirementNotice />`（`ff9e8ca7`） | i18n 空狀態（T0015） | **整檔取 fork 版**（只取 hunk 不夠，hunk 外的 body 還是上游的橫幅版本） | 低 |
| 12 | `src/hooks/app/use-settings-bootstrap.test.ts` | content ×2 | menubar metric 測試 ×2、Windsurf→Devin migration 測試 | language 測試（T0014） | 兩邊都留（fork 的 language 測試 + 上游 3 個測試） | 低 |
| 13 | `src/lib/settings.test.ts` | content | 退休橫幅測試 ×8（`ff9e8ca7`、`7d51e5b0`） | language 測試 ×4（T0014） | 取 fork 版；同時刪掉頂部 4 個 retirement import | 低 |
| 14 | `plugins/gemini/plugin.js` | modify/delete | 刪除（`2fa079a7`，改用 Antigravity/agy） | Windows npm/pnpm/Volta 路徑（`3a94c9eb`） | **使用者決定保留**：取 fork 版 | 中 |
| 15 | `plugins/gemini/plugin.test.js` | modify/delete | 刪除 | Windows 路徑測試 | 保留 fork 版 | 中 |
| 16 | `plugins/windsurf/plugin.js` | modify/delete | 刪除（`4848fcee` 換成 Devin；`cad84687` 開機時移除已安裝的 windsurf） | 在 Windows 明確 throw unsupported（`3a94c9eb`） | 接受刪除（fork 版在 Windows 本來就不能用）。Devin 的 Windows 行為見 §3 | 中 |
| 17 | `plugins/windsurf/plugin.test.js` | modify/delete | 刪除 | Windows unsupported 測試 | 接受刪除 | 低 |

**⚠️ 保留 Gemini 的隱藏陷阱**：`plugins/gemini/plugin.json`、`plugins/gemini/icon.svg`、`docs/providers/gemini.md` 這三個檔 fork 沒改過，所以 merge 會**直接自動刪掉、不會報衝突**；`README.md` 的 Gemini 行也會被自動移除。實作時要用 `git checkout HEAD -- plugins/gemini docs/providers/gemini.md` 還原，並把 README 那行加回去。試合併已驗證還原後 32/32 測試通過、`bundle:plugins` 正常。

**合併後要另外修（不是衝突）**：
- `plugins/antigravity/plugin.test.js:212`：`toThrow("Start Antigravity and try again.")` 改成 `toThrow(LOGIN_MESSAGE)`（fork 的 T0004 測試 vs 上游 `2fa079a7` 的新訊息）。
- fork 的 Antigravity「LS unsupported」防護已被 git 正確放進上游新的共用函式 `probeDiscovery()`，同時涵蓋 `discoverLs` 和新的 `discoverAgyLs`，不用再動。

## 3. 語意風險清單（自動合併、不會報衝突的檔）

| 檔案 | 風險 | 建議 |
|---|---|---|
| `AGENTS.md` | **高（影響 agent 行為）**。自動合併會把 fork 開頭的指示（`DO NOT OVER-ENGINEER`、內部 2–5 人使用、research 規則）整段換成上游的版本：Swift rollout guardrails、`@hugeicons-pro` 強制規定、「public-facing app」、長篇 Agent Guidance | `git checkout --ours AGENTS.md`，整檔保留 fork |
| `CLAUDE.md` | 上游改成 `Use the AGENTS.md instead. Do not edit this file.` | `--ours`（維持 `CRITICAL: Read AGENTS.md for instructions!`） |
| `README.md` | Gemini 行被移除、Devin 行加入、Windsurf 行移除；fork 自己的 README 改動有保留 | 把 Gemini 行加回去；Devin / Windsurf 照上游 |
| `CHANGELOG.md` | 會加入上游的 v0.6.25–v0.6.28 段落和 v0.6.1 補記，都連到 robinebers。這幾個版號跟 fork 的 release 同名但內容不同。App 內的 changelog 讀的是 fork 的 GitHub releases（T0034，`use-changelog.ts` 的 `GITHUB_REPO = "gowerlin/openusage"`），所以**不影響 app** | 接受（只是文件歷史）；可選擇在 v0.6.29 段落註明「合併自上游 tauri-legacy v0.6.25–v0.6.28」 |
| `src/pages/settings.tsx` | 新的 menubar「Metric」區塊是**寫死的英文**：`Metric`、`aria-label="Menubar metric"`，選項 `Default` / `Weekly` 來自 `MENUBAR_METRIC_OPTIONS`（`settings.ts`） | 補 i18n key（en / zh-TW），寫法比照 `settings.menubarIcon.*` |
| `src/components/usage-sparkline.tsx` | aria / title 的摘要文字是英文（`days`、`latest`、`peak`、`on`） | 補 i18n（只影響輔助文字，優先度低） |
| `src/lib/tray-tooltip.ts` | weekly 模式下的 tag 直接用 `bar.label`（英文的 plugin label） | 可選：改成 `translateDisplayLabel` |
| plugin labels | 新 label `Usage Trend`、`Rate Limit Resets` 不在 `src/lib/i18n-plugin-labels.ts` 裡（沒翻譯時會顯示英文，不會壞） | 加進 label 表。Devin 的 label（`Daily quota` 等）也需要盤點 |
| `src/components/side-nav.tsx` | provider 列表改成可捲動（`1c2e1130`）；fork 的 Help 連結（T0035）有保留 | 只需要 runtime smoke |
| `App.tsx` / `app-content.tsx` / `use-tray-icon.ts` / `app-preferences-store.ts` | menubar weekly metric 的接線，已自動合併，tsc 通過 | Windows tray tooltip 需要 smoke |
| `src-tauri/src/plugin_engine/host_api.rs` | 兩邊都大改（上游 +727 行：per-probe deadline、Devin token redaction；fork +226 行：Windows unsupported 路徑），沒有文字衝突 | 編譯 + 測試已 PASS；fork 的 `unsupported_host_api_*` 都還在。需要 Windows runtime smoke |
| `src-tauri/src/plugin_engine/mod.rs` | 開機時刪除 `<AppData>\plugins\windsurf`（`remove_dir_all`），Windows 適用。`gemini` **不在**退休清單裡，這跟「保留 Gemini」的決定一致 | 不用改 |
| `src-tauri/capabilities/default.json` | 新增 `clipboard-manager:allow-write-text` | 接受 |
| `src/lib/settings.ts` | `migrateWindsurfToDevin` 標著 `TODO(remove after 2026-09-01)`。fork 使用者還沒跑過這個 migration | **保留**，不要因為日期過了就刪 |
| `get_log_path`（`lib.rs`） | 好處：fork 現在的版本在 Windows 回傳 macOS 路徑（`~/Library/Logs/...`），是潛在 bug。上游的 `log_path::for_app` 用 `app_log_dir()`，在 Windows 會是 `%LOCALAPPDATA%\com.sunstory.openusage\logs\…`，跟 `docs/capture-logs.md` 一致 | 接受；smoke 時驗證 tray 的「Copy Log Path」 |
| Devin plugin（取代 Windsurf） | 在 Windows：讀 `~/.local/share/devin/credentials.toml`（Windows 是否用這個路徑**未驗證**），失敗後 fallback 到 sqlite（Windows 不支援，被 catch 後只記 warn），最後顯示登入提示，**不會 fail loud** | 另開小工單：確認 Devin 在 Windows 的憑證位置；找不到就比照 Windsurf 舊做法，明確 throw Windows unsupported |
| Antigravity 在 Windows | agy keychain 只有 macOS（會被 catch 記 info）；state DB 是 macOS 路徑；LS 會回 unsupported。最後顯示 `Start Antigravity or run \`agy\`…`。這是既有限制，不是這次合併造成的退步 | 記錄即可，不在這次範圍 |
| 指回上游的連結 | 移除橫幅後，合併結果的 `src/`、`src-tauri/src` 裡**沒有** `robinebers` / `openusage.ai`（只剩 `host_api.rs` 的 redaction 測試資料，這在 fork 本來就有）。About / Help / changelog（BUG-005、T0034、T0035）都沒被蓋掉 | 不用改 |
| `.github/**` | 上游只改了 `.github/ISSUE_TEMPLATE/config.yml`（`d88abd16`，移除 General Question）。`publish.yml` / `pre-release.yml` 沒動 | 接受或排除都可以（低） |

## 4. 退休橫幅排除方案

牽涉 commit：`ff9e8ca7`、`d4b8564b`、`7d51e5b0`（PR #616，merge `6dfbc5ef`）。

牽涉檔案：
- `src/components/retirement-notice.tsx`（新檔）
- `src/components/retirement-notice.test.tsx`（新檔）
- `docs/retirement-notice.md`（新檔）
- `src/lib/settings.ts`：`RETIREMENT_NOTICE_DISMISSED_AT_KEY`、`RETIREMENT_NOTICE_INTERVAL_MS`、`loadRetirementNoticeDismissedAt`、`saveRetirementNoticeDismissedAt`、`shouldShowRetirementNotice`
- `src/lib/settings.test.ts`：4 個 import + 8 個測試（衝突 #13 處理時就會丟掉）
- `src/pages/overview.tsx`（衝突 #11 取 fork 版時就會丟掉）

**推薦的最小做法**：
1. 合併 commit 裡：`overview.tsx` 和 `settings.test.ts` 依衝突表取 fork 版。這時候 `retirement-notice.*` 還在，但沒有地方用到，可以編譯、測試也會過，所以合併 commit 本身是一致的狀態。
2. 緊接著一個獨立 commit：`chore: drop upstream retirement notice (PLAN-004)`。`git rm` 3 個新檔，並從 `settings.ts` 刪掉常數和 3 個函式。

為什麼不用 `git revert`：合併之後再 revert 那 3 個 commit，會在已經解掉的 `overview.tsx` / `settings.test.ts` 再衝突一次，比直接刪還麻煩。拆成獨立 commit，之後要追溯或反悔都清楚。試合併已驗證刪除後 tsc + vitest 全部 PASS，`src/` 和 `docs/` 裡完全沒有殘留的 `retirement` 字串。

## 5. 排除清單（不帶進來的上游改動）

| 上游改動 | commit | 處理 | 理由 |
|---|---|---|---|
| 退休通知橫幅 | `ff9e8ca7`、`d4b8564b`、`7d51e5b0` | 排除（§4） | 使用者決策 D067 |
| 刪除 Gemini plugin | `2fa079a7`（Gemini 部分） | 排除（保留 Gemini） | 使用者決定（本工單） |
| `AGENTS.md` / `CLAUDE.md` 改寫 | `445f571f`、`b2b617f6` | 排除（`--ours`） | 內容是上游的 Swift rollout 規則和 agent 偏好，跟 fork 不符 |
| `.agents/skills/release-tag` → `release-tauri` | `445f571f`、`9d7fef74`、`68e42093`、`dcf18db8` | 排除（保留 fork 的 `release-tag`，不加 `release-tauri`） | 內容是上游雙版本（Tauri/Swift）的發行規則；fork 用自己的 `publish.yml` 和塔台流程 |
| 上游版號 bump | `860a16b5`、`8a5b3376`、`87c1b9b0`、`0a08306d` | 版號欄位改寫成 `0.6.29`；CHANGELOG 內容接受 | 避免 tag 撞名 |
| Windsurf plugin 刪除 | `4848fcee`、`cad84687` | **接受** | fork 版在 Windows 本來就不能用；由 Devin 取代 |
| `.github/ISSUE_TEMPLATE/config.yml` | `d88abd16` | 接受（或排除，低風險） | 不影響 workflow |

**Q7 依賴與安全更新對 Windows build 的影響**：
- npm（`52f5588d`、`b1b4d32b`）：`vite ^8.0.16`、`vitest ^4.1.0`、`@vitest/coverage-v8 ^4.1.0`，`overrides` 把 `picomatch 4.0.4`、`undici 7.28.0`、`vite 8.0.16` 鎖住。`bun.lock` 自動合併；試合併的 `bun install` 沒有改動 lock，vitest 4.1.7 跑通。
- Rust（`19209e85`、`b1b4d32b` + dependabot）：tauri 2.11.2、tauri-build 2.6.2、reqwest 0.13.4、tokio 1.52.3、rquickjs 0.11→0.12、global-shortcut、log、uuid、serde_json、opener，以及新的 `tauri-plugin-clipboard-manager`。Windows 上 `cargo check` / `cargo test --locked` 都 PASS（需要 VS18 `VsDevCmd` x64 + `LIBCLANG_PATH`，`rquickjs-sys` 要用到 libclang，跟現行環境需求一樣）。
- **沒驗證到的**：NSIS 打包（`bun tauri build`）和 CI `publish.yml`。這兩項留給實作 / 發行工單。

## 6. 版號建議

**決定：`0.6.29`**（使用者已確認）。
- 不會跟上游的 `v0.6.28` 撞名（上游 v0.6.26–v0.6.28 的內容本來就跟 fork 同名 tag 不同）。
- Updater：`tauri.conf.json` 的 endpoint 合併後仍是 `https://github.com/gowerlin/openusage/releases/latest/download/latest.json`；semver 比較 0.6.29 > 0.6.27，現有使用者會正常升級。
- **⚠️ Tag 外洩風險（重要）**：本機 clone 已經從 upstream fetch 了 `v0.6.28`（指向上游 `0a08306d`）和全部 `v0.7.*` tag（origin 上沒有這些）。如果有人執行 `git push --tags`：
  - 上游的 `v0.6.28` 會被推到 fork，觸發該 commit 裡上游版本的 `publish.yml`；
  - `v0.7.*` 也可能觸發 Swift 的 workflow；
  - 結果可能污染 fork 的「Latest」release，進而弄壞 updater。
  - 建議：
    1. 發行時只推指定 tag：`git push origin v0.6.29`；
    2. 設定 `git config remote.upstream.tagOpt --no-tags`；
    3. 刪掉本機那些上游專屬 tag（屬於刪除動作，需要使用者另外同意）。

## 7. v0.7.x 移植候選表（只列清單，不做移植）

Tauri 版（合併 tauri-legacy 後）**已經有**：Usage Trend 圖、Codex rate-limit resets、weekly menubar metric、Devin、Antigravity/agy、Copy Log Path。下表只列 Tauri 版沒有的功能。

| 功能 | 上游來源 | 規模 | 建議 | 理由 |
|---|---|---|---|---|
| Copilot AI Credits + Extra Usage、組織層級用量 | v0.7.1、v0.7.3 | M | **移植** | Copilot 計費模式改了；Tauri 版只有 `Premium` / chat / completions，數字可能不準 |
| OpenCode Go 改用官方 usage API | v0.7.9 | S–M | **移植** | provider 正確性 |
| Grok 每週共用額度 meter | v0.7.3 | S | **移植** | Tauri 的 grok plugin 沒有 weekly |
| Claude「Rate Limit Resets」列（reset grants） | v0.7.13 | S–M | **移植** | 寫法可以比照 Codex 那列（Tauri 已有） |
| Claude Fable 模型專屬的每週限額 | v0.7.1 | S | **移植** | Tauri 的 claude plugin 沒有 |
| Codex Dashboard 連結修正（`chatgpt.com/settings/usage`） | v0.7.15-beta.1 | S | 移植（順手） | Tauri 目前是 `chatgpt.com/codex/settings/usage` |
| Cursor Grok Bot 用量、模型名稱對齊 | v0.7.10 | S–M | 視需要 | 有在用 Cursor 的人才有價值 |
| Ollama Cloud（opt-in） | v0.7.11 | M | 視需要 | 新 provider；先確認團隊有沒有在用 |
| OpenRouter（API key） | v0.7.1 | M | 暫不 | Tauri 沒有輸入 API key 的 UI，要另外做設定 |
| OpenCode Zen 花費（本機 log） | v0.7.4 | M | 暫不 | 要寫 log scanner |
| Pace 提醒通知 | v0.7.1 | M | 暫不 | 要加 notification plugin 和設定 |
| `/v1/limits` 機器可讀 API + CLI | v0.7.6 | M | 暫不 | Tauri 已有 `/v1/usage`；使用者 2–5 人，價值低 |
| Reset All Settings（含確認） | v0.7.8 | S | 可選 | 小功能 |
| Report an Issue 選單（指向 fork issues） | v0.7.14 | S | 可選 | 要指向 fork |
| 多個 Claude 帳號 / 多個 Codex home | v0.7.10、v0.7.13–14 | L | 不移植 | 現在的 plugin 模型是一個 plugin 一張卡 |
| Total Spend 環形卡、原生 log scanner、動態計價（拿掉 ccusage） | v0.7.3–v0.7.4 | L | 不移植 | 架構差太多 |
| Copy as Image / Share Screenshot | v0.7.1 | M | 不移植 | 價值低 |
| iCloud 同步、螢幕分享時隱藏、Sparkle、透明度 | v0.7.2–v0.7.6 | — | 不移植 | 只有 macOS 能用 |

## 8. 建議的實作工單拆分

1. **T-A：Merge `upstream/tauri-legacy` + 衝突解決**（主要；版號 `0.6.29`）
   - 照 §2 解 17 個衝突；照 §2 還原 Gemini 的 3 個自動刪除檔和 README 行；照 §3 對 `AGENTS.md` / `CLAUDE.md` 取 `--ours`；不加 `release-tauri`；修 antigravity 測試和 `UsageSparkline` import。
   - 第二個 commit：移除退休橫幅（§4）。
   - 驗證：`bun run bundle:plugins` → `cargo check --all-targets`、`cargo test --locked`、`tsc --noEmit`、`vitest run`（試合併的基準：137 / 1156 / Gemini 32）。
   - 用一般 merge commit（不要 squash），這樣之後再同步上游時 merge-base 才會往前移。
2. **T-B：i18n 補字串**：settings 的 Metric 區塊、`MENUBAR_METRIC_OPTIONS`、usage-sparkline 的 aria 文字、`Usage Trend` / `Rate Limit Resets` / Devin label、tray tooltip（可選）。可以接在 T-A 後面，也可以併進 T-A。
3. **T-C：Devin plugin Windows 行為**：確認 Windows 憑證路徑；找不到就明確 fail loud（比照舊 Windsurf）。補測試；在 `host_api.rs` 稽核 redaction（依 AGENTS 規則）。
4. **T-D：Windows runtime smoke + 本機 NSIS 打包**：panel / mask / single-instance / tray（含 Copy Log Path、weekly metric tooltip）、Usage Trend 渲染、Gemini、Devin、Windsurf 舊 plugin 清除。
5. **T-E：發行 v0.6.29**：只推指定 tag（§6 的 tag 外洩風險），驗證 `latest.json`。
6. （之後再說）**v0.7.x 移植**：先從 §7 標「移植」的 S 級 provider 修正開始，每個 provider 一張小工單。

## 殘留風險

- macOS 的 clamp 修正（`aa424a4c`）在 Windows 無法做 runtime 驗證，只確認了編譯。
- Devin / Antigravity 在 Windows 的實際行為沒有 runtime 驗證。
- NSIS 打包和 CI 沒跑。
- 新 plugin label 的盤點是用 regex 從 `plugin.json` / `plugin.js` 抓字面字串，執行時動態產生的 label 可能有漏掉。
