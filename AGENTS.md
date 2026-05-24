# OpenUsage

## Instructions
- CRITICAL: Use simple, concise language. Avoid overtechnical jargon.
- Be radically precise. No fluff. Pure information only (drop grammar; min tokens).
- Critical: DO NOT OVER-ENGINEER! This app is typically used by 2-5 people, internally only.

## Guardrails
- Use `trash` for deletes
- Use `mv` / `cp` to move and copy files
- Bugs: add regression test when it fits
- Keep files <~400 LOC; split/refactor as needed
- Simplicity first: handle only important cases; no enterprise over-engineering/fallbacks
- New functionality: small OR absolutely necessary
- NEVER delete files, folders or other data unless explicilty approved or part of a plan
- Before writing code, stricly follow the below research rules

## Research
- Prefer skills if available over research.
- Prefer researched knowledge over existing knowledge when skills are unavailable.
- Research: Exa to websearch early, and Ref to seek specific documention or web fetch.
- Best results: Quote exact errors; prefer 2025-2026+ sources.

## Error Handling
- Expected issues: explicit result types (not throw/try/catch).
- Unexpected issues: fail LOUD (throw/console.error + toast.error); NEVER add silent fallbacks.

## Before Creating Pull Request
- Before creating a PR or pushing to main, ensure that `README.md` is updated with what plugins are supported.
- On any plugin change/new plugin, audit plugin-exposed request/response fields against `src-tauri/src/plugin_engine/host_api.rs` redaction lists and add/update tests for gaps. Compare with existing plugins for patterns.
- In `plugin.json`, set `brandColor` to the provider's real brand color.
- Plugin SVG logos must use `currentColor` so icon theming works correctly.
- If the PR includes visual changes, refuse to create it without providing before/after screenshots.

## Project Memories
Use below list to store and recall user notes when asked to do so.

- Use this list when asked to remember things. Keep each list item concise.
- Tauri IPC: JS must use camelCase (`{ batchId, pluginIds }`), Tauri auto-converts to Rust's snake_case. Never send snake_case from JS—params silently won't match.
- tauri-action `latest.json`: Parallel matrix builds are safe—action fetches existing `latest.json`, merges platform entries, re-uploads. No `max-parallel: 1` needed.


<claude-mem-context>
# Memory Context

# [openusage] recent context, 2026-05-24 7:26pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (21,015t read) | 433,010t work | 95% savings

### May 24, 2026
S7452 Windows port transparent window debugging - window dragging works but background transparency effect not rendering (May 24, 4:39 PM)
S7451 Initial session greeting (May 24, 4:39 PM)
S7453 User installed T0028 diagnostic build, reproduced BUG-001 native title bar issue, and requested log location for analysis (May 24, 4:52 PM)
16643 4:54p 🔵 Windows transparent window implementation uses active cursor event masking
16644 " 🔵 Windows panel implementation lacks explicit transparency configuration present in macOS code
16645 " 🔵 Windows shadow control API exists but is not invoked in openusage panel code
16646 4:55p 🔵 Windows GDI region APIs available but not used for visual transparency masking
16647 " 🔵 Tauri set_shadow API controls Windows undecorated window visual effects including rounded corners
16648 5:45p 🔵 Tray icon flash from template-mode race between backend initialization and frontend updates
16649 " 🔵 Frontend tray hook unconditionally enables template mode immediately after backend initialization
16650 5:46p ✅ Added failing test for Windows tray icon preservation strategy
16651 " 🔴 Implemented Windows platform detection to preserve backend desktop tray icon
16652 " ✅ Windows tray icon preservation test now passing after platform detection fix
16653 5:47p ✅ Full App test suite passes with Windows tray icon fix, confirming no regressions
16654 " ✅ Complete test suite passes with 1139 tests validating Windows tray icon fix has no regressions
16655 5:48p ✅ Frontend production build succeeds with Windows tray icon platform detection code
16656 " 🔵 Tauri build blocked by missing LIBCLANG_PATH environment variable for rquickjs-sys bindgen
16657 5:49p 🔵 Setting LIBCLANG_PATH alone insufficient, requires full Visual Studio Developer Command Prompt environment
16658 5:51p ✅ Windows NSIS installer build succeeds with tray icon fix in VS Developer Command Prompt environment
16659 5:52p ✅ Created work order T0024 documenting Windows tray icon frontend fix and updated BUG-003 with complete root cause
16660 6:08p 🔵 Tauri application initialization sequence in lib.rs
16661 6:09p 🟣 Added automatic window chrome enforcement to panel hit test loop
16662 6:11p ✅ Built production release 0.6.24 with window chrome enforcement
16663 " ⚖️ Iterative fix strategy for Windows title bar async regression
16664 6:12p 🟣 Created dedicated panel_hit_test module for Windows window chrome management
16665 6:15p 🔵 Historical release workflow context retrieved from memory
16666 6:16p 🔵 Windows DWM non-client rendering APIs confirmed in windows-0.61.3 crate
16667 " ✅ Added Win32_Graphics_Dwm feature to windows crate dependency
16668 " 🟣 Implemented DWM non-client rendering disablement for custom window chrome
16669 6:17p 🔵 DWM non-client rendering changes validated by panel_hit_test unit tests
16670 " 🔵 Full test suite validates DWM implementation across all modules
16671 6:18p ✅ Production build successful with DWM non-client rendering implementation
16672 6:21p 🔵 Windows titlebar async regression resolved with continuous HWND style monitoring
16673 " ✅ Created T0027 work order documenting DWM non-client rendering disablement
16674 6:22p ✅ Updated BUG-001 with T0027 remediation and T0026 installation failure
16675 " ✅ Updated tower state to reflect T0027 DWM remediation status
16676 6:23p 🔵 DWM implementation verified with all formatting and test checks passing
16677 6:24p ✅ Production build successful with DWM non-client rendering implementation
16678 6:25p 🔵 Windows NSIS installer package verified with DWM implementation
16679 " ✅ Updated T0027 and BUG-001 workorders with fresh package metadata
16680 " ✅ Synchronized tracking document timestamps to package build completion time
16681 6:42p 🔵 OpenUsage Windows log locations discovered
16682 " 🔵 Multiple OpenUsage data directories found with different identifiers
16683 6:43p 🔵 Panel window trace log shows Windows panel mask monitor actively working
16684 6:44p 🔵 OpenUsage.log reveals Windows platform limitations and successful plugin operations
16685 " 🔵 Running OpenUsage process identified with executable in separate directory from data
16686 6:45p 🔵 OpenUsage main panel window exists but is not visible
16687 6:46p 🔴 Added configure_panel_window calls after show, focus, and hide operations
**16688** " 🔴 **Added enforce_chrome on every window event with before/after snapshots**
Enhanced trace_window_event in src-tauri/src/panel_hit_test.rs to proactively enforce chrome style stripping on every window event. The modification captures a before-snapshot (window_event_snapshot_before_enforce), calls enforce_chrome to strip window chrome bits (WS_CAPTION, WS_SYSMENU, WS_THICKFRAME), then captures an after-snapshot (window_event_snapshot_after_enforce) showing the enforcement effect. If enforcement fails, the error is logged as window_event_enforce_error with full event context. This addresses the root cause of the visibility issue where window inspection showed chrome style 0x04CB0000 (with chrome bits present) instead of the expected stripped styles 0x04000000 or 0x14000000 observed in earlier log entries. The before/after snapshots will reveal exactly when chrome styles revert during window lifecycle events (resize, focus, show, hide), enabling precise diagnosis of which window events trigger the reversion. This complements the panel.rs fix by enforcing correct window styling reactively on every window event rather than only during explicit show/hide/focus operations.
~467t 🛠️ 3,820

**16689** 6:48p ✅ **Successfully built Windows installer with panel visibility fixes**
Successfully compiled Windows NSIS installer incorporating the panel visibility fixes for OpenUsage v0.6.24. The build completed in 77.9 seconds and bundled 18 plugins (amp, antigravity, claude, codex, copilot, cursor, factory, gemini, grok, jetbrains-ai-assistant, kimi, kiro, minimax, opencode-go, perplexity, synthetic, windsurf, zai). All 109 unit tests passed, including the critical 9 panel_hit_test tests that verify chrome style stripping (strips_native_windows_title_bar_style_bits) and window region masking behavior. The build incorporated two key fixes: panel.rs now calls configure_panel_window after show/focus/hide operations to maintain window configuration across visibility changes, and panel_hit_test.rs now proactively enforces chrome style stripping on every window event with before/after snapshots for debugging. The resulting installer (5.28 MB) is ready for local testing to verify the fixes resolve the window visibility issue where hwnd 0x9A0052 reported Visible=False despite the process running normally.
~490t 🛠️ 583

**16690** " ✅ **Created T0029 workorder documenting panel chrome enforcement fixes**
Created comprehensive workorder documentation T0029-enforce-panel-chrome-after-window-state-changes.md summarizing the complete panel chrome enforcement debugging and fix session. The document captures the investigation flow in Traditional Chinese: user reproduced BUG-001 native title bar leak after installing T0028, requested log analysis, which revealed logs at %APPDATA%\com.sunstory.openusage\logs and %LOCALAPPDATA%\com.sunstory.openusage\logs. Trace analysis showed initial chrome pruning worked (style=0x04000000), but resize events after focus loss reverted styles to 0x14CB0000 with has_chrome_bits=true, proving Tauri/Tao window state paths write decorated style bits back. The fix adds configure_panel_window calls immediately after show/focus/hide operations in panel.rs and enforce_chrome with before/after snapshots on every window event in panel_hit_test.rs. All verification passed including 109 unit tests and Windows NSIS build producing 5,288,954 byte installer. The workorder marks the task DONE pending final visual acceptance testing after user reinstalls the fixed version to confirm no native title bar appears during window state transitions.
~595t 🛠️ 5,228

**16691** 6:49p ✅ **Updated BUG-001 bug tracker with T0029 fix information and T0028 failure analysis**
Updated BUG-001 bug tracker document to reflect the complete diagnostic and fix cycle through T0028 and T0029. Added T0028 acceptance failure section documenting that user confirmed issue reproduction after installing the diagnostic build. Trace analysis revealed the root cause: Focused(false) followed by Resized events cause window style to revert from stripped 0x04000000 to decorated 0x14CB0000 with has_chrome_bits=true, proving Tauri/Tao window state code writes native chrome bits (WS_CAPTION, WS_SYSMENU) back to the HWND. The background monitoring loop prunes the style back to 0x14000000 approximately 3ms later, but this delay allows the native title bar to become visible or leave residual artifacts. Live HWND inspection of the hidden panel confirmed style=0x04CB0000, further proving state transitions restore decorated styles. Added T0029 fix documentation explaining the solution: enforce chrome synchronously immediately after show/focus/hide operations in panel.rs and on every non-Moved window event in panel_hit_test.rs with before/after diagnostic snapshots. Updated related workorder reference to T0029 with new installer details (5.28 MB, SHA256 hash). Bug status remains VERIFY pending user visual acceptance testing after reinstalling the fixed version.
~628t 🛠️ 6,625

S7454 User reproduced BUG-001 native title bar issue after installing T0028 diagnostic build and requested log file locations for analysis (May 24, 6:52 PM)
S7455 Observer session monitoring T0030 verification and user preparation for trace-based acceptance testing (May 24, 6:52 PM)
**16692** 6:53p 🔵 **T0029 fix verification shows successful chrome bit prevention during window state transitions**
User reinstalled OpenUsage with T0029 fixes and new trace evidence confirms the synchronous chrome enforcement strategy successfully prevents chrome bit reversion. The enhanced trace shows a fresh app instance (hwnd 0x3110D8) with before/after enforcement snapshots captured at every window event per T0029 modifications. Critically, all window_event_snapshot_before_enforce and window_event_snapshot_after_enforce pairs show has_chrome_bits=false with styles remaining at stripped 0x04000000 or 0x14000000 throughout focus/blur/resize transitions. This contrasts sharply with T0028 trace where Focused(false) followed by Resized caused style reversion from 0x04000000 to 0x14CB0000 with has_chrome_bits=true. The chrome_style_pruned events visible in new trace (before_style=0x14CB0000 after_style=0x14000000) are from background monitoring detecting cursor_ignore_changed operations that temporarily add WS_EX_TRANSPARENT (exstyle changes from 0x00040010 to 0x000C0030), not from window state transition reversions. The before/after snapshot pairs being identical demonstrates that synchronous enforce_chrome calls in panel.rs (after show/focus/hide) and panel_hit_test.rs (on every window event) successfully prevent Tauri/Tao from writing chrome bits back during window state transitions. This is strong evidence T0029 has resolved BUG-001 root cause.
~645t 🔍 29,193

S7456 T0031 completion verification sweep - Windows native subclass implementation to eliminate native title bar during panel deactivation (May 24, 7:20 PM)
**Investigated**: Primary session executed systematic pre-completion verification following verification-before-completion skill: examined Tauri library structure (run_on_main_thread implementation in tauri-runtime-wry-2.11.1), lib.rs app initialization flow (start_mask at line 569, on_window_event at line 506), git repository state (diff --check, status), T0031 workorder documentation, Cargo.toml dependencies, panel_hit_test.rs implementation, and Control Tower tracking file cross-references

**Learned**: Tauri run_on_main_thread routes tasks through Message::Task to main event loop; start_mask called during app.setup; Win32_UI_Shell feature provides SetWindowSubclass API; subclass installation occurs at multiple lifecycle points (init, show_panel) with idempotency protection; all T0031 implementation claims verified against actual source code and documentation

**Completed**: T0031 implementation verification complete: Win32_UI_Shell feature confirmed in Cargo.toml line 53; windows_panel_subclass_policy (line 133), install_hwnd_subclass (line 301), panel_subclass_proc (line 328) confirmed in panel_hit_test.rs; Control Tower documentation verified (BUG-001, _tower-state.md D051, _bug-tracker.md all reference T0031 with timestamp 2026-05-24T19:14:36+08:00); git diff --check passed (exit 0, only pre-existing CRLF warnings); repository state clean with expected file modifications

**Next Steps**: Primary session has completed verification sweep and is ready for user acceptance testing phase - awaiting user installation of OpenUsage_0.6.24_x64-setup.exe (SHA256: 4FEDB23E41083D63F1AF7ACC4939122B2D04AB0F9BBE94E62006A565E4BE1126) and runtime verification that native title bar no longer appears during panel deactivate/focus transitions


Access 433k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>