---
schema_version: 1
schema_kind: workorder
id: T0015
title: Migrate visible UI strings to i18n resources
status: DONE
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 10:30:55 +08:00"
started_at: "2026-05-24T10:33:45+08:00"
completed_at: "2026-05-24T10:58:01+08:00"
updated_at: "2026-05-24T10:58:01+08:00"
commit: dce07dd1cc7a51c804baee940440c38c9c229a45
bug_id: null
plan_id: PLAN-002
sizing: large
affects_files:
  - src/lib/i18n.ts
  - src/lib/i18n-plugin-labels.ts
  - src/lib/i18n.test.ts
  - src/components/app/app-shell.tsx
  - src/components/side-nav.tsx
  - src/components/global-shortcut-section.tsx
  - src/components/panel-footer.tsx
  - src/components/about-dialog.tsx
  - src/components/changelog-dialog.tsx
  - src/components/provider-card.tsx
  - src/components/provider-card-metric-line.tsx
  - src/components/skeleton-lines.tsx
  - src/pages/settings.tsx
  - src/pages/overview.tsx
  - src/pages/provider-detail.tsx
  - src/lib/pace-tooltip.ts
  - src/lib/reset-tooltip.ts
  - "待 Worker 執行期間確認"
depends_on:
  - PLAN-002
  - T0012
  - T0014
---

# T0015 Migrate Visible UI Strings To I18n Resources

## 元資料
- **工單編號**：T0015
- **任務名稱**：Migrate visible UI strings to i18n resources
- **狀態**：DONE
- **完成時間**：2026-05-24T10:58:01+08:00
- **Commit**：`dce07dd1cc7a51c804baee940440c38c9c229a45`
- **開始時間**：2026-05-24T10:33:45+08:00
- **建立時間**：2026-05-24 10:30:55 (UTC+8)
- **開始時間**：-
- **完成時間**：-
- **目標子專案**：frontend / visible UI strings
- **關聯 PLAN**：PLAN-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `待 Worker 執行期間確認`

## 工作量預估
- **預估規模**：大
- **Context Window 風險**：中高
- **降級策略**：若一次搬移所有字串過大，優先完成 App shell、Settings、dialogs、ProviderCard 與 tooltip helpers；plugin manifest display labels 可列為 PARTIAL 缺口或續工單，但需清楚列出。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要跨多個 UI components 搬移 display text，並維持 regression tests。

## 規格層級自問

- [x] **目標層**：執行。將 T0014 foundation 套用到主要可見 UI 字串。
- [x] **決策權歸屬**：Worker 可依實際檔案拆小步搬移，但不得改變 raw provider/runtime matching semantics。
- [x] **資訊完整度**：T0012 已列出 inventory，T0014 已建立 i18n foundation。
- [x] **回頭成本**：中高。UI 字串多，需測試與 visual smoke。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `_ct-workorders/T0012-research-i18n-architecture.md`
- `_ct-workorders/T0014-implement-i18n-foundation.md`
- `package.json`
- T0014 新增/修改的 i18n source：
  - `src/lib/i18n.ts`
  - `src/hooks/use-i18n.ts`
  - `src/pages/settings.tsx`
  - `src/stores/app-preferences-store.ts`

### 輸入上下文

T0014 已完成：

- 本地 typed dictionary。
- `en` / `zh-TW` resources。
- fail-loud `t()`。
- `useI18n()` hook。
- language persistence。
- Settings language selector。
- tests/build PASS。

T0012 inventory 提醒：

- App shell / nav。
- Settings / preferences。
- Global Shortcut。
- Panel footer / update states。
- About / Changelog dialogs。
- Overview / Provider detail empty states。
- ProviderCard progress / reset / pace / cooldown text。
- Plugin context menu。
- Bundled plugin manifest display labels。

### 實作要求

1. 搬移主要可見 UI 字串：
   - App shell / navigation。
   - Settings / preferences 其餘 UI 字串。
   - Global Shortcut section。
   - Panel footer update / download / install / error / countdown states。
   - About dialog / Changelog dialog controls、status、errors。
   - Overview / Provider detail empty and not-found states。
   - ProviderCard progress、retry、updated、available/reset/limit/cooldown display text。
   - Tooltip helpers：pace/reset labels。
   - Plugin context menu display text。
2. Plugin manifest labels：
   - Provider names / brand names 不翻譯。
   - Raw runtime values、provider line labels、matching keys 不翻譯。
   - 若要顯示翻譯後的 metric labels，必須保留 raw labels 做 matching，只在 render display 階段套 i18n。
   - 不得讓 `overviewLabels` 或 runtime line filtering 改用翻譯後字串。
3. Resource rules：
   - 所有新增 display keys 必須同時加入 `en` 與 `zh-TW`。
   - 不允許 silent fallback。
   - 若有 dynamic text，優先用簡單 interpolation helper 或 function resource；不要引入 i18n dependency。
4. Tests：
   - 更新既有 UI tests，避免硬寫英文造成 zh-TW path 無覆蓋。
   - 保留/擴充 locale completeness test。
   - 補 ProviderCard / tooltip / settings / dialog 相關 regression tests，以風險最高處優先。
5. Visual / smoke：
   - 若改動造成顯著視覺變更，提供 before / after screenshots。
   - 至少以 test/build 驗證 `en` default path。
6. 收尾：
   - 更新 PLAN-002 與 T0015 回報區。
   - 若未能完整搬完所有 inventory，回報 PARTIAL 並列出剩餘檔案與建議續工單。

### 不做

- 不翻譯 provider brand names。
- 不翻譯 raw runtime values、raw errors、logs、traces。
- 不翻譯 GitHub release markdown body。
- 不新增 i18n dependency。
- 不處理 BUG-002 / T0013 backend process work。
- 不重設 UI design。

## 預期產出

- 主要可見 UI 字串改用 i18n resources。
- `en` / `zh-TW` resource keys 完整一致。
- Tests 更新並通過。
- PLAN-002 / T0015 closeout update。

## 驗收條件

- [x] App shell / navigation 字串已搬移。
- [x] Settings / preferences 字串已搬移。
- [x] Global Shortcut 字串已搬移。
- [x] Footer / dialogs / overview / provider detail states 已搬移。
- [x] ProviderCard / tooltip display text 已搬移。
- [x] Plugin context menu display text 已搬移。
- [x] Provider raw matching values 未被翻譯破壞。
- [x] `en` / `zh-TW` resources key set 完全一致。
- [x] 不新增 i18n dependency。
- [x] Regression tests 通過。
- [x] `bun run build` 通過。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件中的文件。
4. 用 T0012 inventory 逐區搬移可見 UI 字串。
5. 更新 i18n resources 與 tests。
6. 執行必要驗證。
7. 更新 PLAN-002 與 T0015 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Commit：`dce07dd1cc7a51c804baee940440c38c9c229a45` (`feat(i18n): migrate visible UI strings`)
- 擴充 typed i18n resources，新增核心 UI、footer、dialog、empty state、pace/reset、plugin manifest display label 的 `en` / `zh-TW` 字串。
- 新增 `translateDisplayLabel(locale, label)`，只翻譯 app-owned bundled plugin label；未知 runtime label 保留原值，不改 manifest matching logic。
- 將 App shell、SideNav / plugin context menu、Settings、Global Shortcut、Panel Footer、About / Changelog、Overview / Provider Detail、ProviderCard / SkeletonLines 接上 `useI18n()` / `t()`。
- ProviderCard metric renderer 拆至 `src/components/provider-card-metric-line.tsx`，讓 `provider-card.tsx` 低於 400 LOC。
- `pace-tooltip` / `reset-tooltip` 支援 locale-aware 顯示，預設英文仍保留原本系統 locale formatter 行為。

### 驗證
- `bun run test --run src/lib/i18n.test.ts src/lib/pace-tooltip.test.ts src/lib/reset-tooltip.test.ts src/lib/reset-tooltip.mocked.test.ts src/components/provider-card.test.tsx src/components/skeleton-lines.test.tsx src/components/panel-footer.test.tsx src/components/side-nav.test.tsx src/components/about-dialog.test.tsx src/components/changelog-dialog.test.tsx src/components/global-shortcut-section.test.tsx src/pages/settings.test.tsx src/pages/overview.test.tsx src/pages/provider-detail.test.tsx` → PASS（14 files / 168 tests）
- `bun run test --run src/App.test.tsx` → PASS（1 file / 78 tests）
- `bun run build` → PASS（`tsc && vite build`；Vite chunk-size warning only）
- `bun run test --run` → PASS（63 files / 1128 tests；expected stderr from app-update error-path tests）
- `git diff --check` → PASS（LF/CRLF warnings only）

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
無

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T10:58:01+08:00
