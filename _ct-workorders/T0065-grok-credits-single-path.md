---
schema_version: 1
schema_kind: workorder
id: T0065
title: Grok - follow upstream credits single path and show Weekly on overview
status: PENDING
priority: Medium
type: feature
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:52:40+08:00"
updated_at: "2026-10-15T16:52:40+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0061
affects_files:
  - plugins/grok/plugin.js
  - plugins/grok/plugin.json
  - plugins/grok/plugin.test.js
---

# T0065 Grok: Follow Upstream Credits Single Path + Weekly On Overview

## 背景

T0058（`81c37218`）只加了 Weekly，保留 legacy `/v1/billing` monthly 路徑。Worker 指出：上游 `5fcb4312` 已改為 credits 單一請求並移除 monthly meter；若帳號已轉 unified billing、`/v1/billing` 不再回 `monthlyLimit`，fork plugin 會在 Weekly 之前 throw「Grok billing response changed.」→ 整個 provider 失敗。另 Weekly 目前只在詳細頁（manifest 無 overview line）。塔台決定補完移植（D098）。

## 任務指令

1. 讀上游 `5fcb4312`、`37f9a219` 與 `upstream/main:Sources/OpenUsage/Providers/Grok/*`、`docs/providers/grok.md`，確認 credits 回應能提供的欄位（`creditUsagePercent`、`currentPeriod`、`onDemandCap`、`prepaidBalance`…）。
2. Grok plugin 改為**以 credits 為主**：
   - credits 成功 → 輸出 Weekly（及上游由 credits 衍生的 Pay as you go 等）。
   - legacy `/v1/billing` 改為**選用**：有 `monthlyLimit` 才輸出 `Credits used`；缺欄位**不 throw**（log.info），不影響 Weekly。
   - credits 與 billing 都失敗 → 明確錯誤（fail loud，訊息清楚）。
3. `plugin.json` 加 overview line：`{ "type": "progress", "label": "Weekly", "scope": "overview", "period": "weekly", "primaryOrder": 1 }`（比照其他 plugin manifest 寫法；確認 tray / weekly metric 行為）。
4. 測試：unified billing（無 `monthlyLimit`）+ credits OK → 不 throw、有 Weekly；legacy 帳號兩者皆有 → 都顯示；兩者皆失敗 → 錯誤。用上游 fixture。
5. 稽核 redaction（無新欄位則註明）。

## 驗證 Gate

- PASS：`bun run test --run plugins/grok`、`bun run test --run`、`bun run bundle:plugins`、`bun run build`
- Runtime：無 Grok 憑證則註明「未實機」。

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- Commit：`feat(grok): credits-first path and weekly overview line (T0065)`，只含本單檔案 + 回報區。不 push、不 tag、不發行。

## 回報區

（Worker 填寫：狀態、commit、改動、上游引用、驗證證據、偏差）
