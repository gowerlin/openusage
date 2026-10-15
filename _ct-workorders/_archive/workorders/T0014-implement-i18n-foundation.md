---
schema_version: 1
schema_kind: workorder
id: T0014
title: Implement i18n foundation
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 10:15:53 +08:00"
started_at: "2026-05-24T10:19:54+08:00"
completed_at: "2026-05-24T10:28:19+08:00"
updated_at: "2026-05-24T10:28:19+08:00"
commit: d95afa6968f5bf3e4bacc788e7cecf636be53b00
bug_id: null
plan_id: PLAN-002
sizing: medium
affects_files:
  - src/lib/i18n.ts
  - src/hooks/use-i18n.ts
  - src/lib/settings.ts
  - src/stores/app-preferences-store.ts
  - src/hooks/app/use-settings-bootstrap.ts
  - src/hooks/app/use-settings-system-actions.ts
  - src/components/app/app-content.tsx
  - src/pages/settings.tsx
  - src/lib/i18n.test.ts
  - src/lib/settings.test.ts
  - src/stores/app-preferences-store.test.ts
  - src/hooks/app/use-settings-bootstrap.test.ts
  - src/hooks/app/use-settings-system-actions.test.ts
  - src/pages/settings.test.tsx
  - src/App.test.tsx
depends_on:
  - PLAN-002
  - T0012
---

# T0014 Implement I18n Foundation

## 元資料
- **工單編號**：T0014
- **任務名稱**：Implement i18n foundation
- **狀態**：DONE
- **建立時間**：2026-05-24 10:15:53 (UTC+8)
- **開始時間**：2026-05-24T10:19:54+08:00
- **完成時間**：2026-05-24T10:28:19+08:00
- **目標子專案**：frontend / settings / i18n
- **關聯 PLAN**：PLAN-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src/lib/i18n.ts`
  - `src/hooks/use-i18n.ts`
  - `src/lib/settings.ts`
  - `src/stores/app-preferences-store.ts`
  - `src/hooks/app/use-settings-bootstrap.ts`
  - `src/hooks/app/use-settings-system-actions.ts`
  - `src/components/app/app-content.tsx`
  - `src/pages/settings.tsx`
  - `src/lib/i18n.test.ts`
  - `src/lib/settings.test.ts`
  - `src/stores/app-preferences-store.test.ts`
  - `src/hooks/app/use-settings-bootstrap.test.ts`
  - `src/hooks/app/use-settings-system-actions.test.ts`
  - `src/pages/settings.test.tsx`
  - `src/App.test.tsx`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 Settings language selector 牽涉過多 UI 字串，先完成 typed resources、`t()` / `useI18n()`、language persistence 與 completeness tests；UI selector 缺口回報 PARTIAL。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要修改前端 source、settings store 與 tests；與塔台 context 分離。

## 規格層級自問

- [x] **目標層**：執行。落地 PLAN-002 的 i18n foundation。
- [x] **決策權歸屬**：Worker 依 T0012 研究結論實作最小 typed dictionary，不新增 i18n dependency。
- [x] **資訊完整度**：T0012 已完成架構推薦、字串盤點與拆單建議。
- [x] **回頭成本**：中。i18n resources 和 settings persistence 是後續所有字串搬移的基礎。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `_ct-workorders/T0012-research-i18n-architecture.md`
- `package.json`
- 相關前端 source / test 檔案：
  - `src/lib/settings.ts`
  - `src/stores/app-preferences-store.ts`
  - `src/pages/settings.tsx`
  - 既有 settings / store tests，由 Worker 用 `rg` 定位。

### 輸入上下文

T0012 結論：

- 使用本地 typed dictionary，不新增 `react-i18next` / `i18next` dependency。
- 新增 `en` / `zh-TW` resources、`Locale`、`I18nKey`、`t()`。
- React components 透過 `useI18n()` 取得翻譯。
- 語言設定放在 `src/stores/app-preferences-store.ts`。
- 持久化沿用 `src/lib/settings.ts` 的 Tauri `LazyStore("settings.json")`。
- 預設語言是 `en`，內建 `zh-TW`。
- 缺漏翻譯需 fail loud 或由 tests 暴露，不 silent fallback。

### 實作要求

1. i18n foundation：
   - 新增最小 typed dictionary module，例如 `src/lib/i18n.ts` 或 `src/i18n/resources.ts`。
   - 定義 `Locale = "en" | "zh-TW"`。
   - 定義 typed `I18nKey`，讓 key 不容易拼錯。
   - 提供 `resources`、`SUPPORTED_LOCALES`、`DEFAULT_LOCALE = "en"`、`t(locale, key)`。
   - `t()` 遇到缺 key / 缺 locale 必須 fail loud，不要 silent fallback。
2. React integration：
   - 新增 `useI18n()` 或等價 hook。
   - hook 從 app preferences store 讀取目前 language。
   - 回傳 `locale`、`setLocale` / `setLanguage`、`t()`。
3. Language persistence：
   - 在 `src/lib/settings.ts` 新增 `language` key。
   - 新增 `loadLanguage()` / `saveLanguage()`，沿用現有 settings helper pattern。
   - 在 `src/stores/app-preferences-store.ts` 新增 language state、bootstrap load、update action。
   - 預設值必須是 `en`。
4. Settings UI：
   - 在 Settings 加入 language selector。
   - 只搬 language selector 必要字串；完整 UI 字串搬移留給 T0015。
   - 支援切換 `English` / `繁體中文`。
5. Tests：
   - 新增 locale completeness test，確保 `en` 與 `zh-TW` key set 完全一致。
   - 測試 `t()` 缺 key / 缺 locale fail loud。
   - 測試 language setting load/save 或 store action。
   - 若修改 Settings UI，補必要 component test。
6. 收尾：
   - 更新 PLAN-002 與 T0014 回報區。
   - 若完成，記錄 commit、驗證命令與剩餘風險。

### 不做

- 不搬移全部可見 UI 字串，留給 T0015。
- 不翻譯 provider raw runtime values、logs、trace、raw errors、GitHub release markdown body。
- 不新增 `react-i18next` / `i18next` 或其他 i18n dependency。
- 不更動 release workflow / updater。
- 不碰 BUG-002 / T0013 的 backend process work。

## 預期產出

- Typed i18n resources / helper。
- `useI18n()` 或等價 hook。
- `language` preference load/save/store/action。
- Settings language selector。
- Locale completeness / fail-loud tests。
- PLAN-002 / T0014 closeout update。

## 驗收條件

- [x] 預設語言為 `en`。
- [x] `zh-TW` 內建於 app。
- [x] Settings 可切換語言。
- [x] 語言設定 reload / app restart 後保持。
- [x] `en` / `zh-TW` resource key 完全一致。
- [x] 缺漏翻譯 fail loud 或 tests 會失敗。
- [x] 不新增 i18n dependency。
- [x] Regression tests 通過。
- [x] `bun run build` 通過。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件中的文件。
4. 實作最小 i18n foundation。
5. 補 regression tests。
6. 執行必要驗證。
7. 更新 PLAN-002 與 T0014 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Commit：`d95afa6968f5bf3e4bacc788e7cecf636be53b00` (`feat(i18n): implement T0014 foundation`)
- 新增 `src/lib/i18n.ts` typed dictionary：`Locale = "en" | "zh-TW"`、`I18nKey`、`resources`、`SUPPORTED_LOCALES`、`DEFAULT_LOCALE = "en"`、`LOCALE_OPTIONS`、`t(locale, key)`。
- `t()` 對 unsupported locale 或 missing key fail loud；沒有 silent fallback。
- 新增 `src/hooks/use-i18n.ts`，從 app preferences store 讀 language，回傳 `locale`、`setLocale` / `setLanguage`、`t()`。
- 在 `src/lib/settings.ts` 新增 `language` key、`DEFAULT_LANGUAGE`、`loadLanguage()`、`saveLanguage()`，沿用 Tauri `LazyStore("settings.json")` pattern。
- 在 `src/stores/app-preferences-store.ts`、`use-settings-bootstrap.ts`、`use-settings-system-actions.ts`、`App.tsx`、`AppContent` 串接 language state / load / save / action。
- 在 Settings 新增 Language selector，可切換 `English` / `Traditional Chinese`；只搬 selector 必要字串，完整 UI 字串留給 T0015。
- 新增 / 更新 regression tests：i18n completeness + fail-loud、settings load/save、store action、bootstrap load、language save handler、Settings selector、App test settings mocks。

### 驗證
- `bun run test --run src/lib/i18n.test.ts src/lib/settings.test.ts src/stores/app-preferences-store.test.ts src/hooks/app/use-settings-bootstrap.test.ts src/hooks/app/use-settings-system-actions.test.ts src/pages/settings.test.tsx` → PASS（6 files / 85 tests）
- `bun run test --run src/App.test.tsx` → PASS（1 file / 78 tests）
- `bun run test --run` → PASS（63 files / 1127 tests）
- `bun run build` → PASS（`tsc && vite build`）

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
- 既有工作樹有多個非本工單 dirty / untracked 檔案，已只 stage 本工單 source/test 與 T0014/PLAN-002 closeout 檔案。
- 嘗試執行 `node scripts/lint-frontmatter.mjs --path ...` 時 repo 內無 `scripts/lint-frontmatter.mjs`，因此 frontmatter lint 不適用；指定驗收仍以 tests/build 通過為準。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T10:28:19+08:00
