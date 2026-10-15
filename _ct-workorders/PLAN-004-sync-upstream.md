---
schema_version: 1
schema_kind: plan
id: PLAN-004
title: Sync upstream changes into fork
status: DONE
priority: High
plan_type: maintenance
created_at: "2026-10-15T12:10:18+08:00"
updated_at: "2026-10-15T15:13:34+08:00"
completed_at: "2026-10-15T15:13:34+08:00"
affects_files: []
depends_on: []
---

# PLAN-004 Sync Upstream Changes Into Fork

## 目標

使用者要求同步上游 `robinebers/openusage` 最新變更（使用者提及 `v0.7.14`）到 fork `gowerlin/openusage`；有衝突要先提示，不可直接合併。

## 塔台預查（2026-10-15，`git merge-tree` 唯讀，未動工作區）

| 上游線 | 狀態 | 與 fork `main` 關係 |
|---|---|---|
| `main` / `v0.7.14` | 2026-06-15 起重寫為 **native Swift（macOS only）** edition，新 root commit `53bc2f0` | **無共同祖先**，無法 merge；只能研究可手動移植的功能 |
| `tauri-legacy` / `v0.6.28` | Tauri 版凍結線（最後 `v0.6.28`，2026-06-25） | merge-base `f415ddd`（v0.6.24）；上游 +89 / fork +48 commit；試合併 **17 衝突** |

17 衝突：`package.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/tauri.conf.json`、`src-tauri/src/lib.rs`、`src-tauri/src/panel.rs`、`src-tauri/src/tray.rs`、`src-tauri/src/local_http_api/cache.rs`、`src/components/provider-card.tsx`、`src/components/skeleton-lines.tsx`、`src/pages/overview.tsx`、`src/hooks/app/use-settings-bootstrap.test.ts`，以及 modify/delete：`plugins/gemini/plugin.js`、`plugins/gemini/plugin.test.js`、`plugins/windsurf/plugin.js`、`plugins/windsurf/plugin.test.js`。

## 使用者決策（D067）

- 兩者都研究：`tauri-legacy` 做 merge 分析；`v0.7.x` 列出值得手動移植的功能清單。
- 上游 legacy「退休通知橫幅」（引導改用 macOS Swift 版）**不帶進 fork**。
- 實際合併前必須先把衝突與解法提示給使用者確認。

## 階段

1. T0037 研究（唯讀）：衝突逐檔解法、版號策略、橫幅排除方式、v0.7.x 移植候選。
2. 使用者確認衝突解法 → 建立實作工單（merge + 驗證）。
3. 發行（版號另經使用者確認）。

## 進度

- T0037：DONE（`ec2d6491`）。報告 `_report-T0037-upstream-sync.md`：推薦方案 A；使用者決定保留 Gemini、版號 `0.6.29`。
- 使用者核准方案 A（D071）：T0038 merge+i18n → T0039 Devin Windows → T0040 Windows smoke+NSIS → T0041 發行 `v0.6.29`；v0.7.x 移植延後。
- Tag 防護：`remote.upstream.tagOpt --no-tags`；本機上游專屬 tag 已刪（63 個）。
- 註：上方預查衝突清單漏列 `src/lib/settings.test.ts`，以報告 §2 為準。
- 2026-10-15：T0038–T0049 完成，`v0.6.29` 發行（Publish run `38695730149`，tag → `5a93b5a1`）。PLAN-004 核心目標（同步 tauri-legacy）完成 → DONE。v0.7.x 移植候選（T0037 報告 §7）待使用者逐項開新單（新 PLAN）。BUG-006–012 FIXED 待使用者安裝實測；BUG-013–015 排 v0.6.30。
