---
schema_version: 1
schema_kind: plan
id: PLAN-002
title: Add i18n support with Traditional Chinese locale
status: DONE
priority: Medium
plan_type: feature
created_at: "2026-05-24 09:31:41 +08:00"
updated_at: "2026-05-24T11:38:43+08:00"
affects_files: []
depends_on: []
---

# PLAN-002 Add i18n Support With Traditional Chinese Locale

## Metadata

| Field | Value |
|-------|-------|
| **編號** | PLAN-002 |
| **標題** | Add i18n support with Traditional Chinese locale |
| **狀態** | DONE |
| **優先級** | 🟡 Medium |
| **類型** | 功能實作 / 架構調整 |
| **建立時間** | 2026-05-24 09:31:41 (UTC+8) |
| **完成時間** | 2026-05-24T11:38:43+08:00 |

## 決策摘要

使用者已確認：

- **範圍**：App UI 全面納入 i18n，包含設定、面板、狀態文字、plugin 顯示文字。
- **預設語言策略**：預設 `en`，但內建 `zh-TW`，可切換到繁體中文。
- **實作策略**：先研究現有前端架構，再選最小 i18n 套件或既有 pattern。
- **第一階段驗收**：完整搬完所有可見 UI 字串。
- **派發方式**：使用者已要求開始實作；先派 T0012 research / 盤點工單。

## 動機 / 背景

OpenUsage 目前需要支援 i18n，並預設內建繁體中文語系，讓使用者可以在英文與繁體中文之間切換。此功能會影響多個 UI surface，因此先建立 PLAN 作為後續研究與實作工單的依據。

## 預期目標

- 建立前端 i18n 架構。
- 內建 `en` 與 `zh-TW` locale resources。
- 預設語言維持 `en`。
- 提供語言切換能力，使用者可切換到 `zh-TW`。
- 完整搬移可見 UI 字串，不留下主要 hard-coded display text。
- 語言設定需能持久化，reload / app restart 後維持使用者選擇。
- 缺漏翻譯要 fail loud 或在測試中暴露，不新增 silent fallback 汙染。

## 初始範圍

- App shell / navigation。
- Settings / preferences。
- Control Tower / workorder / bug panel。
- Plugin list、plugin detail、plugin 狀態文字。
- Common empty / loading / error states。
- Button、tab、filter、badge、toast 等主要可見字串。

## 不在本 PLAN 第一階段

- 不翻譯第三方 provider 回傳內容。
- 不翻譯 log / trace / raw error detail。
- 不新增企業級翻譯管理平台。
- 不處理多語 SEO。
- 不要求所有 plugin metadata 來源立即改成遠端可翻譯格式；先以本地 resources / host UI 字串為主。

## 建議拆單

- [x] T0012 Research i18n architecture and string inventory。
  - 盤點前端框架、routing/state/storage pattern。
  - 盤點所有可見 UI 字串與測試架構。
  - 比較本地 dictionary helper、現有 pattern、輕量 i18n 套件。
  - 產出推薦方案與實作拆單。
- [x] T0014 Implement i18n foundation。
  - 建立 locale resources、provider/hook/helper、語言設定持久化。
  - 加入語言切換入口。
  - 補缺字串檢查與基礎測試。
- [x] T0015 Migrate visible UI strings。
  - 搬移 App shell、settings、Control Tower panel、plugin UI、common states。
  - 補主要 regression tests。
- [x] T0016 i18n verification closeout。
  - 執行 typecheck/test/build。
  - 用 UI smoke 驗證 `en` / `zh-TW` 切換與 reload persistence。
  - 收斂 PLAN-002 狀態。
  - PARTIAL：source/test/build、i18n resource、provider semantics、browser immediate language switch 均 PASS；Tauri runtime reload persistence 尚未驗收。
- [x] T0017 i18n Tauri runtime persistence smoke。
  - 在 Tauri runtime 驗證 `zh-TW` 切換後 reload / app restart 仍保持。

## 驗收條件

- [x] App 可切換 `en` / `zh-TW`。
- [x] 預設語言為 `en`。
- [x] `zh-TW` 內建於 app，無需額外下載。
- [x] 語言設定 reload / app restart 後保持。
- [x] 所有主要可見 UI 字串完成搬移。
- [x] 缺漏翻譯有測試或明確錯誤，不 silent fallback。
- [x] typecheck / unit tests / build 通過。
- [x] 若有視覺變更，提供 before / after screenshots。（T0017 已提供 Tauri runtime current screenshots）

## T0012 研究結論

- **架構推薦**：先做本地 typed dictionary，不新增 i18n dependency。現有 UI 是 Vite + React 19 + Zustand，沒有 router；視圖由 `useAppUiStore.activeView` 在 `AppContent` 內切換。
- **i18n 落點**：新增 `src/lib/i18n.ts` 或 `src/i18n/resources.ts` 管理 `en` / `zh-TW` resources、`Locale`、`I18nKey`、`t()`，再加 `useI18n()` hook 給 React components。
- **語言設定持久化落點**：沿用 `src/lib/settings.ts` 的 Tauri `LazyStore("settings.json")`，新增 `language` key、`loadLanguage()`、`saveLanguage()`；狀態放在 `src/stores/app-preferences-store.ts`，bootstrap/action pattern 跟 theme/display/time format 一致。
- **主要字串範圍**：App shell / nav、Settings、Global Shortcut、footer/update states、About / Changelog dialogs、Overview / Provider detail empty states、ProviderCard progress/reset/pace/cooldown text、plugin context menu、bundled plugin manifest line labels。
- **排除範圍**：provider brand names、provider raw runtime values、raw errors/logs/traces、GitHub release markdown body不翻譯。Control Tower / workorder / bug panel 目前不在 `src/` UI 內，無前端搬移點。
- **測試策略**：新增 locale completeness test；`t()` 對缺 key fail loud；既有 RTL tests 改查 i18n output；最後跑 `bun run test` 與 `bun run build`。視覺 PR 需 before/after screenshots。

## T0014 實作結果

- **Commit**：`d95afa6968f5bf3e4bacc788e7cecf636be53b00` (`feat(i18n): implement T0014 foundation`)
- **已完成**：typed local dictionary、`Locale` / `I18nKey`、`resources`、`SUPPORTED_LOCALES`、`DEFAULT_LOCALE`、fail-loud `t()`、`useI18n()` hook。
- **已完成**：language preference load/save/store/bootstrap/action wiring，持久化沿用 `LazyStore("settings.json")` 的 `language` key，預設 `en`。
- **已完成**：Settings Language selector，可切換 `English` / `Traditional Chinese`；完整可見 UI 字串搬移仍留給 T0015。
- **驗證**：focused regression tests PASS、`bun run test --run` PASS（63 files / 1127 tests）、`bun run build` PASS。

## T0015 實作結果

- **Commit**：`dce07dd1cc7a51c804baee940440c38c9c229a45` (`feat(i18n): migrate visible UI strings`)
- **已完成**：App shell、navigation、Settings、Global Shortcut、Panel Footer、About / Changelog dialogs、Overview / Provider Detail、ProviderCard / tooltip、plugin context menu 等主要可見 UI 字串改用 typed i18n resources。
- **已完成**：新增 `translateDisplayLabel(locale, label)`，只翻譯 app-owned bundled plugin display label；未知 runtime label 保留原值，不改 raw matching logic。
- **已完成**：ProviderCard metric renderer 拆到 `src/components/provider-card-metric-line.tsx`，避免 `provider-card.tsx` 超過 400 LOC。
- **驗證**：focused tests PASS（14 files / 168 tests）、`src/App.test.tsx` PASS（78 tests）、`bun run test --run` PASS（63 files / 1128 tests）、`bun run build` PASS（Vite chunk-size warning only）、`git diff --check` PASS（LF/CRLF warnings only）。

## T0016 驗證結果

- **狀態**：PARTIAL。
- **已通過**：`bun run test --run`、`bun run build`、focused i18n persistence/resource tests（6 files / 86 tests）、provider semantics tests（5 files / 136 tests）、Settings browser immediate switch `en` → `zh-TW`。
- **缺口**：純 browser 沒有 Tauri internals，`saveLanguage()` 會 fail loud，無法宣稱 reload 後 language persistence 已在 Tauri runtime 驗收。

## T0017 驗證結果

- **狀態**：DONE。
- **已通過**：Tauri runtime 啟動、initial English locale、Settings `Traditional Chinese` 切換、WebView reload 後 `zh-TW` persistence。
- **runtime guard**：WebView evaluation returned `hasTauriInternals: true` and `isTauriGlobal: true`，非純 browser smoke。
- **store proof**：isolated app data `C:\Users\Gower\AppData\Roaming\com.sunstory.openusage.t0017\settings.json` contains `"language": "zh-TW"`。
- **artifacts**：`%TEMP%\openusage-t0017-20260524-113527\runtime-smoke-result.json` and screenshots `settings-before-zh.png` / `settings-after-zh.png` / `settings-after-reload-zh.png`。

## 下一步

- [x] 使用者要求開始實作 PLAN-002。
- [x] 已建立並派發 T0012 research / 盤點工單：terminal `bc1e45aa6dcaa64069c45be205033653`。
- [x] T0012 已回報 i18n 架構推薦與字串 inventory。
- [x] 已建立並派發 T0014 i18n foundation 工單：terminal `95918651a3518df58c8ab43daa2540fd`。
- [x] T0014 已回報 i18n foundation 實作結果。
- [x] 已建立並派發 T0015 Migrate visible UI strings 工單：terminal `d2a41b824dee714f8b67c5c95b2f4ce6`。
- [x] T0015 已回報可見 UI 字串搬移結果。
- [x] 已建立並派發 T0016 i18n verification closeout 工單：terminal `81eadd3470453f59758c7c0c5b52f800`。
- [x] T0016 已回報 PARTIAL；source/test/build 與 browser immediate switch 均 PASS，缺 Tauri runtime reload persistence。
- [x] 已建立並派發 T0017 i18n Tauri runtime persistence smoke 工單：terminal `c7f45b4e70a938941de68d1ce2d85b0a`。
- [x] T0017 已回報 DONE；PLAN-002 標為 DONE。
- [ ] PLAN-002 完成後自動 YOLO 進行 PLAN-003：直接派發 T0018，不再等待使用者二次確認。

## 關聯工單

- T0012：Research i18n architecture and string inventory（DONE；terminal `bc1e45aa6dcaa64069c45be205033653`）
- T0014：Implement i18n foundation（DONE；terminal `95918651a3518df58c8ab43daa2540fd`；commit `d95afa6968f5bf3e4bacc788e7cecf636be53b00`）
- T0015：Migrate visible UI strings to i18n resources（DONE；terminal `d2a41b824dee714f8b67c5c95b2f4ce6`；commit `dce07dd1cc7a51c804baee940440c38c9c229a45`）
- T0016：i18n verification closeout（PARTIAL；terminal `81eadd3470453f59758c7c0c5b52f800`）
- T0017：i18n Tauri runtime persistence smoke（DONE；terminal `c7f45b4e70a938941de68d1ce2d85b0a`）
- T0018：Research theme architecture and token inventory（TODO；PLAN-003；已預建，等 PLAN-002 DONE 後 YOLO 派發）
