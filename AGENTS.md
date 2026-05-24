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

# [openusage] recent context, 2026-05-24 8:11pm GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (18,832t read) | 290,006t work | 94% savings

### May 24, 2026
S7452 Windows port transparent window debugging - window dragging works but background transparency effect not rendering (May 24, 4:39 PM)
S7451 Initial session greeting (May 24, 4:39 PM)
S7453 User installed T0028 diagnostic build, reproduced BUG-001 native title bar issue, and requested log location for analysis (May 24, 4:52 PM)
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
16688 " 🔴 Added enforce_chrome on every window event with before/after snapshots
16689 6:48p ✅ Successfully built Windows installer with panel visibility fixes
16690 " ✅ Created T0029 workorder documenting panel chrome enforcement fixes
16691 6:49p ✅ Updated BUG-001 bug tracker with T0029 fix information and T0028 failure analysis
S7454 User reproduced BUG-001 native title bar issue after installing T0028 diagnostic build and requested log file locations for analysis (May 24, 6:52 PM)
S7455 Observer session monitoring T0030 verification and user preparation for trace-based acceptance testing (May 24, 6:52 PM)
16692 6:53p 🔵 T0029 fix verification shows successful chrome bit prevention during window state transitions
S7456 T0031 completion verification sweep - Windows native subclass implementation to eliminate native title bar during panel deactivation (May 24, 7:20 PM)
16693 7:31p 🔴 Bug tracker parser now handles title-case section headings
16694 " 🔄 Bug tracker parser enhanced with punctuation-insensitive matching
16695 " 🔵 Parser fix verified against real openusage bug tracker data
16696 7:32p 🔵 Production build verified successfully after parser changes
16697 7:37p 🔵 GitHub release with tag 0.6.25 only packaged source code due to tag pattern mismatch
16698 7:38p 🔵 Release 0.6.25 has no build artifacts because tag lacks v prefix required by publish workflow
16699 " 🔵 Tag 0.6.25 exists only on remote GitHub repository, not in local clone
16700 " 🔵 Tag 0.6.25 points to commit with version still set to 0.6.24 in package.json
16701 7:39p 🔵 All version files at tag 0.6.25 remain at 0.6.24 confirming no version bump was performed
16702 7:43p 🔵 CI pipeline failed on version validation for v0.6.25 release
16703 7:44p 🔵 Root cause identified: version files still at 0.6.24 when tagged as v0.6.25
16704 " 🔵 GitHub release v0.6.25 published with no build artifacts
16705 7:45p 🔴 Version files bumped from 0.6.24 to 0.6.25 to match git tag
16706 " ✅ Version bump committed to repository as f8e31e9
16707 7:46p ✅ Version bump pushed to gowerlin/openusage main branch
16708 " ✅ Deleted broken v0.6.25 release and tag from GitHub
16709 " ✅ Removed stale v0.6.25 tags from local and remote repositories
16710 7:47p 🟣 Created and pushed corrected v0.6.25 tag to remote repository
16711 " 🔵 New CI workflow triggered for corrected v0.6.25 tag
16712 7:49p 🔵 Version validation step passed successfully in new CI run
16713 7:55p 🔵 GitHub Actions workflow watch timeout
16714 " 🔵 Tauri Windows publish workflow in progress at build step
16715 7:59p ✅ v0.6.25 Windows Release Published
16716 " 🔵 Auto-Update Infrastructure Verified for v0.6.25
16717 8:00p 🔵 openusage Project Uses BMad Control Tower for Windows Port Work
16718 8:01p 🔵 Control Tower YOLO Mode Enabled with Complete Windows Port Project History
16719 8:02p 🔵 Complete Windows MVP Project with Zero Outstanding Work
16720 8:03p ✅ Manual Control Tower Sync Implementation via Inline Node.js Script
16721 " ✅ Tower State Updated for v0.6.25 Release Completion
16722 8:04p 🔵 Control Tower Sync Operation Modified Four Files Including AGENTS.md
**16723** " 🔴 **Removed Trailing Blank Lines from Generated Control Tower Index Files**
Fixed formatting issues in generated control tower index files by removing trailing blank lines that triggered git diff --check warnings. The inline Node.js sync script had added blank lines at end-of-file when regenerating _bug-tracker.md and _backlog.md, which violated repository whitespace conventions. Applied targeted patches to both files removing the trailing newlines while preserving all functional content including status breakdowns (3 bugs CLOSED, 3 plans DONE), updated timestamps, and table structures. The git diff --check command now passes cleanly with only informational LF-to-CRLF warnings remaining for Windows repository conventions. Final verification via Node.js regex checks confirms all critical content intact: bug tracker shows CLOSED:3, backlog shows DONE:3, tower state documents v0.6.25 release and decision D054. The three control tower files now ready for commit with proper formatting and no whitespace violations.
~386t 🛠️ 4,920

**16724** 8:05p 🔄 **Removed Extraneous Blank Lines from Empty Status Sections**
Further refined the generated control tower index files by removing extraneous blank lines that appeared after empty status section tables. The initial inline Node.js sync script had added blank lines after each section header table (Open, Fixing, Fixed, Verify, Closed in bug tracker; Active, Completed, Dropped in backlog) even when the section was empty. Removed these unnecessary blank lines through targeted patches, reducing visual clutter and minimizing the git diff footprint. The bug tracker change count dropped from 6 lines to 2 lines, and the backlog from 3 lines to 2 lines, bringing the total diff from 28 lines changed down to 23 lines. The final state shows only essential changes: updated generated_at timestamps in both index files (from 15:52:18/19:23:00 to 20:01:42), and substantive tower state updates documenting v0.6.25 release completion with decision D054. All whitespace checks continue to pass cleanly.
~394t 🛠️ 6,559

**16725** 8:10p 🔵 **Bug tracker file shows 0 open bugs, 3 closed bugs**
Investigation was triggered by a question about why bugs still appear as "Open" in the BAT interface. A grep search of the bug tracker markdown file revealed that the source data actually shows the correct state: all three tracked bugs (BUG-001 through BUG-003) are properly marked as closed, with 0 bugs in the open state. This suggests a potential discrepancy between the markdown source file and how the bug list is being displayed or rendered in the BAT interface.
~246t 🔍 1,373

**16726** " 🔵 **Bug status parsing logic uses case-insensitive heading detection**
Investigation of the bug status parsing mechanism revealed that the TypeScript code uses a sectionToStatus function to map markdown section headings to bug statuses. The function normalizes headings to uppercase, creates a compact version by removing whitespace and punctuation, then checks for keywords in priority order. The logic supports both English and Chinese text (e.g., 'CLOSED' or '已關閉'). A grep of the compiled app.asar confirmed this logic is present in the installed application, suggesting the parsing code itself is correct and deployed.
~299t 🔍 12,613

**16727** " 🔵 **Installed BAT app.asar last modified 2026-05-23 21:13:48**
Verification of the installed BetterAgentTerminal application showed the app.asar bundle was built on May 23, 2026 at 9:13:48 PM, making it approximately one day old. The bundle contains the bug status parsing logic that was found in the source repository. This timestamp provides a reference point for determining whether recent code changes have been deployed to the production installation. The presence of the parsing logic in the bundle confirms the code is deployed, but the UI issue persisting suggests the problem may be in how the parsed data is rendered or displayed rather than in the parsing itself.
~269t 🔍 12,613


Access 290k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>