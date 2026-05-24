---
schema_version: 1
schema_kind: workorder
id: T0012
title: Research i18n architecture and string inventory
status: DONE
type: research
intervention_type: fire-and-forget
created_at: "2026-05-24 10:02:32 +08:00"
started_at: "2026-05-24T10:05:57+08:00"
completed_at: "2026-05-24T10:14:07+08:00"
updated_at: "2026-05-24T10:14:07+08:00"
commit: 638754f
bug_id: null
plan_id: PLAN-002
sizing: medium
affects_files:
  - "read-only inventory; Worker to identify source files"
depends_on:
  - PLAN-002
---

# T0012 Research I18n Architecture And String Inventory

## 元資料
- **工單編號**：T0012
- **任務名稱**：Research i18n architecture and string inventory
- **狀態**：DONE
- **建立時間**：2026-05-24 10:02:32 (UTC+8)
- **開始時間**：2026-05-24T10:05:57+08:00
- **完成時間**：2026-05-24T10:14:07+08:00
- **目標子專案**：frontend / app shell
- **關聯 PLAN**：PLAN-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `read-only inventory; Worker to identify source files`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若可見字串量過大，先完成架構推薦、主要 UI surface inventory、後續拆單邊界；把完整字串清單列為後續實作工單的一部分。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要讀取前端架構、狀態管理、設定儲存與主要 UI surface；避免污染塔台 context。

## 規格層級自問

- [x] **目標層**：研究 / 盤點。為 PLAN-002 實作提供具體方案。
- [x] **決策權歸屬**：Worker 可推薦最小 i18n helper 或輕量套件，但不得直接實作。
- [x] **資訊完整度**：PLAN-002 已定義使用者選項：全 App UI、預設 `en`、內建 `zh-TW`、完整搬移可見 UI 字串。
- [x] **回頭成本**：中。i18n 架構一旦落地會影響大量 UI 字串，先研究可降低返工。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `package.json`
- `src/` 相關前端 source，由 Worker 用 `rg` 定位：
  - app shell / navigation
  - settings / preferences
  - Control Tower / workorder / bug panel
  - plugin list / plugin detail
  - common loading / empty / error states
  - toast / badge / filter / tab / button display text

### 輸入上下文

使用者已決定 PLAN-002：

- App UI 全面納入 i18n。
- 預設語言 `en`。
- 內建 `zh-TW`，可切換。
- 先研究現有前端架構，再選最小 i18n 套件或既有 pattern。
- 第一階段要完整搬完所有可見 UI 字串。

### 研究要求

1. 盤點現有前端架構：
   - framework / routing / state / settings persistence。
   - 目前是否已有 locale / settings / storage helper。
   - 適合放 i18n provider / hook / resources 的位置。
2. 盤點可見 UI 字串：
   - App shell / navigation。
   - Settings / preferences。
   - Control Tower / workorder / bug panel。
   - Plugin list / plugin detail / plugin status text。
   - Common empty / loading / error states。
   - Buttons、tabs、filters、badges、toasts。
3. 推薦實作方案：
   - 比較本地 dictionary helper、現有 pattern、輕量 i18n 套件。
   - 以簡單、可測、低依賴為優先。
   - 預設 `en`，內建 `zh-TW`，語言選擇需可持久化。
   - 缺漏翻譯需 fail loud 或測試暴露，不 silent fallback。
4. 產出後續工單建議：
   - T0014：Implement i18n foundation。
   - T0015：Migrate visible UI strings。
   - T0016：i18n verification closeout。
   - 如研究發現需改拆，清楚說明理由。

### 不做

- 不修改 source code。
- 不新增 dependency。
- 不搬移字串。
- 不修改 release workflow 或 updater。
- 不要求翻譯第三方 provider 回傳內容、raw logs、trace、error detail。

## 預期產出

- i18n 架構推薦。
- 可見 UI 字串 inventory。
- 風險與測試策略。
- 後續實作工單拆分建議。
- PLAN-002 回報依據。

## 驗收條件

- [x] 找到前端 i18n 最合適落點。
- [x] 找到語言設定持久化最合適落點。
- [x] 盤點主要可見 UI 字串與檔案範圍。
- [x] 明確推薦實作方案。
- [x] 明確列出 T0014 / T0015 / T0016 的實作邊界。
- [x] 不修改 source code。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件中的文件。
4. 用 `rg` 盤點 UI 字串與相關架構。
5. 整理推薦方案與後續拆單。
6. 更新 PLAN-002 與 T0012 回報區；不改 source code。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Commit：`638754f` (`docs(i18n): research T0012 architecture`)
- 現有前端是 Vite + React 19 + Zustand；無 router，畫面由 `src/stores/app-ui-store.ts` 的 `activeView` 和 `src/components/app/app-content.tsx` 切換。
- 目前沒有 locale / i18n helper。設定持久化集中在 `src/lib/settings.ts`，使用 Tauri `LazyStore("settings.json")`；這是語言設定最小落點。
- 推薦先建本地 typed dictionary，不新增 dependency：`src/lib/i18n.ts` 或 `src/i18n/resources.ts` 提供 `Locale`、`I18nKey`、`resources`、`t()`；React 用 `useI18n()` 讀取 `useAppPreferencesStore.language`。
- 語言 preference 建議新增到 `src/stores/app-preferences-store.ts`，並在 `src/lib/settings.ts` 增加 `LANGUAGE_KEY`、`DEFAULT_LANGUAGE = "en"`、`loadLanguage()`、`saveLanguage()`；bootstrap/action 流程照 `themeMode`、`displayMode`、`timeFormatMode` pattern。
- `react-i18next` 官方方案可用 `useTranslation()` 與 `i18n.changeLanguage()`，也有 TypeScript guide；但第一階段只有內建靜態 UI 字串，無遠端載入、namespace、plural ICU、SEO，因此暫不建議新增套件。
- Control Tower / workorder / bug panel 目前不在 `src/` UI 內；只有 `_ct-workorders` markdown 與 PLAN/T 工單文件，不列入前端字串搬移。

### 調查結論
1. **最合適 i18n 落點**：`App` 不需新增 heavy provider。新增 `src/lib/i18n.ts` / `src/i18n/resources.ts` + `useI18n()` hook，讓 component 透過 hook 取 `t()`；非 component helper 優先接收 `t` 或 `locale` 參數，避免模組載入時固定英文。
2. **最合適持久化落點**：沿用 `src/lib/settings.ts` 的 Tauri Store。`settings.json` 已保存 plugin order、theme、display、reset timer、time format、global shortcut、start on login、menubar icon style；新增 `language` key 符合現有 pattern。
3. **主要 inventory**：
   - `src/components/app/app-shell.tsx`：`Move panel` aria/title。
   - `src/components/side-nav.tsx`：`Home`、`Help`、`Settings`、context menu `Refresh usage` / `Disable plugin` / `Inspect Element`。
   - `src/pages/settings.tsx`：Settings sections、helper copy、radiogroup labels、example text、Start on Login、Plugins。
   - `src/components/global-shortcut-section.tsx`：Global Shortcut UI、recording placeholder、clear/help text；key names like `Cmd` / `Ctrl` can stay platform labels or be listed as UI labels.
   - `src/components/panel-footer.tsx`：update/download/install/error states、countdown、Refresh now。
   - `src/components/about-dialog.tsx`、`src/components/changelog-dialog.tsx`：dialog controls/status/errors；remote release markdown body remains raw external content。
   - `src/pages/overview.tsx`、`src/pages/provider-detail.tsx`：empty/not-found states。
   - `src/components/provider-card.tsx`、`src/lib/pace-tooltip.ts`、`src/lib/reset-tooltip.ts`：Retry、Updated、Available in、Limit reached、pace/reset labels、progress secondary text。
   - `plugins/*/plugin.json`：19 bundled plugin manifests expose app-owned metric labels. Provider names/brand names stay unchanged; metric labels should be display-translated without changing matching logic.
4. **重要限制**：不要直接翻譯 `line.label` 再拿來比對。`ProviderCard` 目前用 manifest label 建 `overviewLabels` 再過濾 runtime lines；搬移時應保留 raw labels 做 matching，只在 render display 時套 i18n。

### 建議方向
- **推薦方案 A：本地 typed dictionary（推薦）**
  - 優點：最小變更、無 dependency、typecheck 可守住 key、符合內部 2-5 人 app。
  - 缺點：沒有現成 plural/namespace/extractor；需自建 completeness test。
- **方案 B：react-i18next / i18next**
  - 優點：成熟 hook、language switching、namespace、TypeScript guide。
  - 缺點：新增 dependency 與 init/Suspense/instance 管理；第一階段需求過小。
- **方案 C：只用 ad hoc constants**
  - 優點：最快。
  - 缺點：容易 silent fallback、難檢查 zh-TW 完整度；不建議。

後續拆單：
- **T0014 Implement i18n foundation**：新增 locale/resource/types、`useI18n()`、language preference load/save/store/action、Settings language selector、locale completeness tests。只搬 language selector 必要字串。
- **T0015 Migrate visible UI strings**：依 inventory 搬 App shell、Settings、dialogs、ProviderCard、tooltip helpers、plugin context menu、plugin manifest display labels；保留 raw provider/runtime values。
- **T0016 i18n verification closeout**：跑 `bun run test`、`bun run build`，做 `en` / `zh-TW` UI smoke、reload persistence smoke，若 PR 含視覺變更提供 before/after screenshots。

### 驗證
- 已讀：`AGENTS.md`、`_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`、`package.json`。
- 已讀主要 source：`src/App.tsx`、`src/main.tsx`、`src/components/app/*`、`src/pages/*`、`src/stores/*`、`src/lib/settings.ts`、`src/components/side-nav.tsx`、`src/components/panel-footer.tsx`、`src/components/provider-card.tsx`、dialog/global-shortcut/tooltip hooks。
- 已跑 inventory：
  - `rg -n ... localStorage|sessionStorage|LazyStore|settings.json|load/save ... src`
  - `rg -n ... create<|useApp.*Store|activeView|ProviderDetailPage|SettingsPage|OverviewPage ... src`
  - `rg -n ... aria-label|title|text|label|message ... src`
  - `rg -n ... Control Tower|workorder|bug ... src`
  - plugin manifest inventory over `plugins/*/plugin.json`
- 已查官方文件：`react-i18next` `useTranslation` docs、`i18next` TypeScript docs。
- 未跑 build/test：本工單是唯讀研究與文件回報，未改 source code。

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
無

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T10:14:07+08:00
