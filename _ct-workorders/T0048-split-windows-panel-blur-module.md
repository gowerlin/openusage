---
schema_version: 1
schema_kind: workorder
id: T0048
title: Refactor - move Windows panel blur logic out of panel.rs
status: IN_PROGRESS
priority: Medium
type: refactor
bug_id: null
plan_id: PLAN-004
created_at: "2026-10-15T13:41:38+08:00"
updated_at: "2026-10-15T14:19:04+08:00"
started_at: "2026-10-15T14:19:04+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0047
affects_files:
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_blur.rs
  - src-tauri/src/lib.rs
  - plugins/claude/plugin.js
  - plugins/claude/plugin.test.js
  - plugins/codex/plugin.js
  - plugins/codex/plugin.test.js
  - src/lib/i18n-plugin-labels.ts
  - src/lib/i18n.test.ts
---

# T0048 Refactor - move Windows panel blur logic out of panel.rs

## 背景

T0043 後 `panel.rs` 515 行，超過 AGENTS.md「Keep files <~400 LOC」。

## 任務指令

1. 把 T0043 新增的 Windows blur-hide 邏輯（`hide_on_blur`、`should_hide_after_blur`、`is_recent_blur_hide`、debounce 狀態與其測試）移到新模組 `src-tauri/src/panel_blur.rs`（`#[cfg(windows)]` 範圍同原本）。
2. **純搬移，不改行為**。`panel.rs` 降到 ~400 行以下；若仍超過，只回報。
3. 不動 `panel_hit_test.rs`（BUG-001 高風險區）。
4. **附帶（獨立 commit，D079）**：BUG-011 提示文案在 400px 面板被 `max-w-[45%]` + `truncate` 截斷。改短文案：
   - en value：`Install Node.js (npx) or Bun to enable` → `Needs Node.js or Bun`
   - zh-TW value：`安裝 Node.js（npx）或 Bun 以啟用` → `需要 Node.js 或 Bun`
   - label `Usage history` / `用量歷史` 不變。同步改 claude / codex plugin、測試、`i18n-plugin-labels.ts` key 對應。不改元件排版。
   - Commit：`fix: shorten usage history runner hint (T0048)`。

## 驗證 Gate

- PASS：`cargo fmt --check`、`cargo check --all-targets`、`cargo test --locked`（測試數不減少）
- PASS：`bun run build`、`bun run test --run`、`bun run bundle:plugins`
- PASS：文案改短後，以實機或 browser dev 確認 zh-TW / en 都不被截斷（UIA 或截圖，無 `…`）。
- PASS：`git diff --stat` 顯示主要為搬移；回報 `panel.rs` 新行數。
- 實機 smoke 交給 T0044。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；若需停使用者的 OpenUsage，事後重啟並還原 `settings.json`（SHA256 比對）。
- 不 push、不 tag、不發行。

## 收尾

- Commit：`refactor(windows): move panel blur logic to panel_blur.rs (T0048)`，只含本單檔案 + 回報區。不 push。

## 回報區

### 結果

DONE。Windows blur-hide 邏輯搬到 `src-tauri/src/panel_blur.rs`，純搬移不改行為。`panel.rs` 515 → **401** 行。BUG-011 提示文案改短，zh-TW / en 在 400px 面板都不截斷。

### Landing Zone

- 結果：WARN（C-0）。
- C-0：frontmatter `repo` = absent；`basename(REPO_ROOT)` = `openusage`；REPO_ROOT = `D:/ForgejoGit/@GitHub_Clone/openusage` → WARN repo identity unavailable，改用 C-3 + C-1。
- C-1：PASS（工單在 REPO_ROOT 下）。
- C-3：PASS（`panel.rs`、`lib.rs`、`plugins/claude/plugin.js`、`plugins/claude/plugin.test.js`、`plugins/codex/plugin.js` 皆存在；`panel_blur.rs` 祖先 `src-tauri/src` 存在）。
- C-2：無 `branch` 欄位，略過。
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）。

### Commits

| commit | 內容 |
|---|---|
| `84a814e8` | `fix: shorten usage history runner hint (T0048)` |
| （本 commit） | `refactor(windows): move panel blur logic to panel_blur.rs (T0048)` |

### 改動

| 檔案 | 改動 |
|---|---|
| `src-tauri/src/panel_blur.rs`（新） | 搬入 `BLUR_CONFIRM_DELAY`、`TRAY_REOPEN_DEBOUNCE`、`should_hide_after_blur`、`is_recent_blur_hide`、`hide_on_blur`、`mod blur`（`LAST_BLUR_HIDE`、`record_blur_hide`、`take_recent_blur_hide`、`panel_owns_foreground`）與 2 個測試。程式本體逐字搬移，只改路徑（`super::` → 模組內 / `crate::panel::`）。 |
| `src-tauri/src/panel.rs` | 移除上述程式；`other::main_window` 改 `pub(crate)` 並在 Windows re-export 給 `panel_blur` 用；tray click 改呼叫 `crate::panel_blur::take_recent_blur_hide()`。 |
| `src-tauri/src/lib.rs` | `#[cfg(any(windows, test))] mod panel_blur;`；`on_window_event` 改呼叫 `panel_blur::hide_on_blur`。 |
| `plugins/claude/plugin.js`、`plugins/codex/plugin.js` + 測試 | value `Install Node.js (npx) or Bun to enable` → `Needs Node.js or Bun`。 |
| `src/lib/i18n-plugin-labels.ts`、`src/lib/i18n.test.ts` | en / key 對應改 `Needs Node.js or Bun`；zh-TW → `需要 Node.js 或 Bun`。label 不變。 |
| `_ct-workorders/assets/T0048/runner-hint-278px.png` | 截斷驗證截圖。 |

`git diff --stat`（refactor）：`lib.rs` 4、`panel.rs` 120（+2/−118）、`panel_blur.rs` +113 → 119 insertions / 118 deletions，主要為搬移。`panel_hit_test.rs` 未動。

### 驗證

| Gate | 指令 | 結果 | 證據 |
|---|---|---|---|
| source | `cargo fmt --check` | PASS | VsDevCmd x64 + `LIBCLANG_PATH` + `CI=false`，exit 0 |
| build | `cargo check --all-targets` | PASS | exit 0 |
| test | `cargo test --locked` | PASS | 149 passed / 0 failed（同 T0046 基準 149；2 個 blur 測試搬到 `panel_blur::tests`） |
| build | `bun run build` | PASS | exit 0（只有既有 chunk size 警告） |
| test | `bun run test --run` | PASS | 69 files / 1199 tests passed（文案改前改後皆同） |
| build | `bun run bundle:plugins` | PASS | Bundled 18 plugins |
| UI 截斷 | browser dev：Edge headless（與 WebView2 同 Chromium 引擎）載入 `dist` 實際 CSS，重建 text line 原 DOM/class | PASS | 卡片內容寬 = 400 − `p-6` 48 − border 2 − nav `w-12` 48 − `px-3` 24 = 278px；`max-w-[45%]` = 125.1px。en `Needs Node.js or Bun` 122px、zh-TW `需要 Node.js 或 Bun` 110px，`scrollWidth == clientWidth`，無 `…`。對照：舊文案 207 / 191px 截斷，畫面「安裝 Node.js（npx）…」與 T0047 實機截圖一致，佐證量測準確。截圖 `_ct-workorders/assets/T0048/runner-hint-278px.png`。 |
| runtime | 實機 smoke | 未執行 | 依工單交給 T0044 |

### 偏差

- `BLUR_CONFIRM_DELAY` 原為 `#[cfg(any(windows, test))]`，測試沒用到；改 `#[cfg(windows)]`，避免非 Windows 測試 build 出 dead-code 警告。其餘 `cfg(any(windows, test))` 改由 `lib.rs` 的 `mod panel_blur` 一處控制。行為不變。
- `other::main_window` 由私有改 `pub(crate)`（僅 Windows re-export），供 `panel_blur` 呼叫，未複製程式。
- 截斷驗證用 browser dev（Edge headless + 實際 CSS）而非實機 WebView2 截圖；工單允許「實機或 browser dev」。
- en 文案餘裕只有約 3px（122 / 125.1）。若字型或面板寬度日後改變，可能再截斷。

### 阻礙

無。

### 後續

- 實機 smoke：T0044。
