---
schema_version: 1
schema_kind: workorder
id: T0018
title: Research theme architecture and token inventory
status: IN_PROGRESS
type: research
intervention_type: fire-and-forget
created_at: "2026-05-24 11:32:21 +08:00"
started_at: "2026-05-24T11:46:02+08:00"
completed_at: null
updated_at: "2026-05-24T11:51:36+08:00"
commit: null
bug_id: null
plan_id: PLAN-003
sizing: medium
affects_files:
  - "read-only inventory; Worker to identify theme source files"
depends_on:
  - PLAN-003
  - PLAN-002
---

# T0018 Research Theme Architecture And Token Inventory

## 元資料
- **工單編號**：T0018
- **任務名稱**：Research theme architecture and token inventory
- **狀態**：IN_PROGRESS
- **建立時間**：2026-05-24 11:32:21 (UTC+8)
- **開始時間**：2026-05-24 11:46:02 (UTC+8)
- **完成時間**：-
- **目標子專案**：frontend / theme system
- **關聯 PLAN**：PLAN-003
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `read-only inventory; Worker to identify theme source files`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 theme system 分散，先完成 source inventory、theme id / token proposal、implementation split；不直接改 source。

## Session 建議
- **建議類型**：新 Session
- **原因**：需要盤點現有 theme store、CSS token、Settings selector、persistence 與 tests。

## 規格層級自問

- [x] **目標層**：研究 / 盤點。為 PLAN-003 實作三個馬卡龍 theme preset 提供具體方案。
- [x] **決策權歸屬**：Worker 可推薦 token 命名與最小實作拆單，但不得直接實作。
- [x] **資訊完整度**：PLAN-003 已定義粉紅、粉綠、粉藍三個馬卡龍主題與驗收條件。
- [x] **回頭成本**：中。theme token 一旦落地會影響大量 UI surface，先研究可降低返工。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-003-add-macaron-theme-presets.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `package.json`
- 相關 frontend source / tests，由 Worker 用 `rg` 定位：
  - theme state / settings persistence
  - Settings theme selector
  - CSS variables / theme tokens
  - app shell / cards / dialogs / badges / buttons styling
  - existing theme tests

### 輸入上下文

使用者要求：

- app theme 要加入三個預設主題。
- 三個主題為粉紅、粉綠、粉藍。
- 視覺方向為馬卡龍色系。
- 使用者已要求：PLAN-002 完成後自動 YOLO 進行 PLAN-003。

PLAN-003 初始假設：

- 新增三個可選 theme preset，不取代現有 theme，也不改目前預設 theme。
- 三個 theme id 建議為 `macaron-pink`、`macaron-green`、`macaron-blue`。
- 新 theme label 需接 PLAN-002 的 i18n resources。
- 保留作業工具感，不做大面積低對比裝飾。

### 研究要求

1. 盤點現有 theme architecture：
   - theme state / store / persistence。
   - Settings theme selector。
   - theme ids / option labels。
   - CSS variables、Tailwind / CSS token 使用方式。
2. 盤點 affected UI surfaces：
   - App shell / navigation。
   - Settings。
   - Provider cards / metric lines。
   - dialogs / popovers / badges / buttons。
   - empty / loading / error states。
3. 提出最小 token set：
   - background / foreground。
   - surface / surface-muted。
   - accent / accent-foreground。
   - border / focus ring / selected state。
   - status colors 是否沿用現有語意色。
4. 提出三個 theme palette：
   - 粉紅：低飽和 rose / blush。
   - 粉綠：低飽和 mint / sage。
   - 粉藍：低飽和 sky / powder blue。
   - 必須明確避免文字低對比。
5. 測試與驗證建議：
   - theme options / persistence tests。
   - i18n label tests。
   - `bun run build`。
   - visual smoke screenshots。
6. 收尾：
   - 更新 T0018 回報區。
   - 更新 PLAN-003 研究結論與建議拆單。
   - 若可直接進入實作，建議 T0019 範圍。

### 不做

- 不修改 source code。
- 不新增 theme editor。
- 不支援任意使用者自訂色票。
- 不改 provider logo / icon。
- 不重做 layout。
- 不新增大型 design system。
- 不處理 PLAN-002 的 Tauri runtime persistence 缺口。

## 預期產出

- Theme source inventory。
- 三個 macaron theme 的 token / palette 建議。
- T0019 implementation scope。
- PLAN-003 / T0018 closeout update。

## 驗收條件

- [ ] 現有 theme architecture 已盤點。
- [ ] theme persistence seam 已盤點。
- [ ] Settings selector seam 已盤點。
- [ ] CSS token / variable seam 已盤點。
- [ ] 三個 macaron palette 已提出。
- [ ] T0019 實作邊界已明確。
- [ ] 未修改 source code。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件文件。
4. 盤點 theme source / persistence / CSS token / Settings selector。
5. 提出三個 macaron theme token 建議與 T0019 scope。
6. 更新 PLAN-003 與 T0018 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- 已完成唯讀 theme architecture inventory，未修改 `src`。
- Theme model / persistence：
  - `src/lib/settings.ts` 定義 `ThemeMode = "system" | "light" | "dark"`，`THEME_MODES` 驗證允許值。
  - 同檔使用 Tauri `LazyStore("settings.json")` 的 `themeMode` key；`loadThemeMode()` invalid value fallback 到 `DEFAULT_THEME_MODE = "system"`；`saveThemeMode()` 寫回同 key。
  - `src/stores/app-preferences-store.ts` 保存 runtime `themeMode`；`src/hooks/app/use-settings-bootstrap.ts` 啟動時載入；`src/hooks/app/use-settings-display-actions.ts` Settings 變更時儲存。
- Theme apply seam：
  - `src/hooks/app/use-settings-theme.ts` 目前只管理 root `.dark` class；`system` 透過 `window.matchMedia("(prefers-color-scheme: dark)")` 同步。
  - T0019 可沿用這個 hook，加上清除/套用 `theme-macaron-*` root class。
- Settings selector seam：
  - `src/pages/settings.tsx` 的 `THEME_LABEL_KEYS` 對應 `ThemeMode`，Settings App Theme radio group 來自 `THEME_OPTIONS`。
  - 新增三個選項時，radio group 建議改成可 wrap 或 2-column layout，避免六個選項擠壓。
- CSS token seam：
  - `src/index.css` 的 `@theme inline` 將 Tailwind token 對應到 CSS variables。
  - `:root` 是 light token；`:root.dark` 是 dark token。
  - 建議新增 `:root.theme-macaron-pink` / `green` / `blue` token blocks，不新增大型 design system。
- i18n seam：
  - `src/lib/i18n.ts` 已有 `settings.appTheme.*` keys；`src/lib/i18n.test.ts` 會檢查 `en` / `zh-TW` key 完整性。
- Affected UI surfaces：
  - App shell：`bg-card`、`border`、drag handle、scroll fade。
  - Side nav：`bg-muted/50`、active strip `bg-primary`、dark-only `--page-accent`。
  - Settings：radio group `bg-muted/50`、active `Button`、helper text。
  - Provider cards / metric lines：`Badge`、`Progress`、muted labels、plugin inline colors。
  - Dialogs / popovers / tooltip / alert：`bg-card`、`bg-popover`、`border`、`destructive`。
  - Empty / loading / error states：`text-muted-foreground`、`Skeleton bg-muted`、`PluginError` destructive style。
- 已更新 `_ct-workorders/PLAN-003-add-macaron-theme-presets.md`，加入 T0018 研究結論、palette、T0019 scope。
- Commit：收尾 commit 後回填。

### 驗證
- Contrast spot-check（inline Node）：foreground/background 最低 13.97；primary foreground/primary 最低 4.65；muted foreground/muted 最低 5.20；accent foreground/accent 最低 9.58。
- Source tests/build 未執行；本工單是 research-only，未修改 `src`。

### 互動紀錄
無

### 調查結論
- 現有 theme 架構很小：一個 `themeMode` setting + Zustand runtime state + `useSettingsTheme()` root class apply + `index.css` token blocks。
- 最小可行實作是延伸既有 `ThemeMode`，不要新增獨立 theme store 或 user-defined color editor。
- 三個新 preset 應先作為 light-only themes：選中 `macaron-*` 時移除 `.dark`，不訂閱 system dark media query，改套用 `theme-macaron-*` class。
- 既有 default 應保持 `system`，避免改變既有使用者行為。
- Status colors 建議保留目前 semantic `green-500` / `yellow-500` / `red-500`，避免粉綠 theme 和 success 狀態混淆。

### 建議方向
- [A] 延伸既有 `ThemeMode`：新增 `macaron-pink` / `macaron-green` / `macaron-blue`，以 root class 套 CSS variables。優點：小改動、persistence 直接沿用、測試清楚；缺點：macaron 先只有 light 版本。
- [B] 拆成 `appearanceMode` + `colorPreset`：可支援 dark macaron 與未來更多 preset；缺點：需要 storage migration 與 Settings UI 重整，超出本 PLAN 第一階段。
- [C] 只在 Settings hard-code 顏色或加局部 class：最快；缺點：不完整、不易測試、會讓 token 分散。
- **推薦**：方案 A。符合內部 2-5 人工具的簡單需求，也符合「不新增大型 design system」限制。

### 建議 T0019 implementation scope
- `src/lib/settings.ts`：擴充 `ThemeMode`、`THEME_MODES`、`THEME_OPTIONS`；補 invalid value fallback / persistence tests。
- `src/hooks/app/use-settings-theme.ts`：集中移除 `.dark` 與 `theme-macaron-*`，再依選項套用 class；`system` 保持目前 media query 行為。
- `src/index.css`：新增三個 `:root.theme-macaron-*` token blocks。
- `src/lib/i18n.ts`：新增三個 theme label keys 的 `en` / `zh-TW`。
- `src/pages/settings.tsx`：更新 `THEME_LABEL_KEYS` 與 App Theme selector layout。
- Tests：`settings.test.tsx` option/click、`settings.test.ts` persistence、`App.test.tsx` 或 hook test root class behavior、`i18n.test.ts` resource coverage。
- Visual：T0020 再提供 before/after screenshots；PR 前不得略過 screenshots。

### Palette 建議
| Theme | background | foreground | primary | primary fg | muted | muted fg | accent | accent fg | border/input | ring |
|-------|------------|------------|---------|------------|-------|----------|--------|-----------|--------------|------|
| `macaron-pink` | `#fff8fb` | `#2b2026` | `#9d4668` | `#ffffff` | `#f6eef2` | `#6f5862` | `#f4d9e4` | `#442633` | `#ead3dd` | `#b95d7d` |
| `macaron-green` | `#f8fffb` | `#1f2d29` | `#3f806c` | `#ffffff` | `#edf7f2` | `#536c62` | `#d9f0e5` | `#223f36` | `#cfe4da` | `#5c9a84` |
| `macaron-blue` | `#f7fbff` | `#202a36` | `#3d76a0` | `#ffffff` | `#edf5fb` | `#526879` | `#d8ebfa` | `#22384b` | `#cfe0ed` | `#5a8fba` |

### Renew 歷程
無

### 遭遇問題
- 無。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24 11:51:36 (UTC+8)
