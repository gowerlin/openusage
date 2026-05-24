---
schema_version: 1
schema_kind: workorder
id: T0017
title: i18n Tauri runtime persistence smoke
status: DONE
type: verification
intervention_type: fire-and-forget
created_at: "2026-05-24 11:22:29 +08:00"
started_at: "2026-05-24T11:24:42+08:00"
completed_at: "2026-05-24T11:38:43+08:00"
updated_at: "2026-05-24T11:41:57+08:00"
commit: 5652730d1c062ede94a659917274324ef14dbfbb
bug_id: null
plan_id: PLAN-002
sizing: small
affects_files:
  - _ct-workorders/PLAN-002-add-i18n-traditional-chinese.md
  - _ct-workorders/T0017-i18n-tauri-runtime-persistence-smoke.md
  - "source/test files only if runtime smoke finds a direct i18n persistence regression"
depends_on:
  - PLAN-002
  - T0016
---

# T0017 I18n Tauri Runtime Persistence Smoke

## 元資料
- **工單編號**：T0017
- **任務名稱**：i18n Tauri runtime persistence smoke
- **狀態**：DONE
- **建立時間**：2026-05-24 11:22:29 (UTC+8)
- **開始時間**：2026-05-24T11:24:42+08:00
- **完成時間**：2026-05-24T11:38:43+08:00
- **Commit**：5652730d1c062ede94a659917274324ef14dbfbb
- **目標子專案**：Tauri runtime / frontend i18n persistence
- **關聯 PLAN**：PLAN-002
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
  - `_ct-workorders/T0017-i18n-tauri-runtime-persistence-smoke.md`
  - `source/test files only if runtime smoke finds a direct i18n persistence regression`

## 工作量預估
- **預估規模**：小
- **Context Window 風險**：低
- **降級策略**：若 Tauri runtime 無法在本機啟動，回報 BLOCKED，列出缺少的 runtime prerequisite；不得把純 browser persistence 視為通過。

## Session 建議
- **建議類型**：新 Session
- **原因**：T0016 已完成 source/test/build verification，只剩 Tauri runtime persistence smoke。

## 規格層級自問

- [x] **目標層**：runtime 驗證。補上 T0016 唯一缺口。
- [x] **決策權歸屬**：Worker 可選擇 `bun run tauri dev` 或可用的 packaged app smoke；若發現直接 persistence regression，可做最小修復與測試。
- [x] **資訊完整度**：T0016 已列明缺口是 browser 缺少 `window.__TAURI_INTERNALS__`，無法驗證 reload persistence。
- [x] **回頭成本**：低。此工單只驗證 language persistence，不重新搬移 UI 字串。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/PLAN-002-add-i18n-traditional-chinese.md`
- `_ct-workorders/T0016-i18n-verification-closeout.md`
- `package.json`
- language persistence 相關 source / tests：
  - `src/lib/settings.ts`
  - `src/stores/app-preferences-store.ts`
  - `src/hooks/app/use-settings-bootstrap.ts`
  - `src/hooks/app/use-settings-system-actions.ts`
  - `src/pages/settings.tsx`

### 輸入上下文

T0016 PARTIAL 結論：

- source/test/build PASS。
- i18n resources 與 fail-loud tests PASS。
- browser immediate switch `en` -> `zh-TW` PASS。
- provider raw matching semantics PASS。
- 唯一缺口：純 browser 沒有 Tauri internals，`saveLanguage()` fail loud，reload 後回英文；所以不能宣稱 Tauri runtime reload/app restart persistence 已驗收。

### 驗證要求

1. 啟動 Tauri runtime：
   - 優先使用專案既有 script：`bun run tauri dev`。
   - 若使用 packaged app smoke，記錄使用的 executable / build artifact。
   - 不要用純 `bun run dev` / localhost browser 當作 persistence 驗收。
2. Runtime smoke：
   - 初始預設 locale 應為 `en`。
   - 在 Settings 切到 `Traditional Chinese`。
   - 驗證 UI 立即顯示繁中。
   - reload WebView 或重啟 app。
   - 驗證 language 保持 `zh-TW`。
   - 可行時提供 current screenshots 或 artifact path。
3. 若 runtime smoke PASS：
   - 更新 T0017 為 DONE。
   - 更新 PLAN-002 為 DONE，填完成時間與 final verification。
4. 若 runtime smoke FAIL：
   - 先定位是環境 BLOCKED 還是真實 regression。
   - 環境問題：T0017 標 BLOCKED，PLAN-002 保持 IN_PROGRESS。
   - 真實 regression：允許做最小修復，補測試，再重跑 focused tests/build/runtime smoke。

### 不做

- 不重新搬移 UI 字串。
- 不新增 i18n dependency。
- 不翻譯 provider brand names、raw runtime values、raw errors、logs、traces。
- 不處理 release workflow / updater。
- 不處理 BUG-001 / BUG-002。
- 不做 UI redesign。

## 預期產出

- Tauri runtime language persistence smoke 結論。
- PLAN-002 final DONE 或明確 BLOCKED/PARTIAL 缺口。
- 必要時的小型 persistence regression fix 與 tests。

## 驗收條件

- [x] Tauri runtime 可啟動，或阻擋原因已明確記錄。
- [x] 初始 locale 為 `en`。
- [x] Settings 可切換 `zh-TW`。
- [x] reload 或 app restart 後仍維持 `zh-TW`。
- [x] 若修改 source，focused tests / `bun run build` 通過。（未修改 source；不適用）
- [x] PLAN-002 狀態依 runtime smoke 結論收斂。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件文件。
4. 啟動 Tauri runtime 或記錄啟動 blocker。
5. 執行 language switch + reload/app restart persistence smoke。
6. 必要時做最小修復與 focused verification。
7. 更新 PLAN-002 與 T0017 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
DONE

### 產出摘要
- Tauri runtime language persistence smoke PASS。
- 使用 `VsDevCmd.bat` + `LIBCLANG_PATH=C:\Program Files\Microsoft Visual Studio\18\Enterprise\VC\Tools\Llvm\x64\bin` 啟動 `bun run tauri dev --no-watch --no-dev-server-wait`。
- 使用 Tauri config override `identifier: com.sunstory.openusage.t0017`，隔離測試 app data：`C:\Users\Gower\AppData\Roaming\com.sunstory.openusage.t0017`。
- 未修改 source/test files。
- PLAN-002 已收斂為 DONE。
- Commit：`5652730d1c062ede94a659917274324ef14dbfbb` (`docs(i18n): record T0017 runtime smoke`)。

### 驗證
- Tauri runtime 啟動 PASS：`target\debug\openusage.exe` started；stdout 顯示 `OpenUsage v0.6.24 starting` 與 `app_data_dir: tail=com.sunstory.openusage.t0017`。
- Tauri WebView CDP target PASS：`http://127.0.0.1:9222/json/list` returned page `OpenUsage` at `http://localhost:1420/`。
- Runtime guard PASS：WebView evaluation returned `hasTauriInternals: true` and `isTauriGlobal: true`。
- 初始 locale PASS：initial UI was English; Settings language radios showed `English` checked and `Traditional Chinese` unchecked。
- Settings switch PASS：clicked `Traditional Chinese`; UI immediately showed `語言` / `繁體中文`; language radio `繁體中文` checked。
- Store persistence PASS：`C:\Users\Gower\AppData\Roaming\com.sunstory.openusage.t0017\settings.json` contains `"language": "zh-TW"`。
- Reload persistence PASS：after `Page.reload`, nav labels were `首頁` / `設定`; Settings still showed `語言` / `繁體中文`; language radio `繁體中文` remained checked。
- Screenshots/artifacts：
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0017-20260524-113527\settings-before-zh.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0017-20260524-113527\settings-after-zh.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0017-20260524-113527\settings-after-reload-zh.png`
  - `C:\Users\Gower\AppData\Local\Temp\openusage-t0017-20260524-113527\runtime-smoke-result.json`
- Screenshot sanity PASS：all three screenshots are 600x1152 PNGs with non-zero file size.

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
- `tauri dev -c` inline JSON first failed because PowerShell/Start-Process stripped JSON quotes：`failed to parse config {build:{beforeDevCommand:}}`；改用 temp JSON config file resolved。
- Rust build first failed because `rquickjs-sys` could not find `libclang`：`Unable to find libclang`；setting `LIBCLANG_PATH` resolved that layer。
- Rust build then failed outside Visual Studio developer environment：`fatal error: 'stdio.h' file not found`；launching through `VsDevCmd.bat -arch=x64 -host_arch=x64` resolved。
- Tauri path APIs ignored temporary `APPDATA`; first successful dev launch pointed at real `com.sunstory.openusage` app data. Stopped that instance before changing settings, then relaunched with `identifier: com.sunstory.openusage.t0017` to isolate runtime smoke data。

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T11:38:43+08:00
