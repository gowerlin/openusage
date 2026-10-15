---
schema_version: 1
schema_kind: bug
id: BUG-012
title: Release build loads plugins from the working directory
status: OPEN
severity: Medium
created_at: "2026-10-15T14:07:49+08:00"
updated_at: "2026-10-15T14:07:49+08:00"
related_workorder: T0049
affects_files:
  - src-tauri/src/plugin_engine/mod.rs
depends_on: []
---

# BUG-012 Release Build Loads Plugins From The Working Directory

## 問題描述

T0046 Worker 觀察、塔台查證：`src-tauri/src/plugin_engine/mod.rs:14` 呼叫 `find_dev_plugins_dir()`（L51），只要 cwd 或 cwd 上一層有 `plugins/` 就改用該目錄載入 plugin JS，**沒有限定 debug build**。正式安裝版從任意含 `plugins/` 的目錄啟動（例如在 repo 內、或被放了惡意 `plugins/` 的資料夾）會：

- 載入該目錄的 plugin 程式碼（plugin 可經 host API 讀取 provider 憑證）→ 安全風險。
- 改寫使用者 `settings.json`（T0046 實際發生，例如出現 `mock` plugin）。

## 驗收條件

- [ ] Release build 永不從 cwd 載入 plugins；只用 bundled / AppData plugins。
- [ ] Dev（`bun tauri dev` / debug build）行為不變。
- [ ] 補測試。
- [ ] 使用者安裝新版後實測。

## 回報區

### 修復狀態
OPEN
