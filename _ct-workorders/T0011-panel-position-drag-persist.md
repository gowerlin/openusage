---
schema_version: 1
schema_kind: workorder
id: T0011
title: Make panel window draggable and persist position
status: FIXED
type: execution
intervention_type: fire-and-forget
created_at: "2026-05-24 09:17:34 +08:00"
started_at: "2026-05-24T09:22:06+08:00"
completed_at: "2026-05-24T09:34:45+08:00"
updated_at: "2026-05-24T09:34:45+08:00"
bug_id: BUG-001
plan_id: null
sizing: medium
affects_files:
  - src/components/app/app-shell.tsx
  - src/hooks/app/use-panel.ts
  - src/hooks/app/use-panel.test.ts
  - src-tauri/src/lib.rs
  - src-tauri/src/panel.rs
  - src-tauri/src/panel_position.rs
depends_on:
  - BUG-001
---

# T0011 Make Panel Window Draggable And Persist Position

## 元資料
- **工單編號**：T0011
- **任務名稱**：Make panel window draggable and persist position
- **狀態**：FIXED
- **建立時間**：2026-05-24 09:17:34 (UTC+8)
- **開始時間**：2026-05-24T09:22:06+08:00
- **完成時間**：2026-05-24T09:34:45+08:00
- **目標子專案**：frontend / app shell
- **關聯 BUG**：BUG-001
- **intervention_type**：fire-and-forget
- **affects_files**：
  - `src/components/app/app-shell.tsx`
  - `src/hooks/app/use-panel.ts`
  - `src/hooks/app/use-panel.test.ts`
  - `src-tauri/src/lib.rs`
  - `src-tauri/src/panel.rs`
  - `src-tauri/src/panel_position.rs`

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若拖曳互動或持久化行為牽涉大型 UI 重構，先完成最小可用範圍：單一目標面板可拖曳、可記憶、可 clamp，並回報 PARTIAL 與缺口。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：需要讀取前端 UI component、狀態持久化方式、測試設定；避免污染塔台 context。

## 規格層級自問

- [x] **目標層**：執行。修復使用者回報的 UI bug。
- [x] **決策權歸屬**：Worker 可自行選擇最符合現有程式碼的 component seam 與 local persistence helper；不得引入重型 window manager。
- [x] **資訊完整度**：BUG-001 已描述預期/實際行為；Worker 可用 `rg` 定位相關 panel component。
- [x] **回頭成本**：中。限定 UI 行為與 persistence，小心避免影響現有 tab/button/scroll 行為。
- [x] **記憶覆蓋**：無。

## 任務指令

### 前置條件
需載入：
- `AGENTS.md`
- `_ct-workorders/BUG-001-panel-position-drag-persist.md`
- `package.json`
- 相關前端 source / test 檔案，由 Worker 用 `rg` 定位：
  - `指揮塔`
  - `Control Tower`
  - `ControlTower`
  - `workorder`
  - `panel`
  - `dialog`
  - `BUG`

### 輸入上下文

使用者回報：面板視窗開啟後需要能拖曳位置，並記住位置，下次開啟時回到記憶位置。

目前目標是 UI bug fix，不是 redesign。請保持簡單，沿用現有元件、狀態管理、storage pattern。

### 實作要求

1. 找到顯示指揮塔 / 工單 / bug 面板的浮動視窗或 panel component。
2. 讓面板顯示後可拖曳移動：
   - 優先使用標題列或明確拖曳區。
   - 不要讓 tab、button、checkbox、scrollbar、input 等互動元素觸發拖曳。
   - 滑鼠 / pointer 操作要穩定，不要造成選字或 scroll 卡住。
3. 記住位置：
   - 使用現有 persistence pattern；若沒有合適 helper，使用簡單 localStorage key。
   - 儲存 `{ x, y }` 即可，不做複雜多螢幕設定。
   - 下次開啟、reload、app restart 後套用記憶位置。
4. 邊界保護：
   - 首次開啟保持現有預設位置。
   - 讀到壞資料或 viewport 改變導致位置超出畫面時，clamp 到可見範圍。
   - 保留面板基本可操作區域在 viewport 內。
5. Regression test：
   - 能補 UI interaction test 就補。
   - 若現有測試架構不適合完整拖曳，至少補 position storage / clamp helper 的單元測試。
6. 收尾：
   - 更新 T0011 回報區。
   - 若修復完成，將 BUG-001 狀態更新為 FIXED，並寫入驗證摘要。

### 不做

- 不重設整個面板設計。
- 不新增重型依賴。
- 不處理 release workflow 或 updater。
- 不修改既有 `_ct-workorders` 歷史檔案，除 BUG-001 與 T0011 closeout 必要欄位外。

## 預期產出

- 面板 draggable + persisted position 實作。
- 相關 regression test。
- BUG-001 closeout 狀態更新為 FIXED（若驗證通過）。
- T0011 回報區包含修改檔案、驗證命令、剩餘風險。

## 驗收條件

- [x] 面板開啟後可拖曳移動。
- [x] 關閉再開啟後位置保持。
- [x] Reload / restart 後位置保持。
- [x] 壞資料或小 viewport 時位置會 clamp，不會開到畫面外。
- [x] 互動元素不被拖曳行為破壞。
- [x] Regression test 通過。
- [x] 相關 build/typecheck/test 通過；若有無法執行的驗證，清楚回報原因。

## Sub-session 執行指示

> 開始前填「開始時間」。完成後必填回報區。狀態只能是 DONE / FAILED / BLOCKED / PARTIAL。

### 執行步驟
1. 讀取本工單全部內容。
2. 更新「開始時間」。
3. 載入前置條件中的文件。
4. 用 `rg` 定位目標面板與 persistence pattern。
5. 實作最小可用修復。
6. 執行 regression test 與必要驗證。
7. 更新 BUG-001 與 T0011 回報區。

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
FIXED

### 產出摘要
- `src/components/app/app-shell.tsx`：新增明確面板拖曳區，避免 tab/button/scrollbar/input 觸發拖曳。
- `src/hooks/app/use-panel.ts`：新增 `startPanelDrag`，primary pointer 才呼叫 Tauri `startDragging()`，失敗時 `console.error`。
- `src-tauri/src/panel_position.rs`：新增面板位置保存、讀取、顯示前套用與螢幕 work area clamp helper。
- `src-tauri/src/panel.rs` / `src-tauri/src/lib.rs`：顯示面板時優先套用已存位置；主視窗 move event 寫入 `settings.json` 的 `panelPosition`。
- `src/hooks/app/use-panel.test.ts`：新增拖曳觸發與非 primary pointer 忽略測試。
- commit：待補

### 驗證
- `bun run test src/hooks/app/use-panel.test.ts --run`：PASS，9 tests。
- `bun run build`：PASS。
- `bun run test --run`：PASS，61 files / 1115 tests。測試期間有既有 `plugin-store` mocked stderr，exit code 0。
- `cargo fmt --check`：PASS。
- `cmd /c "call VsDevCmd.bat ... && set LIBCLANG_PATH=... && cargo test"`：PASS，99 tests。
- `cmd /c "call VsDevCmd.bat ... && set LIBCLANG_PATH=... && cargo test panel_position"`：PASS，2 tests。

### 互動紀錄
無

### Renew 歷程
無

### 遭遇問題
無

### sprint-status.yaml 已更新
不適用

### 回報時間
2026-05-24T09:34:45+08:00
