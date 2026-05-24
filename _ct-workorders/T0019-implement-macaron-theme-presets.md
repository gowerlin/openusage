---
schema_version: 1
schema_kind: workorder
id: T0019
title: Implement macaron theme presets
status: IN_PROGRESS
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 14:55:34 +08:00"
started_at: "2026-05-24T14:58:06+08:00"
completed_at: null
updated_at: "2026-05-24T14:58:06+08:00"
commit: null
bug_id: null
plan_id: PLAN-003
sizing: medium
affects_files:
  - src/lib/settings.ts
  - src/hooks/app/use-settings-theme.ts
  - src/index.css
  - src/lib/i18n.ts
  - src/pages/settings.tsx
  - "related focused tests"
depends_on:
  - PLAN-003
  - T0018
---

# T0019 Implement Macaron Theme Presets

## 元資料
- **工單編號**：T0019
- **任務名稱**：Implement macaron theme presets
- **狀態**：IN_PROGRESS
- **建立時間**：2026-05-24 14:55:34 (UTC+8)
- **開始時間**：2026-05-24T14:58:06+08:00
- **完成時間**：-
- **目標子專案**：frontend / theme system
- **關聯 PLAN**：PLAN-003
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src/lib/settings.ts`
  - `src/hooks/app/use-settings-theme.ts`
  - `src/index.css`
  - `src/lib/i18n.ts`
  - `src/pages/settings.tsx`
  - `related focused tests`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 Settings selector layout 或 root class tests 牽涉過多，優先完成 `ThemeMode` / persistence / CSS token blocks / i18n labels；visual smoke 與 screenshots 留給 T0020，但需明確列出。

## Session 建議
- **建議類型**：新 Session
- **原因**：需要修改 frontend theme source、CSS tokens、i18n resources 與 tests。

## 規格層級自問

- [x] **目標層**：實作。依 T0018 研究結論新增三個 macaron theme presets。
- [x] **決策權歸屬**：Worker 可依實際 source 調整 test seam，但不得改變主題策略或新增 theme editor。
- [x] **資訊完整度**：T0018 已盤點 theme model、persistence、Settings selector、CSS token seam 與 palette。
- [x] **回頭成本**：中。theme token 會影響多個 UI surface，需保持 scoped。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-003-add-macaron-theme-presets.md`
- `_ct-workorders/T0018-research-theme-architecture-token-inventory.md`
- `package.json`
- T0018 指定 source / tests：
  - `src/lib/settings.ts`
  - `src/hooks/app/use-settings-theme.ts`
  - `src/index.css`
  - `src/lib/i18n.ts`
  - `src/pages/settings.tsx`
  - related tests，由 Worker 用 `rg` 定位。

### 輸入上下文

T0018 推薦方案：

- 採方案 A：延伸既有 `ThemeMode`。
- 新增 `macaron-pink`、`macaron-green`、`macaron-blue` 到同一個 `themeMode` 欄位。
- 三個 macaron preset 先作為 light-only themes。
- 選中 macaron theme 時移除 `.dark` 與其他 `theme-macaron-*` class，套用對應 root class。
- `system` 保持目前 `prefers-color-scheme` 行為。
- 現有 default 保持 `system`，不改既有使用者行為。

### 實作要求

1. Settings / persistence：
   - 在 `src/lib/settings.ts` 擴充 `ThemeMode`、`THEME_MODES`、`THEME_OPTIONS`。
   - 保留 `DEFAULT_THEME_MODE = "system"`。
   - invalid stored value 應 fallback 到 `system`。
   - 更新 persistence / validation tests。
2. Theme root class：
   - 在 `src/hooks/app/use-settings-theme.ts` 集中移除 `.dark` 與 `theme-macaron-*`。
   - `light`：不套 `.dark` / macaron class。
   - `dark`：套 `.dark`。
   - `system`：沿用 media query 同步 `.dark`。
   - `macaron-pink` / `macaron-green` / `macaron-blue`：移除 `.dark`，套對應 `theme-macaron-*` class，不訂閱 system dark media query。
   - 補 root class behavior test。
3. CSS tokens：
   - 在 `src/index.css` 新增三個 `:root.theme-macaron-*` token blocks。
   - 使用 T0018 palette，必要時微調但需保持對比。
   - 保留 status semantic colors，不要把 success/warning/destructive 改成主題 hue。
4. i18n labels：
   - 在 `src/lib/i18n.ts` 新增三個 theme label keys：
     - `settings.appTheme.option.macaronPink`
     - `settings.appTheme.option.macaronGreen`
     - `settings.appTheme.option.macaronBlue`
   - 同步 `en` / `zh-TW`。
   - 讓 existing i18n completeness test 覆蓋。
5. Settings UI：
   - 更新 `THEME_LABEL_KEYS`。
   - App Theme radio group 要能容納六個選項；可改成 responsive wrap / 2-column layout。
   - 確保文字不擠壓、不重疊。
6. Tests / build：
   - Focused tests 至少涵蓋：
     - settings load/save / invalid fallback。
     - Settings selector 顯示與切換三個 macaron options。
     - theme root class behavior。
     - i18n key completeness。
   - 執行 `bun run build`。
   - 可執行 focused tests；若時間允許執行全量 `bun run test --run`。
7. 收尾：
   - 更新 PLAN-003 與 T0019 回報區。
   - 若完成，記錄 commit 與驗證命令。
   - 若未完成，回報 PARTIAL 並列出剩餘。

### Palette 建議

| Theme | background | foreground | primary | primary fg | muted | muted fg | accent | accent fg | border/input | ring |
|-------|------------|------------|---------|------------|-------|----------|--------|-----------|--------------|------|
| `macaron-pink` | `#fff8fb` | `#2b2026` | `#9d4668` | `#ffffff` | `#f6eef2` | `#6f5862` | `#f4d9e4` | `#442633` | `#ead3dd` | `#b95d7d` |
| `macaron-green` | `#f8fffb` | `#1f2d29` | `#3f806c` | `#ffffff` | `#edf7f2` | `#536c62` | `#d9f0e5` | `#223f36` | `#cfe4da` | `#5c9a84` |
| `macaron-blue` | `#f7fbff` | `#202a36` | `#3d76a0` | `#ffffff` | `#edf5fb` | `#526879` | `#d8ebfa` | `#22384b` | `#cfe0ed` | `#5a8fba` |

## 不做

- 不新增 theme editor。
- 不支援任意使用者自訂色票。
- 不拆 `appearanceMode` + `colorPreset` 雙欄位。
- 不改 provider logo / icon。
- 不重做 layout。
- 不新增大型 design system。
- 不處理 release workflow / updater。
- 不處理 PLAN-002。
- 不把 T0020 視覺 closeout 合併進本工單；本工單可提供基本 sanity，但 screenshots closeout 留給 T0020。

## 預期產出

- 三個 macaron theme presets。
- Settings 可選三個新 theme。
- Theme selection persistence / invalid fallback tests。
- Root class behavior tests。
- i18n label coverage。
- PLAN-003 / T0019 closeout update。

## 驗收條件

- [x] Settings 可選 `macaron-pink` / `macaron-green` / `macaron-blue`。
- [x] 三個新 theme 可保存並 reload 後保持。
- [x] 新 theme labels 已加入 `en` / `zh-TW`。
- [x] root class apply / cleanup 行為正確。
- [x] `system` / `light` / `dark` 既有行為未破壞。
- [x] CSS token 使用集中在 `src/index.css`，沒有散落 hard-coded theme colors。
- [x] Focused tests 通過。
- [x] `bun run build` 通過。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件文件。
4. 實作 ThemeMode / persistence / Settings selector / CSS token / i18n labels。
5. 補 focused tests。
6. 執行 focused tests 與 `bun run build`。
7. 更新 PLAN-003 與 T0019 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- 已新增 `macaron-pink` / `macaron-green` / `macaron-blue` 到 `ThemeMode`、`THEME_MODES`、`THEME_OPTIONS`，保留 `DEFAULT_THEME_MODE = "system"` 與 invalid fallback。
- `useSettingsTheme()` 現在會集中清理 `.dark` / `theme-macaron-*`，並為三個 macaron light-only presets 套用對應 root class。
- `src/index.css` 已新增三個 `:root.theme-macaron-*` token blocks；status semantic colors 未改動。
- Settings App Theme selector 已可容納六個選項，並加入 `en` / `zh-TW` theme labels。
- 已補 `settings` persistence/options、Settings selector、i18n labels、root class behavior focused tests。

### 驗證
- RED：`bun run test --run src/lib/settings.test.ts src/pages/settings.test.tsx src/lib/i18n.test.ts src/hooks/app/use-settings-theme.test.ts` 初次失敗 9 tests，確認缺少 macaron behavior。
- PASS：`bun run test --run src/lib/settings.test.ts src/pages/settings.test.tsx src/lib/i18n.test.ts src/hooks/app/use-settings-theme.test.ts`（4 files / 85 tests）。
- PASS：`bun run build`（`tsc && vite build`；僅 Vite chunk size > 500 kB warning）。
- PASS：`bun run test --run`（64 files / 1136 tests；`use-app-update` stderr 為測試錯誤分支預期輸出）。

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
- 無阻斷問題。
- 視覺 screenshots / desktop compact smoke 依工單邊界留給 T0020。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T15:04:44+08:00
