---
schema_version: 1
schema_kind: workorder
id: T0009
title: Fork release flow for Windows artifacts
status: DONE
type: execution
intervention_type: decision-requiring
created_at: "2026-05-24 01:24:49 +08:00"
started_at: "2026-05-24T02:32:08+08:00"
completed_at: "2026-05-24T03:02:03+08:00"
updated_at: "2026-05-24T03:02:03+08:00"
renewed_at: "2026-05-24 02:27:55 +08:00"
commit: "4c7429afcb696e59c8df2cf31124ddcb94e4ba94"
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
- **狀態**：DONE
- **建立時間**：2026-05-24 01:24:49 (UTC+8)
- **開始時間**：2026-05-24T02:32:08+08:00
- **完成時間**：2026-05-24T03:02:03+08:00
- **Commit**：4c7429afcb696e59c8df2cf31124ddcb94e4ba94
- **目標子專案**：release / GitHub Actions
- **關聯 PLAN**：PLAN-001
- **基於工單**：T0008
- **intervention_type**：decision-requiring
- **Renew 次數**：3
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

## 塔台補充（Renew #3）

**時間**：2026-05-24 02:27:55 (UTC+8)

**補充內容**：
> 使用者要求產生新的 Tauri updater key pair，並同步更新 `src-tauri/tauri.conf.json` 的 updater `pubkey`。Renew #2 已確認 `v0.6.24` tag 在 `5237715`，但 GitHub Actions run `26339904804` 因 updater signing secret/password 或 key 格式失敗，且尚未建立 release。

**新指示**：
> 產生新的 Tauri updater key pair，不得印出 private key 或 password。private key 備份需放在 repo 外，例如 `%USERPROFILE%\\.tauri\\openusage-updater-v0.6.24.key`；若使用 password，也只能用安全管道寫入 GitHub secret，不得寫進 repo 或 log。將新的 public key 寫入 `src-tauri/tauri.conf.json` 的 updater `pubkey`，並用新的 private key/password 更新 `gowerlin/openusage` 的 `TAURI_SIGNING_PRIVATE_KEY` 與 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。先用本機 build/signing 驗證新 key 可用，再 commit/push branch。因 `tauri.conf.json` 會產生新 commit，本 Renew 授權在確認沒有 release 存在、且 remote tag 仍指向 `5237715` 或前次失敗 release commit 時，將 `v0.6.24` force-update 到新的 pubkey commit 後重跑 publish workflow。若已存在 GitHub Release、tag 指到未知 commit、secret 設定失敗、或 signing 仍失敗，停止並回報 BLOCKED/PARTIAL。

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
DONE

### Preflight
- Branch：`feat/windows-port-mvp`
- Renew #3 start local HEAD：`15b274c` (`chore(ct): close T0009 release rerun`)
- Remote branch before push：`refs/heads/feat/windows-port-mvp` = `52377158d554da4fead19197b42441b19289aa4f`
- Remote：`origin=https://github.com/gowerlin/openusage.git`
- Intended release repo：`gowerlin/openusage`
- Version/tag：`package.json=0.6.24`, `src-tauri/tauri.conf.json=0.6.24`, `src-tauri/Cargo.toml=0.6.24`, target tag `v0.6.24`
- Existing release before Renew #3 rerun：`gh release view v0.6.24 --repo gowerlin/openusage` returned `release not found`.
- Remote tag before Renew #3 update：`refs/tags/v0.6.24^{}` = `52377158d554da4fead19197b42441b19289aa4f`.
- Secrets metadata：`total_count=2`, names present: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Secret values were not printed.
- Workflow scope：Windows-only matrix, `windows-latest`, `x86_64-pc-windows-msvc --bundles nsis`; action ref `tauri-apps/tauri-action@v0.6.2`.
- Updater endpoint：`https://github.com/gowerlin/openusage/releases/latest/download/latest.json`.
- Working tree boundary：existing untracked `_ct-workorders/*` and `t0006-settings-shortcut-windows.png` were left untouched and not included in release tag.

### Key rotation
- Final private key path：`C:\Users\Gower\.tauri\openusage-updater-v0.6.24.key`
- Final public key path：`C:\Users\Gower\.tauri\openusage-updater-v0.6.24.key.pub`
- Superseded key backups from final rotation：
  - `C:\Users\Gower\.tauri\openusage-updater-v0.6.24.key.bak-20260524-024718`
  - `C:\Users\Gower\.tauri\openusage-updater-v0.6.24.key.pub.bak-20260524-024718`
- Final active key uses a generated password. The final active private key/password were not printed and were written to GitHub Actions secrets through `gh secret set`.
- `src-tauri/tauri.conf.json` updater `pubkey` was updated to the final public key.
- Source commit：`4c7429afcb696e59c8df2cf31124ddcb94e4ba94` (`fix(release): rotate updater key`).

### Local validation
- PASS：`ruby -e "require 'yaml'; YAML.load_file('.github/workflows/publish.yml'); puts 'publish.yml ok'"`
- PASS：`node -e "JSON.parse(... tauri.conf.json ...); JSON.parse(... package.json ...); console.log('json ok')"`
- PASS：`bun run build`
- PASS：`bun run test --run`
  - 61 test files passed.
  - 1113 tests passed.
  - Existing Tauri store mock stderr appeared; exit code remained 0.
- PASS：`bun run bundle:plugins`
  - Bundled 18 plugins.
- PASS：VS dev env cargo check with `LIBCLANG_PATH`
  - `cargo check --manifest-path src-tauri/Cargo.toml`
- PASS：local Tauri signing build with final key/password
  - `bun tauri build --target x86_64-pc-windows-msvc --bundles nsis`
  - Produced `OpenUsage_0.6.24_x64-setup.exe` (5,255,502 bytes locally).
  - Produced `OpenUsage_0.6.24_x64-setup.exe.sig` (420 bytes locally).

### Release actions
- Branch push：`git push origin feat/windows-port-mvp` succeeded (`5237715..4c7429a`).
- Local tag update：`git tag -f -a v0.6.24 4c7429afcb696e59c8df2cf31124ddcb94e4ba94 -m "v0.6.24"`.
- Push tag：`git push --force origin refs/tags/v0.6.24` succeeded.
- Tag refs after push：
  - tag object：`7449ac270404399f6fe1067d72d722778f175c9e`
  - dereferenced commit：`4c7429afcb696e59c8df2cf31124ddcb94e4ba94`
- GitHub Actions run：`26340728709`
  - URL：`https://github.com/gowerlin/openusage/actions/runs/26340728709`
  - Status：`completed`
  - Conclusion：`success`
  - headBranch：`v0.6.24`
  - headSha：`4c7429afcb696e59c8df2cf31124ddcb94e4ba94`
- Successful run steps included checkout, Rust toolchain, cache, MSVC dev cmd, Bun install, plugin bundle, bundled plugin verification, Windows build env, release tag/version validation, `tauri-apps/tauri-action@v0.6.2`, and updater asset verification.

### Release verification
| Check | Status | Evidence |
|-------|--------|----------|
| GitHub release exists | PASS | `https://github.com/gowerlin/openusage/releases/tag/v0.6.24`, draft=false, prerelease=false. |
| Workflow success | PASS | Run `26340728709` conclusion `success`. |
| Remote tag points to intended commit | PASS | `refs/tags/v0.6.24^{}` = `4c7429afcb696e59c8df2cf31124ddcb94e4ba94`. |
| Windows setup asset | PASS | `OpenUsage_0.6.24_x64-setup.exe`, size 5,240,010, sha256 `e4752ac8c3a89f35ce62ddf084715bef9e9e138290c395002f660e92f7bb4949`. |
| Windows .sig | PASS | `OpenUsage_0.6.24_x64-setup.exe.sig`, size 420, sha256 `076212101885013b0f9a223ee5e831dad6cee77a93e6048b5402f34eee30ab9e`. |
| latest.json | PASS | `latest.json`, size 1,276, sha256 `00b77c103a28f75cadd4283637f8a4bfe7af4f84b909a49460d602c959e6b03e`. |
| latest.json Windows entries | PASS | Platforms: `windows-x86_64`, `windows-x86_64-nsis`; both have signature length 420. |
| Artifact URLs target repo | PASS | latest.json URLs point to `https://github.com/gowerlin/openusage/releases/download/v0.6.24/OpenUsage_0.6.24_x64-setup.exe`. |

### 遭遇問題
- The standalone `tauri signer sign` CLI hung in non-interactive mode when used as a smoke test; it was not used as release proof.
- A no-password key path still failed local `tauri build` signing with `incorrect updater private key password: Wrong password for that key`; final fix used a password-protected key generated and consumed in one secure flow.
- An intermediate diagnostic key was superseded before the successful local build, GitHub secret update, tag update, and release run. The active release key is the final key generated after that diagnostic step.
- GitHub Actions emitted non-blocking warnings:
  - Node.js 20 action deprecation for `actions/checkout@v4` and `ilammy/msvc-dev-cmd@v1`.
  - `tauri-action@v0.6.2` warns `uploadUpdaterJson` is unexpected and `includeUpdaterJson` is the supported input name; the run still succeeded and verified updater assets.

### 互動紀錄
無

### Renew 歷程
- Renew #1（01:51）：secrets metadata existed and workflow was Windows-only. Worker executed release flow, pushed branch/tag, Actions failed on invalid `tauri-action@v1`; source fixed to `@v0.6.2`, but tag rerun needed explicit retag/version decision.
- Renew #2（02:08）：user authorized force-update of `v0.6.24` from `3a94c9e` to `5237715`. Worker confirmed tag/branch state, force-updated tag, pushed it, waited for Actions run `26339904804`, and stopped after updater signing failed.
- Renew #3（02:32）：generated final Tauri updater key pair, updated GitHub secrets and `tauri.conf.json` pubkey, verified local signing build, committed `4c7429a`, pushed branch/tag, waited for Actions run `26340728709`, and verified Windows release artifacts plus `latest.json`.

### PLAN-001 closeout recommendation
- PLAN-001 can close as DONE / Windows public release ready for `gowerlin/openusage` `v0.6.24`.
- Optional follow-up：replace `tauri-action` input `uploadUpdaterJson` with `includeUpdaterJson` to remove the non-blocking workflow warning.

### sprint-status.yaml 已更新
不適用（repo root、`_bmad-output/`、`docs/` 未找到 `sprint-status.yaml`）

### 回報時間
2026-05-24T03:02:03+08:00
