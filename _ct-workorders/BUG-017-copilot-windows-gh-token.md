---
schema_version: 1
schema_kind: bug
id: BUG-017
title: Copilot cannot read the gh token on Windows
status: OPEN
severity: Medium
created_at: "2026-10-15T17:20:06+08:00"
updated_at: "2026-10-15T17:20:06+08:00"
related_workorder: null
target_version: "after 0.6.31"
affects_files:
  - plugins/copilot/plugin.js
  - src-tauri/src/plugin_engine/host_api.rs
depends_on: []
---

# BUG-017 Copilot Cannot Read The gh Token On Windows

## 問題描述（T0061 Runtime PARTIAL）

Copilot plugin 依序找 editor `apps.json`/`hosts.json` → gh `hosts.yml` → keychain。fork 的 `ctx.host.keychain`（`host_api.rs` `inject_keychain`）只支援 macOS；gh 在 Windows 預設把 token 存在 **Windows Credential Manager**（target `gh:github.com:<user>`），`%LOCALAPPDATA%\github-copilot\` 現為 `auth.db`。結果 Windows 上 Copilot 只顯示 `Not logged in. Run gh auth login first.`，除非手動提供 `pluginDataDir/auth.json`。既有限制，非 T0061 造成。

## 使用者決策（D102）

v0.6.31 發行後另開單：研究上游 / gh 在 Windows 的 token 來源，評估新增「只讀、限定 target（例如 `gh:github.com:*`）」的 Windows Credential Manager host API。安全面設計需先研究再實作。

## 驗收條件

- [ ] Windows 已 `gh auth login` 的使用者，Copilot 可取得 token 並顯示用量。
- [ ] 只讀、限定 target；不得列舉或讀取其他程式憑證；token 不進 log（redaction）。
- [ ] 讀不到時明確提示。

## 回報區

### 修復狀態
OPEN（v0.6.31 後，D102）
