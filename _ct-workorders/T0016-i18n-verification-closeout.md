---
schema_version: 1
schema_kind: workorder
id: T0016
title: i18n verification closeout
status: PARTIAL
type: verification
intervention_type: fire-and-forget
created_at: "2026-05-24 11:05:45 +08:00"
started_at: "2026-05-24T11:09:02+08:00"
completed_at: "2026-05-24T11:14:58+08:00"
updated_at: "2026-05-24T11:18:58+08:00"
commit: fc527f76ebf4faf5df2f8b357897af416073fc12
bug_id: null
plan_id: PLAN-002
sizing: medium
affects_files:
  - _ct-workorders/PLAN-002-add-i18n-traditional-chinese.md
  - _ct-workorders/T0016-i18n-verification-closeout.md
  - "source/test files only if verification finds a direct i18n regression"
depends_on:
  - PLAN-002
  - T0012
  - T0014
  - T0015
---

# T0016 I18n Verification Closeout

## 元資料
- **工單編號**：T0016
- **任務名稱**：i18n verification closeout
- **狀態**：PARTIAL
- **建立時間**：2026-05-24 11:05:45 (UTC+8)
- **開始時間**：2026-05-24T11:09:02+08:00
- **完成時間**：2026-05-24T11:14:58+08:00
- **Commit**：fc527f76ebf4faf5df2f8b357897af416073fc12
- **目標子專案**：frontend / i18n closeout
- **關聯 PLAN**：PLAN-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
  - `_ct-workorders/T0016-i18n-verification-closeout.md`
  - `source/test files only if verification finds a direct i18n regression`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 UI smoke 受 Tauri runtime / local environment 阻擋，保留 source/test/build 結論，將 runtime smoke gap 寫入 PLAN-002，不得宣稱 runtime 已驗收。

## Session 建議
- **建議類型**：新 Session
- **原因**：需要獨立驗證 T0012/T0014/T0015 產物，並收斂 PLAN-002 狀態。

## 規格層級自問

- [x] **目標層**：驗證 / closeout。確認 PLAN-002 是否達成第一階段驗收。
- [x] **決策權歸屬**：Worker 可把明確 i18n regression 修到綠燈，但不得擴大成新功能或重構。
- [x] **資訊完整度**：T0012 研究、T0014 foundation、T0015 visible string migration 都已 DONE。
- [x] **回頭成本**：中。若驗證發現重大缺口，需保留 PLAN-002 IN_PROGRESS 或 PARTIAL。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `_ct-workorders/T0012-research-i18n-architecture.md`
- `_ct-workorders/T0014-implement-i18n-foundation.md`
- `_ct-workorders/T0015-migrate-visible-ui-strings.md`
- `package.json`
- i18n 相關 source / tests，由 Worker 用 `rg` 定位。

### 輸入上下文

已完成的前置工單：

- T0012：建議使用本地 typed dictionary，不新增 i18n dependency。
- T0014：建立 `en` / `zh-TW` resources、`t()` fail loud、`useI18n()`、language persistence、Settings selector。
- T0015：搬移主要可見 UI 字串，新增 `translateDisplayLabel(locale, label)`，保留 provider raw matching semantics。

### 驗證要求

1. Source / test verification：
   - 執行 `bun run test --run`。
   - 執行 `bun run build`。
   - 若專案有 typecheck script，執行既有 typecheck；不要新增重型工具。
2. i18n resource verification：
   - 確認 `en` / `zh-TW` key set 完全一致。
   - 確認 missing key / unsupported locale 會 fail loud，沒有 silent fallback。
   - 掃描 `src/` 中主要 UI surface 是否仍有明顯 hard-coded display text 殘留。
   - 若殘留屬於 provider brand、raw runtime values、raw errors、logs、traces、GitHub release markdown body，明確列為排除範圍。
3. UI / behavior smoke：
   - 驗證預設 locale 為 `en`。
   - 驗證 Settings 可切換 `English` / `Traditional Chinese`。
   - 驗證 reload 後 language persistence。
   - 若可行，提供目前 `en` / `zh-TW` screenshots；若不可行，記錄阻擋原因。
4. Provider semantics verification：
   - 確認 provider names / brand names 未翻譯。
   - 確認 `overviewLabels`、runtime line filtering、raw matching values 沒改用翻譯後字串。
5. Closeout：
   - 若全部通過，將 PLAN-002 標為 DONE，填 completion / verification summary。
   - 若有缺口，保留 PLAN-002 IN_PROGRESS 或標 PARTIAL，列出剩餘項目與建議續工單。
   - 更新 T0016 回報區，記錄 commit、驗證命令、runtime smoke 結論。

### 不做

- 不新增 i18n dependency。
- 不翻譯 provider brand names、raw runtime values、raw errors、logs、traces。
- 不處理 release workflow / updater。
- 不處理 BUG-001 / BUG-002。
- 不做 UI redesign。

## 預期產出

- PLAN-002 final verification 結論。
- T0016 closeout report。
- 必要時的小型 i18n regression fix 與 tests。

## 驗收條件

- [x] `bun run test --run` 通過。
- [x] `bun run build` 通過。
- [x] `en` / `zh-TW` resource keys 完整一致。
- [x] 缺漏翻譯 fail loud 或 tests 會失敗。
- [x] 預設語言為 `en`。
- [x] Settings 可切換 `zh-TW`。
- [ ] language setting reload 後保持。（source tests PASS；純 browser smoke 受 Tauri runtime 缺失阻擋）
- [x] provider raw matching values 未被翻譯破壞。
- [x] PLAN-002 狀態已依驗證結果收斂。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件文件。
4. 執行 source / test / build verification。
5. 執行 i18n resource / hard-coded text / provider semantics 檢查。
6. 若環境可行，執行 UI smoke 與截圖。
7. 更新 PLAN-002 與 T0016 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
PARTIAL

### 產出摘要
- 已載入 `AGENTS.md`、PLAN-002、T0012、T0014、T0015、`package.json` 與 i18n source/test。
- 未發現需要修改 source/test 的直接 i18n regression。
- PLAN-002 保持 `IN_PROGRESS`：source/test/build 與 browser immediate switch smoke 已通過，但 Tauri runtime reload persistence 尚未完成實機驗收。
- Commit：`fc527f76ebf4faf5df2f8b357897af416073fc12` (`docs(i18n): record T0016 verification`)。

### 驗證
- `bun run test --run` → PASS（exit 0；既有 app-update error-path tests 會輸出預期 stderr）。
- `bun run build` → PASS（`tsc && vite build`；Vite chunk-size warning only）。
- `bun run test --run src/lib/i18n.test.ts src/lib/settings.test.ts src/stores/app-preferences-store.test.ts src/hooks/app/use-settings-bootstrap.test.ts src/hooks/app/use-settings-system-actions.test.ts src/pages/settings.test.tsx` → PASS（6 files / 86 tests）。
- `bun run test --run src/components/provider-card.test.tsx src/components/side-nav.test.tsx src/pages/overview.test.tsx src/pages/provider-detail.test.tsx src/App.test.tsx` → PASS（5 files / 136 tests）。
- i18n fail-loud：`src/lib/i18n.test.ts` 覆蓋 unsupported locale 與 missing key throw；`resources.en` / `resources["zh-TW"]` key set 完整一致。
- hard-coded display text scan：主要 JSX text scan 未發現需搬移的主要 UI display text；保留項為 `OpenUsage` brand、maintainer/link text、URL regex/type helper false positives、keyboard key display labels。
- Provider semantics：`ProviderCard` 仍以 raw `plugin.meta.name` 顯示 provider name；`overviewLabels` 用 raw manifest `line.label` 比對 runtime `line.label`；`translateDisplayLabel()` 只處理顯示層 label，不改 matching value。
- Browser smoke（Playwright fallback）：`http://127.0.0.1:5173/` title `OpenUsage`，初始預設英文；Settings → `Traditional Chinese` 後 UI 立即切換為繁中（例：`語言`、`繁體中文`、`已暫停`），截圖移至 `%TEMP%\openusage-t0016-artifacts-20260524-1116\openusage-t0016-zh-settings.png`。
- Browser reload persistence：PARTIAL / blocked。純 browser 沒有 Tauri internals，`saveLanguage()` fail loud：`Cannot read properties of undefined (reading 'invoke')`；reload 後回到英文，因此此項不能宣稱 runtime accepted。Source persistence tests 已通過。

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
- Browser plugin skill 要求的 Node REPL `js` tool 未暴露；改用可用的 Playwright browser tool，已記錄 fallback。
- `AGENTS.md` 引用的 `LEAN-CTX.md` 在 repo root 未找到；本工單改用已安裝的 `lean-ctx` skill / MCP 工具。
- Tauri `LazyStore` / `invoke` / event APIs 在 localhost browser 缺少 `window.__TAURI_INTERNALS__`，造成 reload persistence runtime smoke 無法在純 browser 完成。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T11:14:58+08:00
