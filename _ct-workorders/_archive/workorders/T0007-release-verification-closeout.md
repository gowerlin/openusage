---
schema_version: 1
schema_kind: workorder
id: T0007
title: Windows release verification closeout
status: DONE
type: research
interaction_mode: enabled
intervention_type: decision-requiring
renew_count: 0
created_at: "2026-05-24 00:59:52 +08:00"
started_at: "2026-05-24T01:02:47+08:00"
completed_at: "2026-05-24T01:06:12+08:00"
updated_at: "2026-05-24T01:06:12+08:00"
plan_id: PLAN-001
sizing: small
affects_files:
  - "_ct-workorders/T0007-release-verification-closeout.md"
depends_on:
  - T0006
---

# T0007 Windows Release Verification Closeout

## 元資料
- **工單編號**：T0007
- **任務名稱**：Windows release verification closeout
- **狀態**：DONE
- **類型**：research
- **互動模式**：enabled
- **Renew 次數**：0
- **建立時間**：2026-05-24 00:59:52 (UTC+8)
- **開始時間**：2026-05-24T01:02:47+08:00
- **完成時間**：2026-05-24T01:06:12+08:00
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0001, T0002, T0003, T0004, T0005, T0006
- **intervention_type**：decision-requiring
- **affects_files**：
  - `_ct-workorders/T0007-release-verification-closeout.md`

## 工作量預估
- **預估規模**：小
- **Context Window 風險**：低
- **降級策略**：若缺 GitHub signing secrets、tag release 權限或 network access，回報 PARTIAL/BLOCKED，產出明確 closeout decision options。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：這是 release gate / closeout 判定，不應污染塔台 context，也不應在塔台直接讀 source。

## 規格層級自問

- [x] **目標層**：研究 / 決策。目標是判斷 PLAN-001 可否 close、需不需要人工 release verification。
- [x] **決策權歸屬**：Worker 不可 push/tag/release；只能提出 options，必要時請使用者決策。
- [x] **資訊完整度**：T0001-T0006 已提供 implementation / verification evidence。
- [x] **回頭成本**：低。只寫回本工單回報，不改 source。
- [x] **記憶覆蓋**：T0005 仍 PARTIAL；不得宣稱 Windows public release ready，除非有實際 release artifact evidence。

## 研究目標

整理 Windows port MVP 的 release readiness，判斷 PLAN-001 是否可以：
- A. 標記 source-complete / runtime-partial；
- B. 等 GitHub signing secrets + tag release 驗證後再 close；
- C. 需要再開工單補 release / provider parity / credential/sqlite。

## 已知資訊

- T0002 DONE：Windows Rust build baseline 通過。
- T0003 DONE：Windows host API explicit unsupported / fail loud。
- T0004 DONE：provider path audit 完成。
- T0005 PARTIAL：NSIS packaging 通過，但 updater `.sig/latest.json` 未在 signing secret/tag release 條件下驗證。
- T0006 DONE：README/docs/UI polish 完成，未宣稱 Windows public release ready。
- 目前不得 push / create PR / create tag / publish release / commit。

## 調查範圍

- 讀取 T0001-T0006 回報與 PLAN-001。
- 檢查目前 git branch / dirty status / local artifacts metadata。
- 檢查是否能在不使用 secrets、不 push tag 的條件下完成 release readiness audit。
- 若能查到 local Windows installer artifact，記錄路徑與 limitation。
- 不讀取秘密值；不要嘗試印出 secrets。

## 互動規則

- Worker 若需要 release closeout decision，可向使用者提問，最多 3 題。
- 每題提供選項 + 「其他：________」。
- 不得要求使用者貼出 secret value。

## 禁止事項

- 不 push。
- 不 create tag。
- 不 publish release。
- 不 commit。
- 不讀取或輸出 secret value。
- 不宣稱 Windows public release ready，除非 GitHub release artifact、`.sig`、`latest.json` Windows entry 有實證。

## 預期產出

- Release readiness summary。
- Source/build/test/package evidence table。
- Remaining blockers。
- Closeout decision options。
- 建議是否需要 T0008。

## 驗收條件

- [ ] 明確區分 source-complete、local package PASS、public release PASS。
- [ ] 明確處理 T0005 的 updater artifact blocker。
- [ ] 不 push / tag / release / commit。
- [ ] 若建議 close PLAN-001，需標明 close 條件與殘留風險。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
DONE

本工單的 release readiness audit 已完成。結論：Windows port 可標記為 source-complete / runtime-partial；不得標記 Windows public release ready。

### Release readiness summary
- Source：SOURCE-COMPLETE。T0002/T0003/T0004/T0006 已完成；T0005 release workflow source changes 已完成但 release runtime 驗證仍 partial。
- Build/Test：PASS（依 T0003/T0004/T0006/T0005 回報）。本工單未重跑 source tests，只做 closeout audit。
- Local Windows package：LOCAL PASS。存在本機 NSIS artifact：`src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/OpenUsage_0.6.24_x64-setup.exe`（5,253,878 bytes，2026-05-24 00:40:10）。
- Updater artifacts：BLOCKED/PARTIAL。T0005 的正常 updater artifact build 被 signing/tag release 條件阻擋；僅 `createUpdaterArtifacts=false` 的本機 NSIS build 通過。
- Public release：BLOCKED。`origin` repo `gowerlin/openusage` 目前 release list 為空；configured updater endpoint `robinebers/openusage` 最新 `v0.6.24` 只有 macOS assets/latest.json，無 Windows setup、無 Windows `.sig`，`latest.json` 無 Windows platform。

### Evidence table
| Area | Status | Evidence | Boundary |
|------|--------|----------|----------|
| Source | SOURCE-COMPLETE | T0002 DONE, T0003 DONE, T0004 DONE, T0006 DONE; T0005 workflow/config source changes present. Current branch `feat/windows-port-mvp`; HEAD `f415ddd chore: bump version to 0.6.24`. | Source readiness only; working tree remains dirty/uncommitted by workorder rule. |
| Tests | PASS from prior workorders | T0003: `bun run test` 1106 tests PASS; T0004 provider tests/build/check PASS; T0006 `bun run test --run` 1113 tests PASS. | Evidence inherited from T0003-T0006; T0007 did not rerun full tests. |
| Windows package | LOCAL PASS | Local artifact `OpenUsage_0.6.24_x64-setup.exe` exists under `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/`. T0005 PASS only with `createUpdaterArtifacts=false`. | Local package only; not signed public release proof. |
| Updater artifacts | BLOCKED/PARTIAL | `robinebers/openusage` latest `v0.6.24` has `latest.json` and macOS `.sig` assets only. Downloaded `latest.json` platforms: `darwin-x86_64`, `darwin-x86_64-app`, `darwin-aarch64`, `darwin-aarch64-app`; no Windows platform. | Needs real tag release with `TAURI_SIGNING_PRIVATE_KEY` / password and Windows matrix upload. |
| Public release | BLOCKED | `gowerlin/openusage` public release list is empty; `gowerlin/openusage/releases/latest/download/latest.json` returns 404. | No public Windows release claim allowed. |

### Closeout decision options
- [A] Close PLAN-001 as `source-complete / runtime-partial`, explicitly recording that Windows public release remains blocked by signed updater artifacts and release upload verification.
- [B] Keep PLAN-001 `IN_PROGRESS` until a real `v0.6.24` or newer tag release is executed on GitHub and Windows setup + `.sig` + `latest.json` Windows platform are verified.
- [C] Split follow-ups: T0008 for signed tag release verification; later separate tickets for provider parity / Windows Credential Manager / bundled sqlite if product scope requires true Windows feature parity.
- **推薦**：A + T0008. Reason: source/workflow/docs work is complete enough to close the porting implementation phase, but public-release readiness is not proven and must stay a separate release-gate task.

### 互動紀錄
無

### 遭遇問題
- `origin` is `https://github.com/gowerlin/openusage.git`, but no public releases exist there.
- `src-tauri/tauri.conf.json` updater endpoint points to `https://github.com/robinebers/openusage/releases/latest/download/latest.json`; that upstream latest release currently has no Windows platform entry.
- T0005 blocker remains: signed updater artifacts need GitHub secrets + tag release path. This session intentionally did not read secrets, push, tag, publish release, or commit.

### 建議下一步
需要 T0008：run/verify a real signed GitHub tag release without printing secrets.

T0008 acceptance should require:
- GitHub release contains Windows NSIS setup artifact.
- GitHub release contains Windows updater `.sig`.
- `latest.json` contains a Windows platform entry with a URL pointing to the Windows artifact.
- The checked endpoint matches the intended release repo (`gowerlin/openusage` vs `robinebers/openusage`) before public readiness is claimed.

### sprint-status.yaml 已更新
不適用（repo root / `_bmad-output/` / `docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T01:06:12+08:00
