---
schema_version: 1
schema_kind: workorder
id: T0054
title: Bump version and publish GitHub release v0.6.30
status: PENDING
priority: Medium
type: release
bug_id: null
plan_id: PLAN-005
created_at: "2026-10-15T15:22:35+08:00"
updated_at: "2026-10-15T16:08:42+08:00"
started_at: null
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on:
  - T0053
affects_files:
  - package.json
  - src-tauri/Cargo.toml
  - src-tauri/Cargo.lock
  - src-tauri/tauri.conf.json
---

# T0054 Bump version and publish GitHub release v0.6.30

## 背景

PLAN-005 最後一步。流程同 T0041，但本單需要 bump 版號。

## 授權範圍（使用者 2026-10-15「處理 v0.6.30」，D085）

- ✅ 版號 `0.6.29` → `0.6.30` 並 commit 到 `main`
- ✅ `git push origin main`
- ✅ 建立並 push **單一** tag：`git push origin v0.6.30`
- ❌ 嚴禁 `git push --tags` / `--follow-tags` / `--mirror`（本機仍有舊上游 tag）
- ❌ 不得 force-push、移動 / 刪除既有 tag 或 release；需要時回報 BLOCKED

## 前置條件（不符即 BLOCKED）

- T0050、T0051、T0052 `DONE`；T0053 `DONE`（smoke 全 PASS）。
- `git status` 乾淨；`git fetch origin` 後 main 只 ahead；`git ls-remote --tags origin v0.6.30` 為空。

## 任務指令

1. 版號四檔 → `0.6.30`（`cargo update -p openusage --offline`）。README plugin 清單確認。
2. Push 前隱私掃描（D081，同 T0041 步驟 2）。
3. 驗證：`cargo fmt --check`、`cargo test --locked`、`bun run test --run`、`bun run build`。
4. Commit `chore: bump version to 0.6.30`（版本檔 + 本工單）。
5. `git push origin main`；`git tag -a v0.6.30 -m v0.6.30 <bump commit>`；`git push origin v0.6.30`。
6. 追蹤 `gh run watch -R gowerlin/openusage <id>`；驗證 release（`-R gowerlin/openusage`）：非 draft / 非 pre、3 assets、`latest.json` 0.6.30 指向 fork、Latest = v0.6.30、fork tag 只多 v0.6.30。
7. 發行重點說明（繁中，格式同 v0.6.29）：本版重點 = v0.6.29 已知問題修正（BUG-013 面板失焦收起更穩、BUG-014 詳細頁數值完整顯示、BUG-015 面板不超出工作區 / 位置記憶不被改寫）。`gh release edit v0.6.30 -R gowerlin/openusage --notes-file`，並以 GitHub API 確認 body。已知問題段可列 BUG-016（拖曳到偏下後面板暫時超出螢幕，下次顯示會修正）。

## 驗證 Gate

- PASS：Publish run 成功；release / assets / `latest.json` / Latest；fork 無非預期 tag；release body = API body

## 環境與限制

- 環境：VsDevCmd x64（`vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64`）+ `LIBCLANG_PATH=<VS>/VC/Tools/Llvm/x64/bin` + `CI=false`，PowerShell `cmd.exe /c`。
- 不改 registry；不覆蓋已安裝的 `%LOCALAPPDATA%/OpenUsage/openusage.exe`；不執行 installer。
- 若需停使用者的 OpenUsage：事後以**安裝目錄為 cwd** 重啟並還原 `settings.json`（SHA256 比對）。release exe 搬離 `target/release` 時連 `resources/` 一起帶。
- 需要控制滑鼠做實機測試時，先詢問使用者。不覆蓋剪貼簿（若必須，先備份再還原）。
- 截圖只截面板 region，背景塗掉；無 token / email / 帳號 ID（D081）。

## 收尾

- 收尾 commit 只在本機，不再 push（塔台處理）。

## 回報區

（Worker 填寫：狀態、commit、改動、驗證證據、偏差）
