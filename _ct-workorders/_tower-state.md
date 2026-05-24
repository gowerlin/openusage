# 塔台狀態快照 _tower-state.md

## 🌅 起手式（Quick Recovery）
> 最後更新：2026-05-24 15:46 (UTC+8)

### 立即待辦
1. PLAN-003：DONE；T0021 Tauri runtime theme persistence smoke PASS，三個 macaron themes reload 後保持。
2. PLAN-002：DONE；T0017 Tauri runtime language persistence smoke 已通過，commit `5652730d1c062ede94a659917274324ef14dbfbb`。
3. 專案基線工單尚未建立；待使用者確認是否需要。

### 近期完成摘要
- 2026-05-23：Control Tower v5.0.1 首次啟動，建立 `_ct-workorders/` 與本狀態快照。
- 2026-05-23：啟用 PLAN 追蹤並建立 `PLAN-001-windows-port.md`。
- 2026-05-23：PLAN-001 轉為 PLANNED，建立研究工單 `T0001-research-windows-porting.md`。
- 2026-05-23：使用者要求 YOLO 自動拍單，project config 設定 `auto-session: yolo`。
- 2026-05-23：T0001 回報 PARTIAL；Windows porting 建議採 MVP 路徑，先修 build/run/package baseline。
- 2026-05-23：接受 T0001 的 PARTIAL 作為可決策結論，建立 T0002 Windows Rust build baseline。
- 2026-05-23：T0002 首次 BAT terminal 未成功啟動工作，已重新派發。
- 2026-05-23：T0002 完成；Windows `cargo check` baseline 在 VS x64 dev env + `LIBCLANG_PATH` 下通過。
- 2026-05-23：接受 T0002 DONE，建立 T0003 Windows host API MVP。
- 2026-05-24：T0003 完成；Windows host API 對 keychain / ls.discover / sqlite 改為 explicit unsupported / fail loud，驗證通過。
- 2026-05-24：接受 T0003 DONE，建立 T0004 Windows provider path audit。
- 2026-05-24：T0004 完成；Cursor/Windsurf/Perplexity Windows explicit unsupported，Kiro/Gemini 補 Windows path，驗證通過。
- 2026-05-24：接受 T0004 DONE，建立 T0005 Windows packaging / release workflow。
- 2026-05-24：T0005 PARTIAL；Windows NSIS packaging 通過，updater `.sig/latest.json` 待 signing secret / tag release 驗證。
- 2026-05-24：接受 T0005 PARTIAL 的可決策結論，建立 T0006 Windows docs/UI polish。
- 2026-05-24：T0006 完成；建立 T0007 release verification / closeout gate。
- 2026-05-24：T0007 完成；source/local package 可接受，但 public Windows release 仍 BLOCKED，建立 T0008 signed release verification。
- 2026-05-24：T0008 回報 BLOCKED；使用者授權 C 完整 release flow，建立 T0009 fork release flow。
- 2026-05-24：T0009 回報 BLOCKED；fork repo 缺 Tauri signing secrets，且 macOS matrix 也缺 Apple/macOS secrets。
- 2026-05-24：使用者決定改 Windows-only release workflow 並將 updater endpoint 改到 `gowerlin/openusage`，建立 T0010。
- 2026-05-24：T0010 DONE；release workflow 改 Windows-only，updater endpoint 指向 fork；T0009 Renew 仍需 Tauri signing secrets。
- 2026-05-24：使用者回報 Tauri signing secrets 已設定；Renew T0009 重跑 release flow。
- 2026-05-24：使用者回報 Renew T0009 未成功派發；已重新開 BAT terminal 派發 T0009。
- 2026-05-24：T0009 Renew #1 PARTIAL；release preflight 通過、branch/tag 已推送，但 publish workflow 因 `tauri-apps/tauri-action@v1` 不存在而失敗。Branch 已修正為 `@v0.6.2`；下一步需決策 force retag `v0.6.24` 或 bump version。
- 2026-05-24：使用者選 `1` / Option A；Renew T0009 #2，授權 force-update `v0.6.24` 到 `5237715` 並重跑 release verification。
- 2026-05-24：T0009 Renew #2 已派發到 BAT terminal `dd943f217ce44b6e5c6dc62874f1ab06`。
- 2026-05-24：T0009 Renew #2 BLOCKED；tag `v0.6.24` 已指向 `5237715`，但 Actions run `26339904804` 在 updater signing 因 signing secret/password 不匹配或 key 格式錯誤失敗。
- 2026-05-24：使用者要求產生新 Tauri updater key pair 並更新 `tauri.conf.json` updater `pubkey`；Renew T0009 #3。
- 2026-05-24：T0009 Renew #3 已派發到 BAT terminal `8453269e29e12621dc963ebb0941d413`。
- 2026-05-24：T0009 DONE；key rotation、secret update、pubkey commit、tag update、Actions run `26340728709`、release artifact verification 全部通過。
- 2026-05-24：PLAN-001 DONE；Windows public release `v0.6.24` 包含 NSIS setup、`.sig`、`latest.json` Windows entries，artifact URLs 指向 `gowerlin/openusage`。
- 2026-05-24：T0001/T0005/T0008 歷史 PARTIAL/BLOCKED 已做塔台收斂標記為 DONE，dashboard 工單計數可回到全綠。
- 2026-05-24：`.github/workflows/publish.yml` 已將 `uploadUpdaterJson` 改為 `includeUpdaterJson`，移除 Tauri action 非阻塞 warning。
- 2026-05-24：啟用 BUG tracking；建立 BUG-001 與 T0011，處理面板視窗拖曳與位置記憶。
- 2026-05-24：T0011 已派發到 BAT terminal `6d1a48a13c0ef7e465dd3383fa57a92a`。
- 2026-05-24：建立 PLAN-002 i18n support；使用者選擇全 App UI、預設 `en`、內建 `zh-TW`、完整搬移可見 UI 字串，只建 PLAN 不派工單。
- 2026-05-24：T0011 DONE / BUG-001 FIXED；Worker commit `b354778a0fca22c1899a1f9aa17d7dd79bbf018a`，驗證包含 `bun run test --run`、`bun run build`、`cargo fmt --check`、`cargo test`。
- 2026-05-24：建立 BUG-002 與 T0013，處理 Windows 背景 shell / child process 顯示終端視窗問題；已派發到 BAT terminal `8c5bff6fcf9a83db5cd83cf89a5337e0`。
- 2026-05-24：使用者要求開始實作 PLAN-002；PLAN-002 轉為 IN_PROGRESS，建立並派發 T0012 i18n architecture / string inventory research 工單到 BAT terminal `bc1e45aa6dcaa64069c45be205033653`。
- 2026-05-24：T0012 DONE；commit `638754f443b3630da40d33343c657f252b8604cd`；研究建議採本地 typed dictionary，不新增 dependency。已建立並派發 T0014 i18n foundation 工單到 BAT terminal `95918651a3518df58c8ab43daa2540fd`。
- 2026-05-24：T0014 DONE；commit `d95afa6968f5bf3e4bacc788e7cecf636be53b00`；i18n foundation、language persistence、Settings selector、tests/build 通過。已建立並派發 T0015 visible UI string migration 工單到 BAT terminal `d2a41b824dee714f8b67c5c95b2f4ce6`。
- 2026-05-24：T0013 DONE / BUG-002 FIXED；commit `67d5cbc8422a757df314498b29d96d03918affde`；Windows background command helper 使用 `CREATE_NO_WINDOW`，Rust tests/build 通過，packaged visual smoke 未執行。
- 2026-05-24：T0015 DONE；commit `dce07dd1cc7a51c804baee940440c38c9c229a45`；主要可見 UI 字串搬移到 typed i18n resources，provider raw matching semantics 保留，tests/build 通過。
- 2026-05-24：接受 T0015 DONE，建立並派發 T0016 i18n verification closeout 到 BAT terminal `81eadd3470453f59758c7c0c5b52f800`。
- 2026-05-24：T0016 PARTIAL；commit `fc527f76ebf4faf5df2f8b357897af416073fc12`；source/test/build、i18n resource、provider semantics、browser immediate language switch 通過，但純 browser 缺 Tauri internals，無法驗證 reload/app restart persistence。
- 2026-05-24：接受 T0016 PARTIAL，建立並派發 T0017 i18n Tauri runtime persistence smoke 到 BAT terminal `c7f45b4e70a938941de68d1ce2d85b0a`。
- 2026-05-24：建立 PLAN-003 Add macaron pastel theme presets；三個預設主題為粉紅、粉綠、粉藍馬卡龍色系；暫不派工單。
- 2026-05-24：使用者要求 PLAN-002 完成後自動 YOLO 進行 PLAN-003；已預建 T0018，待 PLAN-002 DONE 後直接派發。
- 2026-05-24：T0017 DONE；commit `5652730d1c062ede94a659917274324ef14dbfbb`；Tauri runtime language persistence smoke 通過，PLAN-002 收斂為 DONE。
- 2026-05-24：依 D035 自動 YOLO 進行 PLAN-003；T0018 theme architecture / token inventory 已派發到 BAT terminal `7b14c686b9ebf9dfcc454c0e086d9e1e`。
- 2026-05-24：T0018 DONE；commit `1520616c1e44714591a83abe7acc9989cbc1ff24`；研究建議採方案 A 延伸既有 `ThemeMode`，新增三個 light-only macaron root classes，不新增 theme editor。
- 2026-05-24：接受 T0018 DONE，建立並派發 T0019 Implement macaron theme presets 到 BAT terminal `c3a3ba572226ccaaff3ccd5aab7d6bb5`。
- 2026-05-24：T0019 DONE；commit `a9dc8fb82eafb2b40a4887c105d0dba82406425c`；三個 macaron theme presets、Settings selector、i18n labels、focused tests/build 已完成，visual screenshots 留給 T0020。
- 2026-05-24：接受 T0019 DONE，建立並派發 T0020 Theme visual verification closeout 到 BAT terminal `384e603eb27165270d62dc82d269c9ae`。
- 2026-05-24：T0020 PARTIAL；commit `8fb84e04c31bfc12ab245a00372868a4f9c13628`；browser visual smoke / screenshots 通過，compact theme selector overlap 已修復，但 Tauri runtime theme persistence 未驗證。
- 2026-05-24：接受 T0020 PARTIAL，建立並派發 T0021 Theme Tauri runtime persistence smoke 到 BAT terminal `79264ba994057240b1e0bf4a5b3f22c7`。
- 2026-05-24：T0021 DONE；Tauri runtime guard 通過，`macaron-pink` / `macaron-green` / `macaron-blue` reload persistence 通過，PLAN-003 收斂為 DONE。

### 快速連結
- Bug Tracker → [_bug-tracker.md]
- Backlog → [_backlog.md]
- Decision Log → [_decision-log.md]
- Learnings → [_learnings.md]

---

## 📦 基本資訊

| 欄位 | 內容 |
|------|------|
| **專案** | openusage |
| **目前里程碑** | 未設定 |
| **塔台版本** | Control Tower v5.0.1 |

---

## 🔢 編號追蹤

| 類型 | 最大編號 |
|------|---------|
| 工單 | T0021 |
| BUG | BUG-002 |
| PLAN | PLAN-003 |
| 決策 | D039 |

---

## 📊 進度快照

| Story | 工單 | 狀態 | 卡點 | 下一步 |
|-------|------|------|------|--------|
| Project baseline | - | 📋 TODO | 缺 `project-context.md` / `sprint-status.yaml` | 等使用者確認是否開基線工單 |
| Windows version port | PLAN-001 | ✅ DONE | 無 | 可選 CI warning cleanup |
| Windows porting research | T0001 | ✅ DONE | 歷史 `libclang` blocker 已由後續工單解除 | 無 |
| Windows Rust build baseline | T0002 | ✅ DONE | 無 | 建議 T0003 |
| Windows host API MVP | T0003 | ✅ DONE | 無 | 建議 T0004 |
| Windows provider path audit | T0004 | ✅ DONE | 無 | 建議 T0005 |
| Windows packaging release workflow | T0005 | ✅ DONE | release artifacts 已由 T0009 驗證 | 無 |
| Windows docs UI polish | T0006 | ✅ DONE | 無 | 已衍生 T0007 |
| Windows release verification closeout | T0007 | ✅ DONE | release gate 已由 T0009 通過 | 無 |
| Signed Windows release verification | T0008 | ✅ DONE | release gate 已由 T0009 通過 | 無 |
| Fork release flow | T0009 | ✅ DONE | 無 | release `v0.6.24` verified |
| Windows-only release config | T0010 | ✅ DONE | 無 | 已納入 T0009 release |
| Panel draggable position persistence | BUG-001 / T0011 | ✅ FIXED | 無 | source commit `b354778a0fca22c1899a1f9aa17d7dd79bbf018a` |
| i18n support with Traditional Chinese locale | PLAN-002 / T0017 | ✅ DONE | 無 | runtime persistence verified；commit `5652730d1c062ede94a659917274324ef14dbfbb` |
| Macaron theme presets | PLAN-003 / T0021 | ✅ DONE | 無 | runtime persistence verified |
| Background shell window visibility | BUG-002 / T0013 | ✅ FIXED | packaged visual smoke 未執行 | source commit `67d5cbc8422a757df314498b29d96d03918affde` |

---

## 📝 本 Session 決策日誌
- D000：首次啟動塔台；尚未建立正式決策紀錄。
- D001：使用者要求建立新分支並實作 Windows 版本移植；先登記為 High priority architecture PLAN。
- D002：PLAN-001 先走研究型工單 T0001；研究完成後再決定分支與實作拆單。
- D003：啟用 YOLO auto-session，使用 BAT 派發 T0001 research worker。
- D004：接受 T0001 的 PARTIAL 作為可決策研究結論；推薦方案 A，建立 T0002。
- D005：使用者回報 T0002 未派發成功；移除 `--no-interactive` 後重新 BAT 派發 T0002。
- D006：接受 T0002 DONE，依回報建立 T0003；範圍限 Windows host API MVP，provider path audit 留給 T0004。
- D007：T0003 完成 Windows host API MVP；Windows 缺能力時採 explicit unsupported / fail loud，provider path parity 留給 T0004。
- D008：接受 T0003 DONE，建立 T0004；範圍限 provider path/support audit，release workflow 留給 T0005。
- D009：接受 T0004 DONE，建立 T0005；範圍限 Windows packaging / release workflow，docs/UI polish 留給 T0006。
- D010：T0005 Windows bundle target 選 NSIS `-setup.exe`，installer 使用 current-user 安裝；updater artifact 需 GitHub signing secret 驗證。
- D011：接受 T0005 PARTIAL，允許後續 docs/UI polish；T0006 不得宣稱 Windows public release ready。
- D012：接受 T0006 DONE，建立 T0007 release verification / closeout gate；禁止 push/tag/release/commit。
- D013：接受 T0007 DONE；PLAN-001 可視為 source-complete/local package PASS，但 public release BLOCKED，建立 T0008 signed release verification。
- D014：T0008 回報 BLOCKED；使用者選 C 授權完整 release flow，建立 T0009，允許 push/tag/release action 但需 preflight 與 secrets gate。
- D015：T0009 preflight BLOCKED；`gowerlin/openusage` actions secrets 為 0，需先補 signing secrets 或改 Windows-only release workflow。
- D016：使用者選 C；建立 T0010，範圍為 Windows-only release workflow + updater endpoint 改 `gowerlin/openusage`，不 push/tag/release。
- D017：接受 T0010 DONE；release config blocker 已解除，T0009 仍需 Tauri signing secrets 後才能 Renew。
- D018：使用者回報 signing secrets 已設定；Renew T0009，允許重跑完整 release flow 與 artifact verification。
- D019：T0009 Renew #1 建立並推送 `v0.6.24`，但 Actions 因 invalid `tauri-apps/tauri-action@v1` 失敗；修正 commit `5237715` 已推 branch，不自動 force-move tag，需塔台/使用者決策。
- D020：使用者選 `1` / Option A；Renew T0009 #2，明確授權只針對 `v0.6.24` force-update 到 `5237715`，再重跑 publish workflow 與 Windows artifacts verification。
- D021：T0009 Renew #2 retag 成功且 workflow source 正確，但 updater signing 失敗；判定為 GitHub Actions secret 內容/密碼問題，需使用者手動修正 secret，不改程式碼、不再移動 tag。
- D022：使用者要求產生新 Tauri updater key pair 並同步更新 `tauri.conf.json` updater `pubkey`；Renew T0009 #3 允許 key rotation、secret update、pubkey commit、必要時 force-update `v0.6.24` 到新 commit 後重跑 release verification。
- D023：接受 T0009 DONE；GitHub Actions run `26340728709` success，release `v0.6.24` 的 Windows NSIS setup、`.sig`、`latest.json` Windows platform entries 與 artifact URLs 驗證通過，PLAN-001 關閉為 DONE。
- D024：收斂 dashboard 歷史狀態；T0001/T0005/T0008 改為 DONE，原回報區保留當時 PARTIAL/BLOCKED 證據。
- D025：使用者回報面板視窗需支援拖曳並記住位置；啟用 BUG tracking，建立 BUG-001 與 T0011，立即派修復工單。
- D026：使用者要求 i18n 並預設加入繁體中文；選項確定為全 App UI、預設 `en`、內建 `zh-TW` 可切換、先研究架構、完整搬移可見 UI 字串，且只建立 PLAN 不派工單。
- D027：接受 T0011 完成回報；BUG-001 標記 FIXED，T0011 收斂為 DONE，驗證由 Worker 回報與 source commit `b354778a0fca22c1899a1f9aa17d7dd79bbf018a` 支撐。
- D028：使用者回報背景 shell 會顯示終端視窗；建立 BUG-002 與 T0013，範圍限定 Windows 背景 shell / child process 隱藏視窗，保留 stdout/stderr 與互動 terminal 行為。
- D029：使用者要求開始實作 PLAN-002；依既定策略先派 T0012 research / string inventory，並將後續實作編號調整為 T0014/T0015/T0016，避免與 BUG-002 的 T0013 衝突。
- D030：接受 T0012 DONE；依研究結論選擇本地 typed dictionary、不新增 i18n dependency，建立 T0014 Implement i18n foundation。
- D031：接受 T0014 DONE；i18n foundation 驗證通過，建立 T0015 visible UI string migration，要求保留 provider raw matching values 不翻譯。
- D032：接受 T0015 DONE；主要 UI 字串搬移與 tests/build 通過，建立 T0016 i18n verification closeout，要求 final verification 後再收斂 PLAN-002。
- D033：接受 T0016 PARTIAL；source/test/build 與 browser immediate language switch 已驗證，但 reload/app restart persistence 需 Tauri runtime，建立 T0017 專注驗證該缺口。
- D034：建立 PLAN-003；新增粉紅、粉綠、粉藍三個馬卡龍預設主題，先建計畫不派工單，預設不改現有預設 theme。
- D035：使用者授權 PLAN-002 完成後自動 YOLO 進行 PLAN-003；已預建 T0018，待 PLAN-002 DONE 後直接派發，不需二次確認。
- D036：接受 T0017 DONE；PLAN-002 的 i18n runtime persistence gate 已通過，PLAN-002 關閉為 DONE，並依 D035 自動派發 PLAN-003 / T0018。
- D037：接受 T0018 DONE；PLAN-003 採方案 A 延伸既有 `ThemeMode`，先實作 light-only `macaron-pink` / `macaron-green` / `macaron-blue`，視覺 screenshots closeout 留給 T0020。
- D038：接受 T0019 DONE；macaron theme presets source implementation 已完成，PLAN-003 剩餘 screenshots / visual smoke gate，建立並派發 T0020 做 closeout。
- D039：接受 T0020 PARTIAL；browser visual smoke / screenshots 與 compact selector fix 已完成，剩餘 Tauri runtime reload/app restart persistence，建立並派發 T0021 做 final closeout。

---

## ⏳ 待處理事項
- 確認是否要建立專案基線工單。
- PLAN-003：DONE；T0021 Tauri runtime macaron theme persistence 已通過。
- 無 Windows release 阻塞待辦。
- PLAN / BUG 追蹤已啟用；EXP 追蹤尚未啟用。

---

## 🔍 環境快照
> 最後掃描：2026-05-23 17:35 (UTC+8)

| 偵測項 | 狀態 | 備註 |
|--------|------|------|
| BMad-Method | ❌ | 未偵測到 `_bmad/` |
| ECC 學習 | ✅ Level 1 | `~/.claude/homunculus/` 存在 |
| bmad-guide skill | ✅ | 可用 |
| mem0 REST | ✅ | `memsync status --json` 成功 |
| 終端環境 | ❌ 未知 | 未偵測到 WT / TERM_PROGRAM |
| BAT 終端 | 📋 非 BAT 環境 | `BAT_SESSION` 未設定 |
| ct-exec | ✅ | 已安裝 |
| ct-done | ✅ | 已安裝 |
| ct-status | ✅ | 已安裝 |
| ct-evolve | ✅ | 已安裝 |
| ct-insights | ✅ | 已安裝 |
| ct-fieldguide | ✅ | 已安裝 |
| ct-help | ✅ | 已安裝 |
| _archive/ | 📋 | 未建立 |
| _playbooks/ | 📋 | 未建立 |
| _decision-log | 🆕 | 可建立 |
| 跨專案參照 | 📋 | 無關聯 |
| Global 學習 | ✅ | 0 patterns, 26 playbooks |
| BUG/PLAN 追蹤 | ✅ | PLAN:3；BUG:2（project config 啟用） |
| 實驗追蹤 | 📋 | 未啟用（使用預設值） |
| 設定來源 | project | `_ct-workorders/_tower-config.yaml` |
| 能力等級 | Level 1 | Core + ECC/memsync 可用，Project 層尚未初始化 |
