---
schema_version: 1
schema_kind: plan
id: PLAN-001
title: Windows version port
status: DONE
priority: High
plan_type: architecture
created_at: "2026-05-23 22:31:25 +08:00"
updated_at: "2026-05-24T03:02:03+08:00"
affects_files: []
depends_on: []
---

# PLAN-001 Windows Version Port

## Metadata

| Field | Value |
|-------|-------|
| **編號** | PLAN-001 |
| **標題** | Windows version port |
| **狀態** | DONE |
| **優先級** | 🔴 High |
| **類型** | 架構調整 |
| **建立時間** | 2026-05-23 22:31:25 (UTC+8) |
| **完成時間** | 2026-05-24T03:02:03+08:00 |

## 動機 / 背景

建立獨立分支，規劃並實作 Windows 版本移植。

## 預期目標

- 建立 Windows porting 專用分支。
- 盤點 Windows build / runtime / packaging 差異。
- 拆出研究、實作、驗證工單。
- 完成可驗證的 Windows 版本移植路徑。

## 初始範圍

- Branch strategy：確認新分支名稱與基底。
- Research：確認目前專案對 Windows 的阻塞點。
- Implementation：依研究結論分批修正。
- Verification：定義 Windows build / run / package 檢查命令。

## 下一步

- [x] 已轉為 PLANNED。
- [x] 已建立研究工單：T0001。
- [x] T0001 回報可決策結論：推薦 Windows MVP。
- [x] 已建立實作工單：T0002。
- [x] T0002 完成 Windows Rust build baseline。
- [x] 已建立實作工單：T0003。
- [x] T0003 完成 Windows host API MVP：Windows host API 明確 unsupported / fail loud，不 silent fallback。
- [x] 已建立實作工單：T0004。
- [x] T0004 完成 Windows provider path audit：Cursor/Windsurf/Perplexity explicit unsupported，Kiro/Gemini 補 Windows path。
- [x] 已建立實作工單：T0005。
- [ ] T0005 Windows packaging / release workflow 部分完成：NSIS packaging 通過；updater `.sig/latest.json` 需 GitHub signing secret 驗證。
- [x] 已建立實作工單：T0006。
- [x] T0006 完成 Windows docs/UI polish：README/docs/shortcut labels 已更新，保留 release verification 邊界。
- [x] 已建立研究工單：T0007。
- [x] T0007 完成 release readiness audit：source-complete / local package PASS；public release BLOCKED。
- [x] 已建立研究工單：T0008。
- [x] T0008 回報 BLOCKED：fork release path 尚未建立；使用者授權 C 完整 release flow。
- [x] 已建立執行工單：T0009。
- [x] T0010 完成 Windows-only release config：workflow 已移除 macOS release path，updater endpoint 指向 `gowerlin/openusage`。
- [x] 使用者決定 C：改 Windows-only release workflow，updater endpoint 改 `gowerlin/openusage`。
- [x] 已建立執行工單：T0010。
- [x] T0010 完成 Windows-only release config：workflow 已移除 macOS release path，updater endpoint 指向 `gowerlin/openusage`。
- [x] 使用者回報已設定 `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
- [x] 已 Renew T0009，要求重跑 release preflight / tag / Actions / artifact verification。
- [x] T0009 Renew #1 回報 PARTIAL：secrets metadata 通過，branch/tag 已推送，但 Actions 因 invalid `tauri-apps/tauri-action@v1` 失敗；branch 已修正為 `@v0.6.2`，需決策 retag 或 bump version。
- [x] 決策：使用者選 `1` / Option A，授權 force-update `v0.6.24` 到 `5237715` 後重跑 release。
- [x] T0009 Renew #2 回報 BLOCKED：retag 成功，Actions 從 `5237715` 開始執行，但 updater signing 因 `TAURI_SIGNING_PRIVATE_KEY` / password 內容不匹配或 key 格式錯誤失敗。
- [x] 使用者要求產生新 Tauri updater key pair，並同步更新 `tauri.conf.json` updater `pubkey`。
- [x] T0009 Renew #3 DONE：key rotation、secret update、pubkey commit、retag/release verification 已完成；GitHub Actions run `26340728709` 成功。
- [x] Windows public release PASS：`v0.6.24` release 已存在，包含 NSIS setup、`.sig`、`latest.json` Windows platform entries，artifact URLs 指向 `gowerlin/openusage`。

## 關聯工單

- T0001：Research Windows porting plan（PARTIAL；結論可決策）
- T0002：Windows Rust build baseline（DONE）
- T0003：Windows host API MVP（DONE）
- T0004：Windows provider path audit（DONE）
- T0005：Windows packaging / release workflow（PARTIAL）
- T0006：Windows docs/UI polish（DONE）
- T0007：Windows release verification closeout（DONE）
- T0008：Signed Windows release verification（BLOCKED）
- T0009：Fork release flow for Windows artifacts（DONE；release `v0.6.24` verified）
- T0010：Windows-only release config for fork（DONE）
- 下一步建議：PLAN-001 可收斂為 DONE；若要處理 CI warning，可另開 follow-up 將 `tauri-action` input `uploadUpdaterJson` 改成目前 action 支援的 `includeUpdaterJson`。
