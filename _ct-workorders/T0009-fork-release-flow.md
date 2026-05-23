---
schema_version: 1
schema_kind: workorder
id: T0009
title: Fork release flow for Windows artifacts
status: BLOCKED
type: execution
intervention_type: decision-requiring
created_at: "2026-05-24 01:24:49 +08:00"
started_at: "2026-05-24T02:08:21+08:00"
completed_at: "2026-05-24T02:21:33+08:00"
updated_at: "2026-05-24T02:21:33+08:00"
renewed_at: "2026-05-24 02:04:12 +08:00"
commit: "52377158d554da4fead19197b42441b19289aa4f"
plan_id: PLAN-001
sizing: medium
affects_files:
  - ".github/workflows/*"
  - "src-tauri/tauri.conf.json"
  - "_ct-workorders/*"
depends_on:
  - T0008
---

# T0009 Fork Release Flow For Windows Artifacts

## 元資料
- **工單編號**：T0009
- **任務名稱**：Fork release flow for Windows artifacts
- **狀態**：BLOCKED
- **建立時間**：2026-05-24 01:24:49 (UTC+8)
- **開始時間**：2026-05-24T02:08:21+08:00
- **完成時間**：2026-05-24T02:21:33+08:00
- **Commit**：52377158d554da4fead19197b42441b19289aa4f
- **目標子專案**：release / GitHub Actions
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0008
- **intervention_type**：decision-requiring
- **Renew 次數**：2
- **affects_files**：
  - `.github/workflows/*`
  - `src-tauri/tauri.conf.json`
  - `_ct-workorders/*`

## 使用者授權

使用者在塔台選擇 **C**：

> 允許完整 release flow：push workflow、create/push tag、等 Actions、驗證 Windows artifacts。

此授權只適用於本工單，且受下列限制約束。

## 工作量預估
- **預估規模**：中
- **Context Window 風險**：中
- **降級策略**：若 secrets、repo setting、workflow 權限、default branch 狀態不滿足，停止 release action 並回報 BLOCKED/PARTIAL；不得強行發布不完整 release。

## Session 建議
- **建議類型**：🆕 新 Session
- **原因**：此工單允許遠端 push/tag/release flow，必須獨立執行並留下清楚證據。

## 規格層級自問

- [x] **目標層**：執行 + 驗證。目標是讓 `gowerlin/openusage` fork 產生可驗證 Windows release artifacts。
- [x] **決策權歸屬**：使用者已授權 C；Worker 可 push workflow、create/push tag、等待 Actions、驗證 artifacts。
- [x] **資訊完整度**：T0008 已確認 release repo 與缺口。
- [x] **回頭成本**：高。遠端 tag/release 會產生持久狀態；需先做 preflight。
- [x] **記憶覆蓋**：本工單覆蓋前序「不可 push/tag/release」限制，但只限本工單授權範圍。不得讀取或輸出 secret value。

## 任務指令

### 前置條件
需載入：
- `_ct-workorders/T0008-signed-release-verification.md`
- `_ct-workorders/T0007-release-verification-closeout.md`
- `_ct-workorders/T0005-windows-packaging-release-workflow.md`
- `AGENTS.md`
- `.github/workflows/publish.yml`
- `src-tauri/tauri.conf.json`
- `package.json`

### Release target

- Intended repo：`gowerlin/openusage`
- Remote：`origin`
- Expected current work branch：`feat/windows-port-mvp`
- Expected version/tag：derive from repo version; T0008 evidence suggests `v0.6.24`. Do not hardcode if repo version differs.

### Required preflight

1. Confirm current branch and dirty files.
2. Confirm `origin` is `gowerlin/openusage`.
3. Confirm intended release repo is `gowerlin/openusage`.
4. Confirm local workflow changes are present.
5. Confirm Actions secrets metadata exists, without printing values:
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
6. If macOS jobs remain in the workflow, confirm required Apple/macOS secrets exist or revise workflow to Windows-only for this release.
7. Confirm `src-tauri/tauri.conf.json` updater endpoint target is intentional:
   - If app should update from fork releases, update endpoint to `gowerlin/openusage`.
   - If upstream endpoint remains `robinebers/openusage`, clearly mark fork release as not used by app updater.
8. Run local validation before push:
   - relevant YAML/JSON parse checks
   - `bun run build`
   - `bun run test`
   - `bun run bundle:plugins`
   - cargo check using VS dev env + `LIBCLANG_PATH`

### Authorized operations

Allowed only after preflight passes:

- Create commit(s) for Windows port work if needed.
- Push branch to `gowerlin/openusage`.
- Put workflow on the branch/default branch path needed by GitHub Actions.
- Create annotated or lightweight tag for current repo version.
- Push tag.
- Wait for GitHub Actions publish workflow.
- Inspect GitHub release assets and `latest.json`.

### Stop conditions

Stop and report BLOCKED/PARTIAL if any applies:

- Required GitHub Actions signing secrets are missing.
- Workflow is not available on the branch/tag path needed by GitHub Actions.
- Release action requires Apple/macOS secrets that are missing and scope decision is needed.
- Tag already exists remotely and points to a different commit.
- Working tree contains unrelated changes that cannot be safely included.
- GitHub Actions fails for reasons outside this workorder.

### Verification requirements

To mark DONE, all must be true:

- GitHub release exists in `gowerlin/openusage`.
- Windows NSIS setup artifact exists.
- Windows updater `.sig` exists.
- `latest.json` has Windows platform entry.
- Artifact URLs in `latest.json` point to intended repo/release.
- Workflow result is successful.

## 塔台補充（Renew #1）

**時間**：2026-05-24 01:45:08 (UTC+8)

**補充內容**：
> 使用者已在 `gowerlin/openusage` 設定 `TAURI_SIGNING_PRIVATE_KEY` 與 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。T0010 已完成 Windows-only release config，移除 macOS release path，並將 updater endpoint 改為 `https://github.com/gowerlin/openusage/releases/latest/download/latest.json`。

**新指示**：
> 重跑 T0009 preflight。若 secrets metadata 可確認存在，且 workflow 已是 Windows-only，允許依本工單授權執行 commit / push branch / create-push tag / wait Actions / verify artifacts。仍不得印出 secret value。若 secrets metadata 仍不可見或 tag/release/action 失敗，回報 BLOCKED/PARTIAL，附精準原因。

## 塔台補充（Renew #2）

**時間**：2026-05-24 02:04:12 (UTC+8)

**補充內容**：
> 使用者回覆 `1`，塔台解讀為 Option A：授權 force-update `v0.6.24`，將已推送但失敗的 tag 從 `3a94c9e` 移到 branch 修正 commit `5237715`，再重跑 publish verification。

**新指示**：
> 重新讀取工單與目前 repo state。先確認 remote tag `v0.6.24` 仍指向失敗 commit `3a94c9e`，且 branch `feat/windows-port-mvp` 的 release workflow fix commit 是 `5237715`（或其完整 SHA）。本 Renew 明確授權只針對 `v0.6.24` 做 force-update / delete-recreate tag 到 `5237715`，然後推送 tag、等待 GitHub Actions publish workflow，並驗證 Windows NSIS setup、`.sig`、`latest.json` Windows platform entry、artifact URLs 是否指向 `gowerlin/openusage`。若 tag 狀態不符合上述已知情境，或 Actions/release artifact 驗證失敗，停止並回報 PARTIAL/BLOCKED；不要改版本號，不要印出 secret value。

### Forbidden

- Do not print secret values.
- Do not bypass signing by disabling updater artifacts unless explicitly returning PARTIAL.
- Do not claim Windows public release ready without release asset + `.sig` + `latest.json` Windows entry.
- Do not modify provider parity / docs polish outside release-needed config.

## 預期產出

- Branch/tag/release action evidence.
- GitHub Actions run URL/status.
- Release asset list.
- Parsed `latest.json` platform list.
- Final closeout recommendation for PLAN-001.

## 驗收條件

- [ ] Preflight recorded.
- [ ] If release executed, Actions run status recorded.
- [ ] Windows setup asset verified.
- [ ] Windows `.sig` verified.
- [ ] `latest.json` Windows platform entry verified.
- [ ] PLAN-001 closeout recommendation provided.

---

## 回報區

> 以下由 sub-session 填寫，請勿在塔台 session 中編輯

### 完成狀態
BLOCKED

### Preflight
- Branch：`feat/windows-port-mvp`
- Start HEAD：`52377158d554da4fead19197b42441b19289aa4f`
- Branch HEAD：`52377158d554da4fead19197b42441b19289aa4f` (`fix(release): pin tauri action version`)
- Remote：`origin=https://github.com/gowerlin/openusage.git`
- Intended release repo：`gowerlin/openusage`
- Version/tag：`package.json=0.6.24`, `src-tauri/tauri.conf.json=0.6.24`, `src-tauri/Cargo.toml=0.6.24`, target tag `v0.6.24`
- Renew #2 preflight remote tag before update：
  - tag object：`3eacd8a9d8d5640f55838ef9c72a36b4000d2279`
  - dereferenced commit：`3a94c9ebcf3df917a4631d54819cd45216a95796`
- Branch fix commit preflight：`git ls-remote origin refs/heads/feat/windows-port-mvp` returned `52377158d554da4fead19197b42441b19289aa4f`.
- Existing release before rerun：`gh release view v0.6.24 --repo gowerlin/openusage` returned `release not found`.
- Secrets metadata：`gh api repos/gowerlin/openusage/actions/secrets --jq "{total_count, names: [.secrets[].name]}"` returned `total_count=2` with required names present: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Secret values were not read or printed.
- Workflow scope：Windows-only matrix, `windows-latest`, `x86_64-pc-windows-msvc --bundles nsis`; action ref is `tauri-apps/tauri-action@v0.6.2`.
- Updater endpoint：`https://github.com/gowerlin/openusage/releases/latest/download/latest.json`.
- Working tree before remote operation：`_ct-workorders/` and `t0006-settings-shortcut-windows.png` were untracked. They were not included in tag `v0.6.24`.

### Release actions
- Renew #2 authorization used：force-update only `v0.6.24` from failed commit `3a94c9e` to branch fix commit `5237715`.
- Local tag update：`git tag -f -a v0.6.24 52377158d554da4fead19197b42441b19289aa4f -m "v0.6.24"`.
- Push tag：`git push --force origin refs/tags/v0.6.24` succeeded.
- Tag refs after push：
  - tag object：`a56b1c95329f1d149ba0169c6e8d94afde34e55a`
  - dereferenced commit：`52377158d554da4fead19197b42441b19289aa4f`
- GitHub Actions run：`26339904804` / `https://github.com/gowerlin/openusage/actions/runs/26339904804`
- Actions result：FAILED in `Run tauri-apps/tauri-action@v0.6.2`.
- Successful run steps before failure：
  - `actions/checkout@v4`
  - `dtolnay/rust-toolchain@stable`
  - `swatinem/rust-cache@v2`
  - `ilammy/msvc-dev-cmd@v1`
  - `oven-sh/setup-bun@v2`
  - `bun install`
  - `bun run bundle:plugins`
  - bundled plugin verification
  - Windows build environment setup
  - release tag validation
  - app version/tag match validation
- Build evidence before failure：Tauri release build finished and NSIS produced `OpenUsage_0.6.24_x64-setup.exe` inside the runner.
- Failure root cause：updater signing failed with `failed to decode secret key: incorrect updater private key password: Missing comment in secret key`.
- No secret values were read or printed.
- No source change, version bump, second tag move, or rerun was performed after this failure.

### Verification
| Check | Status | Evidence |
|-------|--------|----------|
| Remote tag points to intended commit | PASS | `refs/tags/v0.6.24^{}` now resolves to `52377158d554da4fead19197b42441b19289aa4f`. |
| Workflow started from corrected tag | PASS | Run `26339904804` has `headBranch=v0.6.24`, `headSha=52377158d554da4fead19197b42441b19289aa4f`. |
| Workflow success | FAILED | Run `26339904804` failed in `tauri-apps/tauri-action@v0.6.2`. |
| Windows setup asset | NOT VERIFIED | Runner produced `OpenUsage_0.6.24_x64-setup.exe`, but action failed before release upload. `gh release view v0.6.24 --repo gowerlin/openusage` returned `release not found`. |
| Windows .sig | FAILED | Updater signing failed before `.sig` upload: `failed to decode secret key: incorrect updater private key password: Missing comment in secret key`. |
| latest.json Windows entry | FAILED | No release exists; `https://github.com/gowerlin/openusage/releases/latest/download/latest.json` returned `404`. |
| Artifact URLs target repo | FAILED | No `latest.json` exists for this fork release. |

### 遭遇問題
- Release is blocked by Actions secret content, not by workflow source or tag position.
- Metadata confirms both required secret names exist, but actual signing failed with `incorrect updater private key password: Missing comment in secret key`.
- This likely means `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` do not match, or the private key value format is invalid for Tauri/minisign.
- Worker cannot inspect or repair secret values without violating the no-secret rule.
- No GitHub Release was created; no Windows `.sig` or `latest.json` exists for `gowerlin/openusage`.
- `_ct-workorders/` and `t0006-settings-shortcut-windows.png` remain untracked local files outside the release tag.

### 互動紀錄
無

### Renew 歷程
- Renew #1（01:51）：secrets metadata now exists and workflow is Windows-only. Worker executed release flow, pushed branch/tag, Actions failed on invalid `tauri-action@v1`; source fixed to `@v0.6.2`, but tag rerun needs explicit retag/version decision.
- Renew #2（02:08）：user authorized force-update of `v0.6.24` from `3a94c9e` to `5237715`. Worker confirmed tag/branch state, force-updated tag, pushed it, waited for Actions run `26339904804`, and stopped after updater signing failed.

### 建議下一步
- Keep PLAN-001 open; do not claim Windows public release ready.
- Required manual fix：recreate or correct `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in `gowerlin/openusage` Actions secrets so the private key format/password match.
- After secrets are fixed, rerun GitHub Actions run `26339904804` or dispatch a new run from tag `v0.6.24`; the remote tag already points to corrected commit `5237715`, so no version bump or tag move is needed unless maintainer chooses a clean new version.
- After rerun succeeds, verify release assets: Windows NSIS setup, Windows `.sig`, `latest.json` Windows platform entry, and artifact URLs pointing to `gowerlin/openusage`.

### sprint-status.yaml 已更新
不適用（repo root、`_bmad-output/`、`docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T02:21:33+08:00
