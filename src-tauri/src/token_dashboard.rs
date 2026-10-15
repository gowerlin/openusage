//! Side-nav launcher for the TokenUsageInsights dashboard (doggy8088/TokenUsageInsights, MIT).
//! Runs the installed command or `npx --yes token-usage-insights` in the background,
//! waits for the port, opens the browser, and ends only the process tree it started.

use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Stdio};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

use crate::plugin_engine::host_api::{
    CcusageJob, CcusageRunnerKind, background_command, ccusage_enriched_path, redact_log_message,
    resolve_ccusage_runner_binary,
};

const PORT: u16 = 3003;
const DASHBOARD_URL: &str = "http://localhost:3003";
// `@latest`: a bare name lets npx reuse a stale `_npx` cache (D111).
const PACKAGE_SPEC: &str = "token-usage-insights@latest";
const README_URL: &str = "https://github.com/doggy8088/TokenUsageInsights#readme";
const READY_TIMEOUT: Duration = Duration::from_secs(90);
const POLL_INTERVAL: Duration = Duration::from_millis(500);
const CONNECT_TIMEOUT: Duration = Duration::from_millis(300);

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum LaunchResult {
    /// Already running (maybe started by the user); browser opened, process not managed.
    Opened,
    /// Started by OpenUsage; browser opened.
    Started,
    NotInstalled {
        hint: String,
    },
    Failed {
        reason: String,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStatus {
    pub running: bool,
    pub managed: bool,
}

struct Managed {
    child: Child,
    job: Option<CcusageJob>,
}

#[derive(Default)]
pub struct TokenDashboard {
    managed: Mutex<Option<Managed>>,
    /// Held for the whole launch; a second caller waits and reuses the stored result.
    launch: Mutex<Option<LaunchResult>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum Runner {
    Installed(PathBuf),
    Npx(String),
}

#[derive(Debug, PartialEq, Eq)]
enum WaitOutcome {
    Ready,
    Exited(Option<i32>),
    TimedOut,
}

fn installed_command_path(home: &Path) -> PathBuf {
    if cfg!(windows) {
        home.join("bin").join("token-usage-insights.cmd")
    } else {
        home.join(".local/bin/token-usage-insights")
    }
}

fn choose_runner(installed: Option<PathBuf>, npx: Option<String>) -> Option<Runner> {
    installed
        .map(Runner::Installed)
        .or_else(|| npx.map(Runner::Npx))
}

fn runner_program_and_args(runner: &Runner) -> (String, Vec<&'static str>) {
    match runner {
        // No `--no-auto-update`: the installed command keeps its built-in updater (D111).
        Runner::Installed(path) => (path.to_string_lossy().to_string(), Vec::new()),
        Runner::Npx(npx) => (npx.clone(), vec!["--yes", PACKAGE_SPEC]),
    }
}

fn not_installed_hint() -> String {
    format!("Requires Node.js 18.18+ (npx) or the TokenUsageInsights install script: {README_URL}")
}

fn wait_outcome_to_result(outcome: WaitOutcome) -> LaunchResult {
    match outcome {
        WaitOutcome::Ready => LaunchResult::Started,
        WaitOutcome::Exited(code) => LaunchResult::Failed {
            reason: match code {
                Some(code) => format!("dashboard exited before it was ready (exit code {code})"),
                None => "dashboard exited before it was ready (no exit code)".to_string(),
            },
        },
        WaitOutcome::TimedOut => LaunchResult::Failed {
            reason: format!(
                "dashboard was not ready on port {PORT} within {}s",
                READY_TIMEOUT.as_secs()
            ),
        },
    }
}

fn port_open(addr: SocketAddr) -> bool {
    TcpStream::connect_timeout(&addr, CONNECT_TIMEOUT).is_ok()
}

fn dashboard_running() -> bool {
    port_open(SocketAddr::from(([127, 0, 0, 1], PORT)))
}

/// Polls until ready, the child exits (`exited` returns its code), or the deadline passes.
fn wait_until_ready(
    timeout: Duration,
    interval: Duration,
    mut is_ready: impl FnMut() -> bool,
    mut exited: impl FnMut() -> Option<Option<i32>>,
) -> WaitOutcome {
    let deadline = Instant::now() + timeout;
    loop {
        if is_ready() {
            return WaitOutcome::Ready;
        }
        if let Some(code) = exited() {
            return WaitOutcome::Exited(code);
        }
        if Instant::now() >= deadline {
            return WaitOutcome::TimedOut;
        }
        std::thread::sleep(interval);
    }
}

fn spawn_runner(runner: &Runner) -> std::io::Result<Managed> {
    let (program, args) = runner_program_and_args(runner);
    let mut command = background_command(&program);
    command
        .args(args)
        // Fixed values: the port we poll, and no LAN exposure (upstream default HOST is 0.0.0.0).
        .env("PORT", PORT.to_string())
        .env("HOST", "127.0.0.1")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    if let Some(path) = ccusage_enriched_path() {
        command.env("PATH", path);
    }
    // npx reads the cwd's package.json; a project dir with overrides fails (EOVERRIDE).
    if let Some(home) = dirs::home_dir() {
        command.current_dir(home);
    }
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        command.process_group(0);
    }

    let child = command.spawn()?;
    let job = match CcusageJob::assign(&child) {
        Ok(job) => Some(job),
        Err(error) => {
            log::warn!("token dashboard: job object assign failed: {error}");
            None
        }
    };
    Ok(Managed { child, job })
}

fn kill_managed(mut managed: Managed) {
    #[cfg(windows)]
    if let Some(job) = managed.job.as_ref() {
        if let Err(error) = job.terminate() {
            log::warn!("token dashboard: terminate job failed: {error}");
        }
    }
    #[cfg(unix)]
    if let Err(error) =
        crate::plugin_engine::host_api::kill_ccusage_process_group(managed.child.id())
    {
        log::warn!("token dashboard: kill process group failed: {error}");
    }
    let _ = managed.child.kill();
    let _ = managed.child.wait();
    drop(managed.job.take());
}

fn open_dashboard(app: &AppHandle) -> Result<(), String> {
    app.opener()
        .open_url(DASHBOARD_URL, None::<&str>)
        .map_err(|error| format!("failed to open browser: {error}"))
}

fn launch_blocking(app: &AppHandle) -> LaunchResult {
    let state = app.state::<TokenDashboard>();
    let mut slot = match state.launch.try_lock() {
        Ok(slot) => slot,
        Err(_) => {
            // A launch is in flight: wait for it and reuse its result (no second spawn/open).
            let slot = state.launch.lock().unwrap_or_else(|e| e.into_inner());
            return slot.clone().unwrap_or(LaunchResult::Failed {
                reason: "previous launch did not finish".to_string(),
            });
        }
    };
    let result = launch_locked(app, &state);
    match &result {
        LaunchResult::Opened | LaunchResult::Started => log::info!("token dashboard: {result:?}"),
        _ => log::warn!(
            "token dashboard: {}",
            redact_log_message(&format!("{result:?}"))
        ),
    }
    *slot = Some(result.clone());
    result
}

fn launch_locked(app: &AppHandle, state: &TokenDashboard) -> LaunchResult {
    if dashboard_running() {
        return match open_dashboard(app) {
            Ok(()) => LaunchResult::Opened,
            Err(reason) => LaunchResult::Failed { reason },
        };
    }

    let installed = dirs::home_dir()
        .map(|home| installed_command_path(&home))
        .filter(|path| path.is_file());
    let npx = if installed.is_some() {
        None
    } else {
        resolve_ccusage_runner_binary(CcusageRunnerKind::Npx)
    };
    let Some(runner) = choose_runner(installed, npx) else {
        return LaunchResult::NotInstalled {
            hint: not_installed_hint(),
        };
    };

    // Port is closed, so a previously managed tree is dead or stuck: end it and start fresh.
    let old = state
        .managed
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .take();
    if let Some(old) = old {
        kill_managed(old);
    }
    let mut managed = match spawn_runner(&runner) {
        Ok(managed) => managed,
        Err(error) => {
            return LaunchResult::Failed {
                reason: format!("failed to start dashboard: {error}"),
            };
        }
    };

    let outcome = wait_until_ready(
        READY_TIMEOUT,
        POLL_INTERVAL,
        dashboard_running,
        || match managed.child.try_wait() {
            Ok(Some(status)) => Some(status.code()),
            Ok(None) => None,
            Err(_) => Some(None),
        },
    );
    if outcome != WaitOutcome::Ready {
        kill_managed(managed);
        return wait_outcome_to_result(outcome);
    }
    *state.managed.lock().unwrap_or_else(|e| e.into_inner()) = Some(managed);

    match open_dashboard(app) {
        Ok(()) => LaunchResult::Started,
        Err(reason) => LaunchResult::Failed { reason },
    }
}

#[tauri::command]
pub async fn launch_token_dashboard(app: AppHandle) -> LaunchResult {
    match tauri::async_runtime::spawn_blocking(move || launch_blocking(&app)).await {
        Ok(result) => result,
        Err(error) => LaunchResult::Failed {
            reason: format!("launch task failed: {error}"),
        },
    }
}

#[tauri::command]
pub async fn token_dashboard_status(app: AppHandle) -> DashboardStatus {
    // Do not judge by the direct child: the installed `.cmd` wrapper (cmd.exe) exits when
    // the dashboard self-updates and re-spawns, while the new process stays in our job.
    let has_managed = app
        .state::<TokenDashboard>()
        .managed
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .is_some();
    let running = tauri::async_runtime::spawn_blocking(dashboard_running)
        .await
        .unwrap_or(false);
    DashboardStatus {
        running,
        managed: running && has_managed,
    }
}

/// Ends the process tree OpenUsage started (app exit). User-started dashboards are untouched.
pub fn shutdown(app: &AppHandle) {
    let Some(state) = app.try_state::<TokenDashboard>() else {
        return;
    };
    let managed = state
        .managed
        .lock()
        .unwrap_or_else(|e| e.into_inner())
        .take();
    if let Some(managed) = managed {
        log::info!("token dashboard: stopping managed dashboard on exit");
        kill_managed(managed);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    #[test]
    fn installed_command_path_matches_install_script_location() {
        let home = Path::new("home");
        let expected = if cfg!(windows) {
            home.join("bin").join("token-usage-insights.cmd")
        } else {
            home.join(".local/bin/token-usage-insights")
        };
        assert_eq!(installed_command_path(home), expected);
    }

    #[test]
    fn choose_runner_prefers_installed_then_npx() {
        let installed = PathBuf::from("bin/token-usage-insights.cmd");
        assert_eq!(
            choose_runner(Some(installed.clone()), Some("npx.cmd".into())),
            Some(Runner::Installed(installed))
        );
        assert_eq!(
            choose_runner(None, Some("npx.cmd".into())),
            Some(Runner::Npx("npx.cmd".into()))
        );
        assert_eq!(choose_runner(None, None), None);
    }

    #[test]
    fn runner_args_are_fixed() {
        let (program, args) = runner_program_and_args(&Runner::Npx("npx.cmd".into()));
        assert_eq!(program, "npx.cmd");
        assert_eq!(args, vec!["--yes", "token-usage-insights@latest"]);

        let (_, args) = runner_program_and_args(&Runner::Installed(PathBuf::from("x")));
        assert!(args.is_empty());
    }

    #[test]
    fn not_installed_hint_mentions_node_and_readme() {
        let hint = not_installed_hint();
        assert!(hint.contains("Node.js 18.18"));
        assert!(hint.contains(README_URL));
    }

    #[test]
    fn wait_outcomes_map_to_results() {
        assert_eq!(
            wait_outcome_to_result(WaitOutcome::Ready),
            LaunchResult::Started
        );
        assert!(matches!(
            wait_outcome_to_result(WaitOutcome::Exited(Some(2))),
            LaunchResult::Failed { reason } if reason.contains("exit code 2")
        ));
        assert!(matches!(
            wait_outcome_to_result(WaitOutcome::TimedOut),
            LaunchResult::Failed { reason } if reason.contains("90s")
        ));
    }

    #[test]
    fn wait_until_ready_returns_ready_after_polls() {
        let mut polls = 0;
        let outcome = wait_until_ready(
            Duration::from_secs(5),
            Duration::from_millis(1),
            || {
                polls += 1;
                polls >= 3
            },
            || None,
        );
        assert_eq!(outcome, WaitOutcome::Ready);
        assert_eq!(polls, 3);
    }

    #[test]
    fn wait_until_ready_reports_early_exit_and_timeout() {
        let exited = wait_until_ready(
            Duration::from_secs(5),
            Duration::from_millis(1),
            || false,
            || Some(Some(1)),
        );
        assert_eq!(exited, WaitOutcome::Exited(Some(1)));

        let timed_out = wait_until_ready(
            Duration::from_millis(5),
            Duration::from_millis(1),
            || false,
            || None,
        );
        assert_eq!(timed_out, WaitOutcome::TimedOut);
    }

    #[test]
    fn port_open_detects_listener() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        assert!(port_open(addr));
        drop(listener);
        assert!(!port_open(addr));
    }

    #[test]
    fn launch_result_serializes_with_kind_tag() {
        let json = serde_json::to_value(LaunchResult::NotInstalled { hint: "h".into() }).unwrap();
        assert_eq!(
            json,
            serde_json::json!({ "kind": "notInstalled", "hint": "h" })
        );
        let json = serde_json::to_value(LaunchResult::Opened).unwrap();
        assert_eq!(json, serde_json::json!({ "kind": "opened" }));
    }
}
