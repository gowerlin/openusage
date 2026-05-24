---
schema_version: 1
schema_kind: plan
id: PLAN-003
title: Add macaron pastel theme presets
status: DONE
priority: Medium
plan_type: feature
created_at: "2026-05-24 11:26:33 +08:00"
updated_at: "2026-05-24T15:52:18+08:00"
completed_at: "2026-05-24T15:46:01+08:00"
affects_files: []
depends_on:
  - PLAN-002
---

# PLAN-003 Add Macaron Pastel Theme Presets

## Metadata

| Field | Value |
|-------|-------|
| **編號** | PLAN-003 |
| **標題** | Add macaron pastel theme presets |
| **狀態** | DONE |
| **優先級** | 🟡 Medium |
| **類型** | 功能實作 / UI theme |
| **建立時間** | 2026-05-24 11:26:33 (UTC+8) |
| **完成時間** | 2026-05-24T15:46:01+08:00 |

## 決策摘要

使用者要求：

- app theme 要加入三個預設主題。
- 三個主題為粉紅、粉綠、粉藍。
- 視覺方向為馬卡龍色系。

塔台初始假設：

- 新增三個可選 theme preset，不取代現有 theme，也不改目前預設 theme。
- 主題要保留 app 作業工具感，不做過度裝飾或大面積低對比配色。
- 新 theme 的顯示名稱與 Settings 選項需接上 PLAN-002 的 i18n resources。
- 實作前先盤點現有 theme token / persistence 架構，避免直接硬改 CSS。
- PLAN-002 完成後自動 YOLO 進行 PLAN-003；第一張工單為已預建的 T0018，不再等待使用者二次確認。

## 動機 / 背景

OpenUsage 目前需要更柔和的內建主題選項。三個馬卡龍色系應讓使用者能在偏粉紅、粉綠、粉藍的低飽和外觀間切換，同時保持資訊密度、文字可讀性與既有 app 操作流程。

## 預期目標

- 新增三個 theme preset：
  - `macaron-pink`
  - `macaron-green`
  - `macaron-blue`
- Theme selector 可選擇三個新主題。
- Theme selection reload / app restart 後保持。
- 主題使用 token / CSS variable 或既有 theme pattern，不散落 hard-coded colors。
- 主要 UI surface 在三個主題下文字可讀、狀態色清楚、互動狀態可辨識。
- 新增 theme label 時同步 `en` / `zh-TW` i18n resources。

## 初始範圍

- App theme model / store / persistence。
- Settings theme selector。
- CSS variables / theme tokens。
- App shell、side nav、cards、buttons、badges、dialogs、tables / list-like surfaces 的主要配色。
- Light visual smoke screenshots。
- Focused tests：theme options、persistence、i18n labels。

## 不在本 PLAN 第一階段

- 不建立完整 theme editor。
- 不支援使用者自訂任意色票。
- 不改品牌 logo / provider icons。
- 不重做 layout。
- 不新增大型 design system。
- 不要求暗色模式重構；若現有 dark theme 存在，僅避免破壞。

## 初步設計方向

- **粉紅主題**：低飽和 rose / blush accent，neutral surface 保持乾淨，不讓整頁變成粉色背景。
- **粉綠主題**：低飽和 mint / sage accent，成功狀態色需與主題 accent 保持可分辨。
- **粉藍主題**：低飽和 sky / powder blue accent，資訊狀態色需與主題 accent 保持可分辨。
- 三者皆應使用 neutral foreground / surface 作為主體，只讓 accent、focus ring、selected state、soft panel background 體現主題。

## T0018 Research 結論

### Theme source inventory

- `src/lib/settings.ts`：`ThemeMode` 目前只有 `system | light | dark`；`themeMode` 存在 Tauri `settings.json`。
- `src/stores/app-preferences-store.ts`：Zustand 保存 runtime `themeMode`。
- `src/hooks/app/use-settings-bootstrap.ts`：啟動時讀 `loadThemeMode()` 並寫入 store。
- `src/hooks/app/use-settings-display-actions.ts`：Settings 變更後呼叫 `saveThemeMode()`。
- `src/hooks/app/use-settings-theme.ts`：目前只切 root `.dark`，`system` 會追 `prefers-color-scheme`。
- `src/pages/settings.tsx`：`THEME_LABEL_KEYS` 與 `THEME_OPTIONS` 產生 App Theme radio group。
- `src/lib/i18n.ts`：theme labels 已在 `en` / `zh-TW` resources；`src/lib/i18n.test.ts` 會檢查 resource key 完整性。
- `src/index.css`：Tailwind v4 `@theme inline` 對應 CSS variables；`:root` 是 light token，`:root.dark` 是 dark token。

### Affected UI surfaces

- App shell：`bg-card`、`border`、drag handle、scroll fade。
- Side nav：`bg-muted/50`、active strip `bg-primary`、dark-only `--page-accent`。
- Settings：radio group container `bg-muted/50`、active `Button`、muted helper text。
- Provider cards / metric lines：`Badge`、`Progress`、muted labels、plugin-provided inline colors。
- Dialogs / popovers / tooltip / alert：`bg-card`、`bg-popover`、`border`、`destructive`。
- Empty / loading / error states：`text-muted-foreground`、`Skeleton bg-muted`、`PluginError` destructive style。

### 推薦方案

- 採 **方案 A：延伸既有 `ThemeMode`**。
- 新增 `macaron-pink`、`macaron-green`、`macaron-blue` 到同一個 `themeMode` 欄位。
- 三個 macaron preset 先視為 light-only themes；選中時移除 `.dark` 與其他 `theme-*` class，套用 `theme-macaron-*` class。
- 不新增獨立 theme store、不新增 custom color editor、不拆 appearance/color preset 雙欄位。

### 最小 token set

- Core：`background`、`foreground`、`card`、`card-foreground`、`popover`、`popover-foreground`。
- Controls：`primary`、`primary-foreground`、`secondary`、`secondary-foreground`、`muted`、`muted-foreground`、`accent`、`accent-foreground`。
- State：`border`、`input`、`ring`、`page-accent`。
- Sidebar：`sidebar`、`sidebar-foreground`、`sidebar-primary`、`sidebar-primary-foreground`、`sidebar-accent`、`sidebar-accent-foreground`、`sidebar-border`、`sidebar-ring`。
- Status colors：保留現有 `green-500` / `yellow-500` / `red-500` 語意色，不跟著馬卡龍 hue 重染。

### Palette 建議

| Theme | background | foreground | primary | primary fg | muted | muted fg | accent | accent fg | border/input | ring |
|-------|------------|------------|---------|------------|-------|----------|--------|-----------|--------------|------|
| `macaron-pink` | `#fff8fb` | `#2b2026` | `#9d4668` | `#ffffff` | `#f6eef2` | `#6f5862` | `#f4d9e4` | `#442633` | `#ead3dd` | `#b95d7d` |
| `macaron-green` | `#f8fffb` | `#1f2d29` | `#3f806c` | `#ffffff` | `#edf7f2` | `#536c62` | `#d9f0e5` | `#223f36` | `#cfe4da` | `#5c9a84` |
| `macaron-blue` | `#f7fbff` | `#202a36` | `#3d76a0` | `#ffffff` | `#edf5fb` | `#526879` | `#d8ebfa` | `#22384b` | `#cfe0ed` | `#5a8fba` |

Contrast spot-check：foreground/background 最低 13.97；primary foreground/primary 最低 4.65；muted foreground/muted 最低 5.20；accent foreground/accent 最低 9.58。

### T0019 建議範圍

- 更新 `src/lib/settings.ts`：`ThemeMode`、`THEME_MODES`、`THEME_OPTIONS`、validation tests。
- 更新 `src/hooks/app/use-settings-theme.ts`：集中清除 `.dark` / `theme-macaron-*`，套用新 root class。
- 更新 `src/index.css`：新增三個 `:root.theme-macaron-*` token blocks。
- 更新 `src/lib/i18n.ts`：新增 `settings.appTheme.option.macaronPink` / `macaronGreen` / `macaronBlue` 的 `en` 與 `zh-TW`。
- 更新 `src/pages/settings.tsx`：`THEME_LABEL_KEYS` 加三個 key；radio group 改為可容納六個選項的 responsive layout。
- Focused tests：`settings.test.tsx` theme options/click、`settings.test.ts` persistence validation、`use-settings-theme` 或 `App.test.tsx` root class behavior、`i18n.test.ts` label coverage。
- T0020 再處理 visual smoke screenshots；PR 前必須提供 before/after screenshots。

## 建議拆單

- [x] T0018 Research current theme architecture and token inventory。
  - 盤點現有 theme store、Settings UI、CSS variables、persistence、tests。
  - 定義三個 theme id 與最小 token set。
  - 產出實作方案與風險。
- [x] T0019 Implement macaron theme presets。
  - 新增三個 theme presets。
  - 更新 Settings selector 與 i18n labels。
  - 補 theme persistence / option tests。
- [x] T0020 Theme visual verification closeout。（PARTIAL；browser visual smoke / screenshots pass；compact selector overlap fixed；Tauri runtime persistence covered by T0021）
  - 對三個主題做 desktop / compact viewport smoke。
  - 檢查文字可讀性、互動狀態、主要 surface。
  - 提供 screenshots，收斂 PLAN-003。
- [x] T0021 Theme Tauri runtime persistence smoke。
  - 用 Tauri runtime 驗證三個 macaron themes reload / app restart 後保持。
  - 若通過，收斂 PLAN-003。

## 驗收條件

- [x] Settings 可選 `macaron-pink` / `macaron-green` / `macaron-blue`。
- [x] 三個新主題 reload / app restart 後保持。（T0021 Tauri runtime persistence PASS）
- [x] 新 theme labels 已加入 `en` / `zh-TW`。
- [x] 三個主題不破壞既有 theme。
- [x] 主要 UI surface 無明顯文字重疊或低對比不可讀。
- [x] Focus / hover / selected / disabled 狀態仍清楚。
- [x] Unit / component tests 通過。
- [x] `bun run build` 通過。
- [x] 若有視覺變更，提供 screenshots。

## 下一步

- [x] 已預建 T0018 theme architecture / token inventory。
- [x] PLAN-002 DONE 後已自動 YOLO 派發 T0018：terminal `7b14c686b9ebf9dfcc454c0e086d9e1e`。
- [x] T0018 已回報 theme architecture / token inventory。
- [x] 已建立並派發 T0019 Implement macaron theme presets：terminal `c3a3ba572226ccaaff3ccd5aab7d6bb5`。
- [x] T0019 已回報 macaron theme presets 實作結果；visual screenshots 留給 T0020。
- [x] 已建立並派發 T0020 Theme visual verification closeout：terminal `384e603eb27165270d62dc82d269c9ae`。
- [x] T0020 已完成 browser visual smoke 並修復 compact selector overlap；Tauri runtime reload persistence 由 T0021 驗證通過。
- [x] 已建立並派發 T0021 Theme Tauri runtime persistence smoke：terminal `79264ba994057240b1e0bf4a5b3f22c7`。
- [x] T0021 已回報 Tauri runtime theme persistence PASS；PLAN-003 收斂為 DONE。

## 關聯工單

- T0018：Research current theme architecture and token inventory（DONE；terminal `7b14c686b9ebf9dfcc454c0e086d9e1e`；commit `1520616c1e44714591a83abe7acc9989cbc1ff24`）
- T0019：Implement macaron theme presets（DONE；terminal `c3a3ba572226ccaaff3ccd5aab7d6bb5`；commit `a9dc8fb82eafb2b40a4887c105d0dba82406425c`）
- T0020：Theme visual verification closeout（PARTIAL；terminal `384e603eb27165270d62dc82d269c9ae`；commit `8fb84e04c31bfc12ab245a00372868a4f9c13628`；runtime persistence covered by T0021）
- T0021：Theme Tauri runtime persistence smoke（DONE；terminal `79264ba994057240b1e0bf4a5b3f22c7`；Tauri runtime guard and macaron theme reload persistence PASS）
