---
schema_version: 1
schema_kind: workorder
id: T0008
title: Signed Windows release verification
status: DONE
type: research
interaction_mode: enabled
intervention_type: decision-requiring
renew_count: 0
created_at: "2026-05-24 01:10:48 +08:00"
started_at: "2026-05-24T01:13:39+08:00"
completed_at: "2026-05-24T01:21:33+08:00"
updated_at: "2026-05-24T09:08:40+08:00"
plan_id: PLAN-001
sizing: small
affects_files:
  - "_ct-workorders/T0008-signed-release-verification.md"
depends_on:
  - T0007
---

# T0008 Signed Windows Release Verification

## 元資料
- **工單編號**：T0008
- **任務名稱**：Signed Windows release verification
- **狀態**：DONE
- **類型**：research
- **互動模式**：enabled
- **Renew 次數**：0
- **建立時間**：2026-05-24 01:10:48 (UTC+8)
- **開始時間**：2026-05-24T01:13:39+08:00
- **完成時間**：2026-05-24T01:21:33+08:00
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0005, T0007
- **intervention_type**：decision-requiring
- **affects_files**：
  - `_ct-workorders/T0008-signed-release-verification.md`

## 工作量預估
- **預估規模**：小
- **Context Window 風險**：低
- **降級策略**：若沒有 GitHub release/tag/secrets 可驗證，回報 BLOCKED 或 PARTIAL，列出精準人工前置，不得宣稱 release ready。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：此工單是 release gate，可能需要與使用者確認是否已配置 secrets / 是否允許 tag release；需隔離塔台 context。

## 規格層級自問

- [x] **目標層**：研究 / 驗證。目標是驗證 signed Windows public release，不是新增功能。
- [x] **決策權歸屬**：Worker 不可自行 push/tag/publish；任何 release action 都必須先得到使用者明確同意。
- [x] **資訊完整度**：T0007 已整理 source/package/public release 邊界。
- [x] **回頭成本**：中。release action 可能產生遠端狀態；預設只讀驗證。
- [x] **記憶覆蓋**：不得讀取或輸出 secret value；只可檢查是否配置或要求使用者自行確認。

## 研究目標

完成 Windows public release readiness gate：
- 確認 intended release repo 是 `gowerlin/openusage` 還是 `robinebers/openusage`。
- 確認 signed tag release 是否已存在。
- 驗證 Windows NSIS setup artifact、`.sig`、`latest.json` Windows platform entry。
- 若尚未可驗證，產出 blocker checklist。

## 已知資訊

- T0007 結論：source-complete / local package PASS / public release BLOCKED。
- `gowerlin/openusage` public release list 為空。
- `robinebers/openusage` latest `v0.6.24` 只有 macOS assets/latest.json，無 Windows platform。
- T0005 已建立 Windows workflow source path，但 updater `.sig/latest.json` 需要 signing secrets + tag release 驗證。

## 互動規則

Worker 可問使用者最多 3 題，建議優先問：
1. Intended release repo 是哪一個？
2. GitHub secrets 是否已配置？
3. 是否只做 read-only verification，或使用者已自行觸發 tag release 後要 Worker 驗證？

每題需提供選項 + 「其他：________」。

## 禁止事項

- 不 push。
- 不 create tag。
- 不 publish release。
- 不 commit。
- 不讀取或輸出 secret value。
- 未有實際 Windows artifact / `.sig` / `latest.json` Windows entry 時，不得宣稱 Windows public release ready。

## 驗收條件

- [ ] Intended release repo 已確認。
- [ ] Windows setup artifact 是否存在已確認。
- [ ] Windows `.sig` 是否存在已確認。
- [ ] `latest.json` 是否有 Windows platform entry 已確認。
- [ ] 若無法完成，列出 BLOCKED/PARTIAL 的精準原因。

## 塔台收斂註記

**時間**：2026-05-24 09:08:40 (UTC+8)
**狀態調整**：BLOCKED → DONE
**理由**：本工單當時的 BLOCKED 條件已由後續 T0009 release flow 解除；`gowerlin/openusage` `v0.6.24` release 已驗證 Windows NSIS setup、`.sig`、`latest.json` Windows platform entries 與 artifact URLs。原回報區保留當時 fork release path 尚未建立的 BLOCKED 證據。

---

## 回報區

> 以下由 sub-session 填寫，請勿在指揮塔 session 中編輯

### 完成狀態
BLOCKED

Signed Windows public release 尚未 ready。Intended release repo 已由使用者確認為 fork repo `gowerlin/openusage`，但該 repo 目前沒有 release/tag、沒有 Actions signing secrets、default branch 上沒有可由 GitHub API 看到的 `publish.yml` workflow；因此 Windows setup / `.sig` / `latest.json` Windows platform entry 都不存在。

### Release verification summary
- Intended release repo：`gowerlin/openusage`（使用者決策：A）。
- Public release readiness：BLOCKED。
- `gowerlin/openusage` release list 為空；`gh release view v0.6.24 --repo gowerlin/openusage` 回傳 `release not found`；`git ls-remote --tags origin 'v0.6.24*'` 無結果。
- `https://github.com/gowerlin/openusage/releases/latest/download/latest.json` 回傳 404。
- `gh api repos/gowerlin/openusage/actions/secrets` 顯示 `total_count: 0`，尚未設定 `TAURI_SIGNING_PRIVATE_KEY` / `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
- `gh run list --repo gowerlin/openusage --workflow publish.yml` 回傳 workflow not found on default branch；本機 feature branch 有 `.github/workflows/publish.yml`，但尚未進入 fork default branch。
- Upstream `robinebers/openusage` latest `v0.6.24` 僅有 macOS assets；`latest.json` platforms 只有 `darwin-aarch64`, `darwin-aarch64-app`, `darwin-x86_64`, `darwin-x86_64-app`。

### Evidence table
| Check | Status | Evidence | Boundary |
|-------|--------|----------|----------|
| Release repo | CONFIRMED / BLOCKED | 使用者回覆 A：在 fork repo `gowerlin/openusage` 建立 release action 及必要設定；`origin` is `https://github.com/gowerlin/openusage.git`; `gh repo view gowerlin/openusage` shows `viewerPermission: ADMIN`. | Repo 已確認；release path 尚未 setup 完成。 |
| Windows setup | ABSENT | `gowerlin/openusage` releases API length = 0；`gh release view v0.6.24 --repo gowerlin/openusage` = `release not found`。 | 無 public Windows setup asset 可驗證。 |
| Windows .sig | ABSENT | `gowerlin/openusage` 無 release；upstream latest assets only include macOS `.app.tar.gz.sig`。 | 無 Windows updater `.sig` 可驗證。 |
| latest.json Windows entry | ABSENT | `gowerlin/openusage/releases/latest/download/latest.json` = 404；upstream latest `latest.json` platforms only darwin variants. | 無 Windows platform entry；不可宣稱 updater ready。 |
| Signing secrets | MISSING | `gh api repos/gowerlin/openusage/actions/secrets` returned `total_count: 0`; `gh secret list --repo gowerlin/openusage --app actions --json name,updatedAt` returned `[]`. | 未讀取 secret value；只驗證 secret names/metadata。 |

### 互動紀錄
- [01:20] Q: Intended release repo 是 `gowerlin/openusage`、`robinebers/openusage` 或其他？ → A: A - 在 fork repo 建立 release action 及必要設定 → Action: 將 `gowerlin/openusage` 設為 release target；建立 action/settings 屬下一步，未在 T0008 內執行 push/tag/release/commit。

### 遭遇問題
- 使用者已選定 fork repo `gowerlin/openusage`，但目前 fork public release path 尚未建立完成。
- 本工單明列不 push、不 create tag、不 publish release、不 commit；因此未把本機 `.github/workflows/publish.yml` 推到 default branch，也未建立 GitHub release/tag。
- Actions secrets 尚未設定；Worker 也不得要求或輸出 secret value。
- `publish.yml` 現有 matrix 同時包含 macOS 與 Windows；若 fork repo 只要先做 Windows release，下一工單需決定要保留 macOS 簽章步驟或先切成 Windows-only release workflow，避免 Apple secrets 缺失阻擋 release。

### 建議下一步
Keep PLAN-001 blocked，開下一張 execution 工單處理 fork release setup：

1. 將 release workflow 放到 `gowerlin/openusage` default branch，或建立 Windows-only release workflow。
2. 在 `gowerlin/openusage` Actions secrets 設定 `TAURI_SIGNING_PRIVATE_KEY`、`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
3. 若保留 macOS matrix，還需設定 Apple signing/notarization secrets；若目標只是 Windows，先移除或拆分 macOS job。
4. 確認 `src-tauri/tauri.conf.json` updater endpoint 是否要由 `robinebers/openusage` 改為 `gowerlin/openusage`，否則 fork release 的 `latest.json` 不會被 app 使用。
5. 由使用者或下一工單明確授權後，push workflow、create/push `v*` tag、等待 GitHub Actions publish 完成。
6. 再開 verification 工單檢查 Windows setup asset、Windows `.sig`、`latest.json` Windows platform entry。

### sprint-status.yaml 已更新
不適用（repo root / `_bmad-output/` / `docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T01:21:33+08:00
