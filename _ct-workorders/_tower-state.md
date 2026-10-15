# 塔台狀態快照 _tower-state.md

## 🌅 起手式（Quick Recovery）
> 最後更新：2026-10-15 14:26 (UTC+8)

### 立即待辦
1. Release：`v0.6.27` 已發行（Publish run `38679801301` success，tag `v0.6.27` → `016db27`）；NSIS installer、`.sig`、`latest.json`（version `0.6.27`，URL 指向 fork）、繁中發行說明、GitHub API body 已驗證。
2. BUG-001 ~ BUG-005：使用者安裝測試皆驗收通過，全部 CLOSED。
3. PLAN-001 / PLAN-002 / PLAN-003：全部 DONE；Windows release、i18n 繁中、macaron themes 都已完成驗收。
4. 工單 T0001-T0037：全部 DONE。
5. PLAN-004：串接 T0038 merge+i18n → T0039 Devin Windows → T0040 Windows smoke+NSIS → T0041 發行 `v0.6.29`（D071）。T0038 DONE（merge `996aff28` / 去橫幅 `ea22c261` / i18n `c4ea9006`）；T0039 DONE（`21899655`）；T0040 PARTIAL（Usage Trend Windows FAIL，既有問題）→ 依 D074 插入 T0042 ccusage runner → T0043 taskbar+blur → T0044 re-smoke，再 T0041 發行；T0042 DONE（`1a439dcc`）；T0043 DONE（`05973976`）；依 D076 再串 T0045 redaction → T0046 ccusage robustness → T0047 no_runner hint/tooltip/devin docs → T0048 panel_blur 拆檔 → T0049 cwd plugins 限 debug → T0044 re-smoke → T0041 發行；T0045 DONE（`2f357ac0`）；T0046 DONE（`61698e68`）；T0047 DONE（`96fc3ad8`）；T0048 DONE（`84a814e8` 文案 / `02a94c74` 拆檔）；T0049 已 YOLO 派發；T0048 後插入 T0049（BUG-012）。前一張 DONE 才派下一張，非 DONE 停下問使用者。

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
- 2026-05-24：使用者回報安裝測試 i18n 繁體中文全部正常；T0016 由 PARTIAL 收斂為 DONE。
- 2026-05-24：使用者回報安裝測試 Theme 切換全部正常；T0020 由 PARTIAL 收斂為 DONE。
- 2026-05-24：使用者回報 BUG-001 安裝版驗收失敗：拖曳區無法拖曳、透明 padding 仍攔截滑鼠事件。
- 2026-05-24：T0022 DONE / BUG-001 轉 VERIFY；補 `core:window:allow-start-dragging`、Tauri drag region、Windows hit-test mask；source/tests/local NSIS package PASS，等待使用者安裝版滑鼠實機驗收。
- 2026-05-24：使用者補充 BUG-001 實際缺口為 native 不規則去背視窗；T0022 升級為 Windows `SetWindowRgn` panel/arrow region mask 並關閉 native undecorated shadow，local NSIS package PASS。
- 2026-05-24：建立 BUG-003 / T0023；System Tray icon 改用 desktop icon set 的 `icons/32x32.png` 並關閉 template mode，local NSIS package PASS，等待使用者安裝版視覺驗收。
- 2026-05-24：使用者回報 BUG-003 新安裝版啟動瞬間有青綠色 desktop icon，隨後變黑；T0024 修正 Windows 前端不再覆寫 Rust 初始 desktop tray icon，local NSIS package PASS。
- 2026-05-24：使用者確認 BUG-003 System Tray icon 正確，BUG-003 CLOSED；BUG-001 不規則透明視窗遮罩有效，但某些狀態會出現 Windows native title bar / controls。
- 2026-05-24：T0025 DONE；Windows panel 在 init/show、`SetWindowRgn` 前、cursor passthrough 切換後都強制清除 native title bar / frame style bits，local NSIS package PASS。
- 2026-05-24：T0025 安裝版驗收 FAIL，使用者截圖顯示完整 native title bar 仍會出現；T0026 改為可見期間 mask thread 每 33ms 檢查並清除 async 寫回的 title / frame style bits，local NSIS package PASS。
- 2026-05-24：T0026 安裝版驗收 FAIL，使用者補充 native title bar 似乎在 Active / Focus 後、離開 focus 時出現；T0027 停用 DWM non-client rendering / paint，local NSIS package PASS。
- 2026-05-24：T0027 安裝版驗收 FAIL，使用者回報仍一樣；T0028 新增 Windows-only `panel-window-trace.log`，記錄 focus/blur、HWND style/exstyle、DWM attribute、window/client/frame bounds 與 region / cursor passthrough 狀態，local NSIS package PASS。
- 2026-05-24：T0028 trace 回收；實際 trace path 為 `C:\Users\Gower\AppData\Roaming\com.sunstory.openusage\logs\panel-window-trace.log`，root cause 為 Tauri / Tao state transition 寫回 `WS_CAPTION` / frame bits；T0029 在 show/focus/hide/window event 後同步 enforce chrome，local NSIS package PASS。
- 2026-05-24：T0029 安裝版仍在面板 deactive 後顯示 native title bar；T0030 trace 追到 `set_ignore_cursor_events(...)` 是 style 回寫來源之一，已移除 cursor-ignore toggle 並改用精準 `SetWindowRgn` region，local NSIS package PASS。
- 2026-05-24：T0030 安裝版仍有其他 native title bar 出現途徑；T0031 改採 Windows native subclass，於 message 層攔截 standard frame calculation / activation / paint / style changing，local NSIS package PASS。
- 2026-05-24：使用者回報 T0031 安裝版「解決了」；BUG-001 CLOSED。
- 2026-05-24：使用者回報 BUG-002 / BUG-003 也都驗收通過；BUG-002 CLOSED、BUG-003 維持 CLOSED。
- 2026-05-24：修正正式 release 流程，將版本 bump 到 `0.6.25`，清理錯誤 `0.6.25` / 舊 `v0.6.25` tag，重建 `v0.6.25`；Publish run `26360375391` 成功，release assets 與 `latest.json` 驗證通過。

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
| **塔台版本** | Control Tower v5.0.9 |

---

## 🔢 編號追蹤

| 類型 | 最大編號 |
|------|---------|
| 工單 | T0049 |
| BUG | BUG-012 |
| PLAN | PLAN-004 |
| 決策 | D081 |

---

## 📊 進度快照

| Story | 工單 | 狀態 | 卡點 | 下一步 |
|-------|------|------|------|--------|
| Project baseline | - | 🚫 DROPPED | 無 | D061 決定不建立 |
| Windows version port | PLAN-001 | ✅ DONE | 無 | 可選 CI warning cleanup |
| Windows porting research | T0001 | ✅ DONE | 歷史 `libclang` blocker 已由後續工單解除 | 無 |
| Windows Rust build baseline | T0002 | ✅ DONE | 無 | 建議 T0003 |
| Windows host API MVP | T0003 | ✅ DONE | 無 | 建議 T0004 |
| Windows provider path audit | T0004 | ✅ DONE | 無 | 建議 T0005 |
| Windows packaging release workflow | T0005 | ✅ DONE | release artifacts 已由 T0009 驗證 | 無 |
| Windows docs UI polish | T0006 | ✅ DONE | 無 | 已衍生 T0007 |
| Windows release verification closeout | T0007 | ✅ DONE | release gate 已由 T0009 通過 | 無 |
| Signed Windows release verification | T0008 | ✅ DONE | release gate 已由 T0009 通過 | 無 |
| Fork release flow | T0009 | ✅ DONE | 無 | release `v0.6.24` / `v0.6.25` verified |
| Windows-only release config | T0010 | ✅ DONE | 無 | 已納入 T0009 release |
| Panel draggable position persistence | BUG-001 / T0011 / T0022 / T0025 / T0026 / T0027 / T0028 / T0029 / T0030 / T0031 | ✅ CLOSED | 無 | 使用者安裝測試確認 T0031 解決 native title bar / deactive 問題 |
| System tray icon | BUG-003 / T0023 / T0024 | ✅ CLOSED | 無 | 使用者安裝測試確認 tray icon 正確 |
| i18n support with Traditional Chinese locale | PLAN-002 / T0016 / T0017 | ✅ DONE | 無 | runtime persistence + user install test verified |
| Macaron theme presets | PLAN-003 / T0020 / T0021 | ✅ DONE | 無 | visual smoke + runtime persistence + user install test verified |
| Background shell window visibility | BUG-002 / T0013 | ✅ CLOSED | 無 | 使用者安裝測試確認背景 shell 不再顯示終端視窗 |
| Single app instance | BUG-004 / T0032 | ✅ CLOSED | 無 | 使用者安裝 `v0.6.26` 實測通過 |
| About / Help links to fork | BUG-005 / T0035 | ✅ CLOSED | 無 | 使用者 `v0.6.27` 實測通過 |
| In-app changelog source | BUG-005 / T0034 | ✅ CLOSED | 無 | 使用者 `v0.6.27` 實測通過 |
| Upstream sync research | PLAN-004 / T0037 | ✅ DONE | 無 | 方案 A 已核准 |
| Merge tauri-legacy + i18n | PLAN-004 / T0038 | ✅ DONE | 無 | 本機 main，未 push |
| Devin Windows behavior | PLAN-004 / T0039 | ✅ DONE | 無 | 本機 main，未 push |
| Windows smoke + NSIS 0.6.29 | PLAN-004 / T0040 | ⚠️ PARTIAL | Usage Trend FAIL（BUG-006） | 由 T0042–T0044 解決 |
| ccusage runner Windows | BUG-006 / T0042 | ✅ DONE | 無 | BUG-006 FIXED |
| Panel taskbar + blur hide | BUG-007/008 / T0043 | ✅ DONE | 無 | BUG-007/008 FIXED |
| Windows path redaction | BUG-009 / T0045 | ✅ DONE | 無 | BUG-009 FIXED（剩餘併 T0046） |
| ccusage Windows robustness | BUG-010 / T0046 | ✅ DONE | 無 | BUG-010 FIXED；BUG-009 剩餘完成 |
| no_runner hint + tooltip + devin docs | BUG-011 / T0047 | ✅ DONE | 無 | BUG-011 FIXED（文案改短併 T0048） |
| Split panel_blur.rs + 提示文案改短 | T0048 | ✅ DONE | 無 | panel.rs 401 行 |
| cwd plugins debug-only | BUG-012 / T0049 | 🔄 DISPATCHED | 無 | 等 Worker 回報 |
| Windows re-smoke 0.6.29 | PLAN-004 / T0044 | 📋 PENDING | depends_on T0049 | 自動串接 |
| Release v0.6.29 | PLAN-004 / T0041 | 📋 PENDING | depends_on T0044 | 自動串接 |
| Release v0.6.27 | T0036 | ✅ DONE | 無 | run `38679801301`；release verified |
| Release v0.6.26 | T0033 | ✅ DONE | 無 | run `38675818087`；release verified |

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
- D040：接受 T0021 DONE；Tauri runtime guard 與三個 macaron themes reload persistence 全部通過，PLAN-003 正式收斂為 DONE。
- D041：使用者完成安裝測試並確認 i18n 繁體中文與 Theme 切換全部正常；T0016 / T0020 由 PARTIAL closeout 收斂為 DONE，不另開新工單。
- D042：使用者回報 BUG-001 安裝版驗收未過；建立 T0022 做補救修復，BUG-001 轉 VERIFY，最後 gate 以使用者新安裝包滑鼠實測為準。
- D043：使用者釐清 BUG-001 需要 native 不規則去背視窗，且另回報 System Tray icon 空白；T0022 採 Windows `SetWindowRgn` region mask，BUG-003/T0023 改 tray icon 使用 desktop icon set，兩者最後 gate 以新安裝包實測為準。
- D044：使用者實測確認 BUG-003 初始 desktop tray icon 會被前端動態 tray icon 覆寫成黑色；T0024 決定 Windows 保留 Rust 初始 desktop icon，前端只在非 Windows 維持動態 menubar icon。
- D045：使用者確認 BUG-003 已修正，並確認 BUG-001 irregular mask 有效；剩餘 native title bar leak 以 T0025 修正，Windows HWND style 在 cursor passthrough 切換後也強制清除 title / frame bits。
- D046：T0025 安裝版仍出現完整 native title bar，判定一次性 HWND style enforcement 會被 Tauri / Tao async window-state 晚一步覆蓋；T0026 改為可見期間持續檢查，只有 style bits 回來時才刷新 HWND。
- D047：T0026 安裝版仍在 focus/blur 後出現 native title bar，判定為 Windows `WM_NCACTIVATE` / DWM non-client paint 路徑；T0027 停用 DWM non-client rendering / paint，保留既有 style bit pruning。
- D048：T0027 安裝版仍失敗；停止追加修補假設，T0028 改加 Windows panel detail trace，讓下一輪根據 runtime evidence 判斷是否需要 native message hook / focus policy / window architecture 調整。
- D049：T0028 trace 顯示根因不是 DWM paint，而是 Tauri / Tao hidden/show/focus/resize state transition 會寫回 decorated style bits；T0029 改為在 show/focus/hide/window event 後同步 enforce chrome，避免等待 33ms loop。
- D050：T0029 安裝版仍在 deactive 後出現 native title bar；trace 顯示 `set_ignore_cursor_events(...)` passthrough toggle 會回寫 decorated style bits。T0030 移除該 API，透明 padding 改由精準 `SetWindowRgn` 不規則視窗 region 處理。
- D051：T0030 安裝版仍有其他 native title bar 出現途徑；依 Microsoft Win32 文件，根層修法改為安裝 native subclass，攔截 `WM_NCCALCSIZE`、`WM_NCACTIVATE`、`WM_NCPAINT`、`WM_STYLECHANGING`，不再只在 Tauri event 後補 prune。
- D052：使用者安裝測試確認 T0031 解決 BUG-001 native title bar / deactive 問題；BUG-001 CLOSED。
- D053：使用者回報 BUG-002 / BUG-003 也都驗收通過；BUG-002 由 FIXED 收斂為 CLOSED，BUG-003 維持 CLOSED 並更新驗收時間。
- D054：正式 release `0.6.25` 必須從 `main` 的版本 bump commit 發出；清理錯誤 `0.6.25` / 舊 `v0.6.25` tag 後，重建 `v0.6.25` 指向 `f8e31e9`，Publish run `26360375391` 已成功並驗證 updater assets。
- D055：使用者要求禁止多個執行個體；建立 BUG-004 / T0032，採 `tauri-plugin-single-instance` 全平台，第二次啟動結束新 instance 並以既有 `show_panel` 叫出面板。
- D056：使用者授權 T0032 完成後改版號並 GitHub 發行；預建 T0033（`0.6.25`→`0.6.26`，push main + 新 tag `v0.6.26`，禁止 force / 移動既有 tag），並須以 `gh release edit` 寫入繁中發行重點說明（本版重點：single-instance）。T0032 DONE 後自動派發，派發前塔台先 `*sync` 並 commit 塔台私有檔。
- D057：接受 T0032 DONE（`2717631`）；接受依賴鎖 `~2.4.5` 的偏離（避免 tauri 2.12 連帶升級）；BUG-004 FIXED，macOS/Linux runtime 未驗；依 D056 派發 T0033。
- D058：接受 T0033 DONE；`v0.6.26` 發行經塔台以 `gh -R gowerlin/openusage` 獨立複驗。教訓：本機 `gh` 預設 repo 為上游 `robinebers/openusage`，release 相關指令一律加 `-R gowerlin/openusage`（塔台先前誤把上游 `v0.6.25` notes 當成 fork 格式）。
- D059：使用者安裝 `v0.6.26` 實測確認 single-instance 正常；BUG-004 CLOSED。
- D060：執行 `*archive`（archive_days 預設 7）；T0001–T0031、BUG-001~003、PLAN-001~003 共 37 張 `git mv` 到 `_archive/`。進度快照中的歷史列視為紀錄而非活躍引用，不套用豁免；T0032/T0033/BUG-004 未滿 7 天保留熱區。
- D061：不建立專案基線工單（`project-context.md` / `sprint-status.yaml`）。理由：`AGENTS.md` + `docs/` 已涵蓋專案 context；專案未採 BMad sprint/story 流程，塔台工單 + BUG/PLAN 追蹤足夠；AGENTS.md 要求不過度工程。重啟條件：Worker 反覆重新探索同一批專案背景時，再開小工單只產 `project-context.md`。
- D062：使用者要求補 `latest.json` 更新說明；塔台查證 App updater 不顯示 `notes`，App changelog 實際讀上游 `robinebers/openusage` releases（上游有同名 tag，顯示錯誤內容）。使用者選擇改 changelog 來源指向 fork、不補 `latest.json`、完成後先不發版；建立 BUG-005 / T0034。塔台更正先前「notes 空導致 App 看不到說明」的錯誤判斷。
- D063：使用者截圖要求 About dialog 與 side-nav Help 也改指向 fork；署名採「原作者 Robin Ebers + 維護者 gowerlin」，移除上游維護者，LICENSE 不改。建立 T0035（depends_on T0034，避免兩個 Worker 同時 commit），T0034 DONE 後自動派發。
- D064：接受 T0034 DONE（`a6c52aa`）；新增 `GITHUB_REPO` 常數、dialog 測試改 `importOriginal` 的偏差可接受；browser 實測未跑，留給發行後 final gate。BUG-005 轉 FIXING，依 D063 派發 T0035（可沿用 `GITHUB_REPO` 常數）。
- D065：接受 T0035 DONE（`353c412`）；接受修改 `src/App.test.tsx` 2 行文案斷言的範圍外偏差（`about.builtBy` 文案變更直接導致）。塔台檢視 after-zh-TW 截圖符合 D063。BUG-005 FIXED，final gate 待下次發行。
- D066：使用者授權推上 GitHub 並發行 `v0.6.27`；建立 T0036（同 T0033 流程，`gh` 一律 `-R gowerlin/openusage`，繁中發行重點說明，並驗證 GitHub API `releases/tags/v0.6.27` body = App changelog 來源）。發行後請使用者 App 內實測 BUG-005。
- D067：使用者要求同步上游 `v0.7.14`。塔台預查：上游 `main`/`v0.7.x` 為 native Swift（macOS only）重寫、與 fork 無共同祖先，無法 merge；Tauri 凍結線 `tauri-legacy`（`v0.6.28`）merge-base `f415ddd`，試合併 17 衝突。使用者選「兩者都研究」、退休通知橫幅不帶進 fork。建立 PLAN-004 + 研究工單 T0037（唯讀：merge-tree / 暫時 worktree，不動主工作區），與 T0036 無 affects_files 重疊，並行派發。
- D068：接受 T0036 DONE；`v0.6.27` 經塔台以 `-R gowerlin/openusage` 獨立複驗（release / assets / `latest.json` / Publish run / GitHub API body）。BUG-005 待使用者 App 內實測。
- D069：使用者安裝 `v0.6.27` 實測確認 changelog / About / Help 皆指向 fork；BUG-005 CLOSED。
- D070：接受 T0037 DONE（`ec2d6491`）。結論：`tauri-legacy` 可 merge，17 衝突皆小 hunk，暫存 worktree 試合併全綠（cargo test 137 / vitest 1156）。使用者於 T0037 互動決定保留 Gemini、版號 `0.6.29`。PLAN-004 預查清單漏列 `src/lib/settings.test.ts`（塔台疏漏，已由報告更正）。重要風險：保留 Gemini 需手動還原 3 個被靜默刪除的檔；`AGENTS.md`/`CLAUDE.md` 需 `--ours`；本機有上游 `v0.6.28`/`v0.7.*` tag，`git push --tags` 會外洩並可能污染 fork Latest release。
- D071：使用者同意方案 A、全程串接到發行、v0.7.x 移植延到 v0.6.29 發行後逐項開單。塔台已設 `remote.upstream.tagOpt --no-tags`，並經使用者同意刪除本機 63 個上游專屬 tag（`v0.6.28` + 62 個 `v0.7.*`；未動遠端）。另有 36 個舊上游 tag（`v0.0.1`–`v0.6.23` 等，多在共用歷史）未在授權範圍，保留；T0041 明令禁止 `git push --tags`。建立 T0038–T0041，直接在本機 `main` 操作，T0041 才 push。
- D072：接受 T0038 DONE；塔台抽查版號 0.6.29、merge 第二 parent `0a08306d`、AGENTS/CLAUDE 無 diff、Gemini 保留、Windsurf 移除、無 retirement 殘留、無 release-tauri、updater/changelog 指向 fork。接受偏差：`settings.test.ts` 改逐 hunk 解（保留上游非衝突測試）、`cargo fmt` 套到 4 個上游未格式化檔、`use-tray-icon.ts` 傳 language。遺留：語言切換後 tray tooltip 需等下次更新才換語言（低）。依 D071 派發 T0039。
- D073：接受 T0039 DONE（`21899655`）。方案 A：依官方 Devin docs，Windows 讀 `%APPDATA%/devin/credentials.toml`、跳過 sqlite，無憑證時顯示明確提示；redaction 稽核補 1 測試。未 runtime 驗證（本機無 Devin 憑證）。後續候選（不阻塞 PLAN-004）：`host_api.rs` 路徑 redaction 只遮 Unix `/Users/...`，Windows `C:/Users/...` 形式未遮（隱私，建議 v0.6.29 後開 BUG）；`docs/providers/devin.md` 補 Windows 路徑。依 D071 派發 T0040。
- D074：T0040 PARTIAL：NSIS PASS、smoke 16/17 PASS；Usage Trend 在 Windows 不渲染（`ccusage_runner_candidates` 只列 Unix 名稱，v0.6.27 起既有）。依串接規則停下詢問；使用者決定先修再發，並一併修 T0040 觀察到的面板工作列按鈕與失焦不收起。建立 BUG-006/T0042、BUG-007+008/T0043、T0044 re-smoke，T0041 改 depends_on T0044。T0040 Worker 曾暫改 HKCU WebView2 policy 並停止 / 重啟使用者 0.6.27（皆已還原，遺留空的 `HKCU:/Software/Policies/Microsoft/Edge` key）；後續工單明令禁止改 registry。
- D075：接受 T0042 DONE（`1a439dcc`）；BUG-006 FIXED。Windows 實機 Usage Trend 顯示、bun.exe 與 .cmd 路徑皆無 console。接受偏差：同檔 1 行 rustfmt 漂移修正。後續候選：(1) Windows timeout 時只殺 `cmd.exe`，`.cmd` 底下 node 孫程序不會被殺（需 Job Object / `taskkill /T`）；(2) `no_runner` 時 plugin 靜默省略 token 行（違反 fail loud 精神，低）；(3) yarn classic `yarn.cmd` 被判可用但 dlx 必失敗（既有，低）。依 D074 派發 T0043。
- D076：接受 T0043 DONE（`05973976`）；BUG-007/008 FIXED。接受偏差：Worker 暫時覆蓋已安裝 exe 測 tray（已還原，hash 一致），後續工單禁止。使用者要求「記下來的小問題也排單再出 0.6.29」：建立 BUG-009/T0045（Windows 路徑 redaction）、BUG-010/T0046（ccusage 孫程序 / yarn classic / dead code）、BUG-011/T0047（no_runner 提示 + tray tooltip 語言 + devin docs）、T0048（panel_blur.rs 拆檔）；T0044 / T0041 改 depends_on 這四張。不排單：前景鎖導致不自動收起（未重現，記為已知限制）、設定頁高度被工作列遮住（T0040 觀察，使用者未列入）。
- D077：接受 T0045 DONE（`2f357ac0`）；BUG-009 FIXED（host_api 共用 `redact_paths()`，實機 host_api log 無使用者名稱）。Worker 發現剩餘外洩：`config.rs:62` 直接 log 路徑、含空白使用者名稱只遮一半 → 依使用者「小問題也排單再出版」原則併入 T0046（同為 Rust、範圍小），不另開單。
- D078：接受 T0046 DONE（`61698e68`）；BUG-010 FIXED、BUG-009 剩餘完成。方案 Job Object（引 Microsoft 文件）。接受偏差：程式無 availability cache → 改重用 `--version` 輸出；`config.rs:53` 一併改。Worker 觀察：正式版從含 `plugins/` 的 cwd 啟動會載入該目錄 plugin，塔台查證 `find_dev_plugins_dir()` 未限 debug build → 開 BUG-012（Medium，安全）/ T0049 插在 T0048 後；T0044 補 BUG-010/012 檢查與「安裝版以安裝目錄為 cwd 重啟」規則。
- D079：接受 T0047 DONE（`96fc3ad8`）；BUG-011 FIXED。接受偏差：改 `provider-card-metric-line.tsx` 讓 text value 可翻譯（獨立 `DISPLAY_VALUE_KEYS`，不誤翻 plan 名）、新增 `use-tray-icon.test.ts`。Worker 觀察提示被截斷 → 塔台定案短文案 `Needs Node.js or Bun` / `需要 Node.js 或 Bun`，以獨立 commit 併入 T0048。tray tooltip 語言更新僅單元測試（Windows 本就不更新 tooltip）。
- D080：接受 T0048 DONE；純搬移（119+/118-），`panel_hit_test.rs` 未動，cargo test 149 不減；文案改短後 browser dev 量測不截斷（en 餘裕約 3px，T0044 實機 WebView2 再確認）。依 D076 派發 T0049。
- D081：使用者決定截圖含用量金額可公開，只要無 API token / 個資。塔台逐張檢視未推送截圖（T0040 ×5、T0042、T0047 ×2、T0048）：無 token、email、帳號 ID、完整使用者路徑；工單文字掃描無 token / email。Windows 使用者名稱 `Gower` 出現在 9 個工單路徑中（其中 7 個 5 月起已公開，且與 git author 名稱相同），不視為新增外洩。T0041 加入 push 前隱私掃描步驟。

---

## ⏳ 待處理事項
- BUG-001：CLOSED；使用者安裝測試確認 T0031 解決 native title bar / deactive 問題。
- BUG-002：CLOSED；使用者安裝測試確認背景 shell 不再顯示終端視窗。
- BUG-003：CLOSED；使用者安裝測試確認 System Tray icon 正確。
- PLAN-003：DONE；T0021 Tauri runtime macaron theme persistence 已通過；T0020 使用者安裝測試已驗收。
- PLAN-002：DONE；T0017 Tauri runtime language persistence 已通過；T0016 使用者安裝測試已驗收。
- BUG-004：CLOSED；使用者安裝 `v0.6.26` 實測通過。
- BUG-005：CLOSED；使用者 `v0.6.27` 實測通過。about-dialog / side-nav 由 T0035 處理。
- 無 Windows release 阻塞待辦。
- 後續小問題已排單（D076）：T0045–T0048。
- PLAN / BUG 追蹤已啟用；EXP 追蹤尚未啟用。

---

## 🔍 環境快照
> 最後掃描：2026-10-15 10:37 (UTC+8)

| 偵測項 | 狀態 | 備註 |
|--------|------|------|
| BMad-Method | ❌ | 未偵測到 `_bmad/` |
| ECC 學習 | ✅ Level 1 | `~/.claude/homunculus/` 存在 |
| bmad-guide skill | ✅ | 可用 |
| mem0 REST | ✅ | `memsync status --json` 成功 |
| 終端環境 | ✅ BAT | `TERM_PROGRAM=better-agent-terminal` |
| BAT 終端 | ✅ 可派發 | PowerShell 可見 `BAT_SESSION=1`、PORT/TOKEN/TERMINAL_ID/WORKSPACE_ID 齊全；helper `C:\Program Files\BetterAgentTerminal\resources\scripts` |
| ct-exec | ✅ | 已安裝 |
| ct-done | ✅ | 已安裝 |
| ct-status | ✅ | 已安裝 |
| ct-evolve | ✅ | 已安裝 |
| ct-insights | ✅ | 已安裝 |
| ct-fieldguide | ✅ | 已安裝 |
| ct-help | ✅ | 已安裝 |
| _archive/ | ✅ | 2026-10-15 歸檔 37 張（workorders 31 / bugs 3 / plans 3）；熱區剩 T0032、T0033、BUG-004 |
| _playbooks/ | 📋 | 未建立 |
| _decision-log | 🆕 | 可建立 |
| 跨專案參照 | 📋 | 無關聯 |
| Global 學習 | ✅ | 0 patterns, 26 playbooks |
| BUG/PLAN 追蹤 | ✅ | PLAN:3；BUG:3（project config 啟用） |
| 實驗追蹤 | 📋 | 未啟用（使用預設值） |
| 設定來源 | project | `_ct-workorders/_tower-config.yaml` |
| 能力等級 | Level 1 | Core + ECC/memsync 可用，Project 層尚未初始化 |
