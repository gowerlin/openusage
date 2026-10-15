---
schema_version: 1
schema_kind: workorder
id: T0034
title: Point in-app changelog to fork releases
status: IN_PROGRESS
priority: Medium
type: bugfix
bug_id: BUG-005
plan_id: null
created_at: "2026-10-15T11:48:01+08:00"
updated_at: "2026-10-15T11:48:51+08:00"
started_at: "2026-10-15T11:48:51+08:00"
completed_at: null
commit: null
agent: default
intervention_type: fire-and-forget
depends_on: []
affects_files:
  - src/hooks/use-changelog.ts
  - src/hooks/use-changelog.test.tsx
  - src/components/changelog-dialog.tsx
  - src/components/changelog-dialog.test.tsx
---

# T0034 Point In-App Changelog To Fork Releases

## 背景

BUG-005：App 內更新說明對話框讀的是上游 `robinebers/openusage` 的 releases。上游有同名 tag，所以 fork 使用者看到錯的說明。

## 已定決策（Worker 不得更改）

- 目標 repo：`gowerlin/openusage`。
- 只改 changelog 相關：`use-changelog.ts` 的 API URL，`changelog-dialog.tsx` 的 PR / commit / Releases 連結。
- 可抽成單一 repo 常數供兩檔共用；不新增 config / env / 設定 UI（AGENTS.md：不過度工程）。
- 不補 `latest.json` notes、不改 `publish.yml`（使用者已決定）。

## 任務指令

1. `src/hooks/use-changelog.ts:13` API URL 改 `gowerlin/openusage`。
2. `src/components/changelog-dialog.tsx` 中 `robinebers/openusage` 的 PR（約 L110）、commit（約 L132）、Releases（約 L261、L277）連結改 `gowerlin/openusage`。`@user` 連結（約 L121）是 GitHub 使用者連結，不改。
3. 更新 `use-changelog.test.tsx`、`changelog-dialog.test.tsx` 內的 URL 斷言；若現有測試沒有斷言 repo，補一條斷言 API URL 使用 `gowerlin/openusage`（regression test）。
4. 檢查 fork release body 中的 `#數字` / commit SHA 解析在新 repo 下連結正確（fork `v0.6.26` notes 使用 markdown 連結，非 `#PR`，確認顯示正常即可）。

## 明確排除

- `src/components/about-dialog.tsx:119` repo 連結、`src/components/side-nav.tsx:260` issues 連結：不改（範圍外，塔台另行決策）。
- `src-tauri/src/plugin_engine/host_api.rs` 測試 fixture 的 `robinebers`：不改。
- 不發版、不 tag、不 push。

## 驗證 Gate

- PASS：`bun run test --run src/hooks/use-changelog.test.tsx src/components/changelog-dialog.test.tsx`
- PASS：`bun run test --run`（全套）
- PASS：`bun run build`
- PASS：`grep -rn "robinebers" src/hooks/use-changelog.ts src/components/changelog-dialog.tsx` 無結果
- 可選：browser / dev 模式開 changelog dialog，確認載入 fork `v0.6.26` 說明（`api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.26` 有資料）
- `git diff --check` 無新 warning

Final gate：下次發行後使用者 App 內實測（使用者決定本次不發版）。

## 收尾

- Commit：只含本工單相關檔案 + 本工單回報區，message 以 `fix: point in-app changelog to fork releases (T0034)` 開頭。
- 不 push。

## 回報區

### 結果：DONE

- 開始：2026-10-15T11:48:51+08:00（Worker，`CT_MODE=yolo`）
- Commit：見 frontmatter `commit`（message `fix: point in-app changelog to fork releases (T0034)`），未 push。

### Landing check：WARN

- C-0：`repo` 欄位 absent → WARN（repo identity unavailable）；`basename(REPO_ROOT)` = `openusage`
- C-1：PASS（工單在 `D:/ForgejoGit/@GitHub_Clone/openusage` 下）
- C-3：PASS（4 個 `affects_files` 皆存在）
- C-2：無 `branch` 欄位；HEAD = `main`
- `BAT_WORKSPACE_ID` = `7512690c-d1fd-4101-a2f5-f98f6f44e9c8`（僅記錄）

### 改動

- `src/hooks/use-changelog.ts`：新增 `export const GITHUB_REPO = "gowerlin/openusage"`；API URL 改用它。
- `src/components/changelog-dialog.tsx`：import `GITHUB_REPO`；PR、commit、2 個 Releases 連結改用它。`@user` 連結未動。
- `src/hooks/use-changelog.test.tsx`：API URL / `html_url` 斷言改 `gowerlin/openusage`（既有 `toHaveBeenCalledWith` 斷言即 regression test，不另加）。
- `src/components/changelog-dialog.test.tsx`：URL 斷言改 `gowerlin/openusage`；`vi.mock("@/hooks/use-changelog")` 改用 `importOriginal` 保留真實 `GITHUB_REPO`，讓 PR / commit / Releases 斷言驗證的是實際常數。

### 驗證

| Gate | 結果 | 證據 |
|---|---|---|
| targeted tests | PASS | 2 files / 12 tests passed |
| `bun run test --run` | PASS | 64 files / 1139 tests passed |
| `bun run build` | PASS | exit 0；只有既有的 chunk > 500 kB 警告 |
| `grep -rn "robinebers"` 兩檔 | PASS | 無結果（exit 1） |
| `git diff --check` | PASS | 無 whitespace 警告（只有既有 LF→CRLF 提示） |
| 步驟 4 fork notes 解析 | PASS（原始碼 + API 檢查） | `api.github.com/repos/gowerlin/openusage/releases/tags/v0.6.26` 有資料；body 的 SHA 都在 `[sha](https://github.com/gowerlin/openusage/commit/...)` 內，`SimpleMarkdown` 先比對 markdown link，所以直接開 notes 給的 fork URL；body 沒有 `#數字` / `@user` |
| browser / dev 實測（可選） | 未跑 | 需 Tauri dev 環境；未執行 |
| Final gate | 待驗 | 下次發版後使用者 App 內實測 |

### 偏差 / 阻塞

- 無阻塞。
- 小偏差：dialog 測試的 module mock 改成 `importOriginal`（不改的話 mock 缺 `GITHUB_REPO`）。仍在 `affects_files` 範圍內。
- 排除項（`about-dialog.tsx`、`side-nav.tsx`、`host_api.rs`）未動。
