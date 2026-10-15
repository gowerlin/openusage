---
schema_version: 1
schema_kind: workorder
id: T0047
title: Show a hint when usage history needs Node.js or Bun
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-011
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T14:08:13+08:00"
started_at: "2026-10-15T14:08:13+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0046
affects_files:
  - plugins/claude/plugin.js
  - plugins/claude/plugin.test.js
  - plugins/codex/plugin.js
  - plugins/codex/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src/lib/i18n.ts
  - src/hooks/app/use-tray-icon.ts
  - docs/providers/devin.md
---

# T0047 Show a hint when usage history needs Node.js or Bun

## 背景

收斂 T0038 / T0039 / T0042 記下的三個前端 / 文件小問題。

## 任務指令

1. **BUG-011 no_runner 提示**：claude / codex plugin 收到 ccusage `no_runner` 時，輸出一行 text line（label `Usage history`，value `Install Node.js (npx) or Bun to enable`）。比照 plugin 既有 text line 寫法；加入 `i18n-plugin-labels.ts`（zh-TW：`用量歷史` / `安裝 Node.js（npx）或 Bun 以啟用`）。有 runner 時不輸出。更新測試 `omits token lines when ccusage reports no_runner`。
2. **Tray tooltip 語言即時更新**（D072）：語言切換後立即重算 tray tooltip（`use-tray-icon.ts` 監聽 `language`）。Windows `keepDesktopTrayIcon` 若本來就不更新 tooltip，保持該設計。補測試。
3. **Devin 文件**（D073）：`docs/providers/devin.md` 補 Windows 憑證路徑 `%APPDATA%\devin\credentials.toml`、Windows 只支援 Devin CLI 登入（與 README / T0039 一致）。
4. AGENTS.md：plugin 變動 → 確認新增 text line 不含敏感欄位（靜態提示）。

## 驗證 Gate

- PASS：`bun run test --run`、`bun run build`、`bun run bundle:plugins`
- PASS：實機（release exe，cwd `%TEMP%`）：只對測試 process 設定 PATH 讓它找不到任何 runner（不改系統設定）→ Claude 詳細頁出現提示行（zh-TW）；恢復後提示消失、Usage Trend 顯示。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`fix: hint when usage history needs a runner, tray tooltip and devin docs (T0047)`，只含本單檔案 + 回報區。不 push。

## 回報區

### 狀態

DONE。所有 gate PASS。

### 落點檢查

- C-0：WARN — 工單無 `repo` 欄位（`absent`）；`basename(REPO_ROOT)` = `openusage`。依 C-3 + C-1 判定。
- C-1：PASS — 工單在 `D:/ForgejoGit/@GitHub_Clone/openusage/_ct-workorders/` 下。
- C-3：PASS — 8/8 `affects_files` 存在。
- C-2：N/A（無 `branch` 欄位），HEAD = `main`。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。`CT_MODE=yolo`。

### 改動

| 檔案 | 內容 |
|---|---|
| `plugins/claude/plugin.js` | ccusage `no_runner` → text line `Usage history` / `Install Node.js (npx) or Bun to enable`。`ok` / `runner_failed` 不輸出。 |
| `plugins/codex/plugin.js` | 同上（codex host 沒有 ccusage API 時也回 `no_runner`，同樣顯示提示）。 |
| `plugins/claude/plugin.test.js` | `omits token lines when ccusage reports no_runner` 加提示行斷言；`runner_failed`、`adds Today line`（ok）斷言無提示行。 |
| `plugins/codex/plugin.test.js` | 同上（no_runner 有提示；ok 路徑無）。 |
| `src/lib/i18n-plugin-labels.ts` | 新 key `pluginLabel.usageHistory`（`用量歷史`）、`pluginLabel.installRunnerHint`（`安裝 Node.js（npx）或 Bun 以啟用`）；`DISPLAY_LABEL_KEYS` 加 `Usage history`；新 `DISPLAY_VALUE_KEYS`（只含這一個 value）。 |
| `src/lib/i18n.ts` | 新 `translateDisplayValue()`（同 `translateDisplayLabel` 寫法）。 |
| `src/lib/i18n.test.ts` | 提示 label / value 翻譯測試；其他 value（`Free`）不翻譯。 |
| `src/components/provider-card-metric-line.tsx` | text line value 走 `translateDisplayValue`（見偏差 1）。 |
| `src/hooks/app/use-tray-icon.ts` | 訂閱 `useAppPreferencesStore` 的 `language`，加入 settings effect 依賴 → 語言切換後立即重算 tooltip。Windows `keepDesktopTrayIcon` 早退設計不變。 |
| `src/hooks/app/use-tray-icon.test.ts` | 新檔：非 Windows 切語言 → `setTooltip` 由 `tooltip:en` 變 `tooltip:zh-TW`；Windows 切語言 → 不呼叫 `setTooltip` / `setIcon`。 |
| `docs/providers/devin.md` | Requires 註明 Windows 只支援 `devin auth login`；Auth Sources 加 Windows 路徑 `%APPDATA%\devin\credentials.toml`；說明 Windows 跳過 app SQLite 與錯誤訊息（與 README `:43`、plugin `WINDOWS_LOGIN_HINT` 一致）。 |
| `_ct-workorders/assets/T0047/*.png` | 實機截圖（無 runner / 有 runner）。 |

### 敏感欄位稽核（AGENTS.md）

新增 text line 是固定字串，不含任何 request / response 欄位、token、路徑或帳號資料；不需要動 `host_api.rs` 遮罩清單。

### 驗證證據

| Lane | Gate | 結果 | 證據 |
|---|---|---|---|
| build/test | `bun run test --run` | PASS | 69 files / 1199 tests |
| build/test | `bun run build` | PASS | exit 0（只有既有 chunk > 500 kB 提示） |
| build/test | `bun run bundle:plugins` | PASS | `Bundled 18 plugins: ...` |
| build/test | tray 測試反向對照 | PASS | 暫時移除 `language` 依賴 → `recomputes the tray tooltip when the language changes` FAIL；還原後 PASS。 |
| runtime | 實機：無 runner | PASS | release exe（`bun tauri build --no-bundle`，VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`），cwd `%TEMP%`，只對測試 process 設 PATH = `C:\Windows\System32;C:\Windows;...Wbem;...WindowsPowerShell\v1.0`（`~/.bun/bin`、`~/.nvm` 本機不存在）。Log：`[plugin:claude] no package runner found for ccusage query` → `probe claude completed ok (3 lines)`。UIA（zh-TW）：`用量歷史`、`安裝 Node.js（npx）或 Bun 以啟用`。截圖 `_ct-workorders/assets/T0047/claude-detail-no-runner-hint.png`。 |
| runtime | 實機：有 runner | PASS | 同 exe、一般 PATH（bun = `C:\ProgramData\chocolatey\bin\bun.exe`）。Log：`ccusage query via bunx Current (bun.exe)` → `probe claude completed ok (11 lines)`。UIA：`今天 $54.56 · 142M tokens`、`昨天`、`過去 30 天`、`用量趨勢：25 天，最近 142M tokens（10/15），峰值 1.7B tokens。`；`用量歷史` / `安裝 Node` 出現 0 次。截圖 `_ct-workorders/assets/T0047/claude-detail-with-runner.png`。 |
| runtime | tray tooltip 實機 | 未實測 | 只有單元測試。Windows 本來就不更新 tooltip（`keepDesktopTrayIcon`），實機上看不到差異；macOS / Linux 無環境。 |

### 環境 / 清理

- 停過使用者的 OpenUsage（pid 36284）。`settings.json` 備份 SHA256 `1F5230ACA5040B2AA615EED1A77F363F6CA0896058999629450B3C965319D020`；smoke 時暫時加 `logLevel: "info"`。收尾已還原，SHA256 一致；已用安裝目錄當 cwd 重啟已安裝版（pid 39032），重啟後 SHA256 仍一致。
- release exe 直接從 `src-tauri/target/release` 執行（帶 `resources/bundled_plugins`），沒覆蓋 `%LOCALAPPDATA%/OpenUsage/openusage.exe`（SHA256 `126393F1067A94DBAAA7C4E384FEAA7F8EC1199EB58936197114BD781B7AE08B` 前後一致）。
- release 版啟動時清掉 AppData 的 `windsurf` plugin（T0046 已知行為）；已安裝版重啟後 `plugins\windsurf` 已補回。
- 收尾時 ccusage 相關程序 0。沒改 registry。沒 push / tag / 發行。

### 偏差

1. **多改 `src/components/provider-card-metric-line.tsx`（不在 `affects_files`）**：原本只翻譯 line label，text value 一律原樣顯示，所以 zh-TW 的 value 一定要元件呼叫翻譯才會出現（gate 要求 zh-TW）。只改 text line 一處；用獨立的 `DISPLAY_VALUE_KEYS`（只含這一個字串），不拿 `DISPLAY_LABEL_KEYS` 翻 value，避免 `Free` / `Pro` 這類 plan value 被意外翻譯。
2. **新增 `src/hooks/app/use-tray-icon.test.ts`**（工單要求「補測試」，原本沒有這個 hook 的測試檔）。
3. **新增 `_ct-workorders/assets/T0047/` 截圖**（比照 T0042 存證）。
4. 修改過的檔案工作目錄行尾從 CRLF 變 LF（index 都是 LF，`core.autocrlf=true`，diff 內容不受影響）。

### 給塔台的觀察（不在本單範圍）

- **提示 value 被截斷**：text line value 有 `max-w-[45%]` + `truncate`，400px 面板上顯示為「安裝 Node.js（npx）…」（滑鼠移上有完整 title）。英文更長也會截斷。若要完整顯示：縮短文案（例如 `需要 Node.js 或 Bun` / `Needs Node.js or Bun`），或讓這行用 `subtitle` / 允許換行。需塔台決定文案或排版，本單照工單字串實作。

### Commit

見 frontmatter `commit`（`fix: hint when usage history needs a runner, tray tooltip and devin docs (T0047)`），未 push。
