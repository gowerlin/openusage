---
schema_version: 1
schema_kind: workorder
id: T0063
title: Bump version and publish GitHub release v0.6.31
status: PENDING
priority: High
type: release
bug_id: null
plan_id: PLAN-006
created_at: "2026-10-15T16:29:08+08:00"
updated_at: "2026-10-15T16:47:34+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0062
  - T0064
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0063 Bump version and publish GitHub release v0.6.31

## 背景

PLAN-006 最後一步。流程同 T0054。

## 授權範圍（D093：沿用使用者「修完再發」）

- ✅ 版號 `0.6.30` → `0.6.31` 並 commit 到 `main`；`git push origin main`；建立並 push **單一** tag `v0.6.31`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`；不得 force-push、移動 / 刪除既有 tag 或 release

## 前置條件（不符即 BLOCKED）

- T0055–T0061、T0065 `DONE`；T0062 `DONE`（smoke 全 PASS）；**T0064 `DONE`（pre-release CI 驗證通過）**。`git status` 乾淨；main 只 ahead；`v0.6.31` tag 不存在。

## 任務指令

1. 版號四檔 → `0.6.31`。README plugin 清單確認。
2. Push 前隱私掃描（D081，同 T0054 步驟 2）。
3. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build`。
4. Commit `chore: bump version to 0.6.31`；`git push origin main`；`git tag -a v0.6.31 -m v0.6.31 <bump>`；`git push origin v0.6.31`。
5. `gh run watch -R gowerlin/openusage <id>`；**確認無 Node 20 deprecated annotation**（T0056）；若 workflow 因 T0056 的 action 升級失敗 → 回報 BLOCKED，不自行改 workflow、不重推 tag。
6. 驗證 release（`-R gowerlin/openusage`）：非 draft / 非 pre、3 assets、`latest.json` 0.6.31 指向 fork、Latest、fork tag 只多 v0.6.31。
7. 發行重點說明（繁中，格式同 v0.6.30）：BUG-016、上游 v0.7.x 移植項（逐項，附上游來源）、README / CI。`gh release edit` + API 確認 body。

## 驗證 Gate

- PASS：Publish run 成功且無 Node 20 annotation；release / assets / `latest.json` / Latest；fork 無非預期 tag；release body = API body

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 控制滑鼠前先詢問使用者並在回報區留互動紀錄；不覆蓋剪貼簿。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。
- `gh` 一律加 `-R`。上游 Swift 版用 `git show upstream/main:<path>` 讀，**不得** checkout / merge `upstream/main`（無共同祖先）。

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

（Worker 填寫：狀態、commit、改動、上游引用、驗證證據、偏差）
