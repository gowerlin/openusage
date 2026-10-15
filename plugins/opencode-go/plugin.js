(function () {
  const PROVIDER_ID = "opencode-go";
  const AUTH_PATH = "~/.local/share/opencode/auth.json";
  const USAGE_URL = "https://opencode.ai/zen/go/v1/usage";
  const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  // Untouched rolling window: API answers resetsAt = now + 5h (whole seconds).
  const PLACEHOLDER_RESET_TOLERANCE_MS = 2000;

  function loadAuthKey(ctx) {
    if (!ctx.host.fs.exists(AUTH_PATH)) return null;

    let text;
    try {
      text = ctx.host.fs.readText(AUTH_PATH);
    } catch (e) {
      ctx.host.log.error("opencode auth read failed: " + String(e));
      throw "Couldn't read OpenCode's auth.json. Check its file permissions or log into OpenCode Go again.";
    }
    const parsed = ctx.util.tryParseJson(text);
    if (!parsed || typeof parsed !== "object") {
      throw "OpenCode's auth.json is not valid JSON. Log into OpenCode Go again.";
    }
    const entry = parsed[PROVIDER_ID];
    if (!entry || typeof entry !== "object") return null;
    const key = typeof entry.key === "string" ? entry.key.trim() : "";
    return key || null;
  }

  function readHeader(headers, name) {
    if (!headers || typeof headers !== "object") return null;
    const target = name.toLowerCase();
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === target) return headers[key];
    }
    return null;
  }

  function errorType(json) {
    const error = json && typeof json === "object" ? json.error : null;
    if (!error || typeof error !== "object") return null;
    const type = typeof error.type === "string" ? error.type.trim() : "";
    return type || null;
  }

  function parseWindow(ctx, raw) {
    if (!raw || typeof raw !== "object") return null;
    const percent = Number(raw.percent);
    const resetMs = ctx.util.parseDateMs(raw.resetsAt);
    if (!Number.isFinite(percent) || resetMs === null) return null;
    return {
      used: Math.max(0, Math.min(100, percent)),
      resetMs,
    };
  }

  function buildLine(ctx, label, window, periodMs, resetsAt) {
    return ctx.line.progress({
      label,
      used: window.used,
      limit: 100,
      format: { kind: "percent" },
      resetsAt,
      periodDurationMs: periodMs,
    });
  }

  function buildLines(ctx, json, referenceMs) {
    const usage = json && typeof json === "object" ? json.usage : null;
    if (!usage || typeof usage !== "object") return null;
    const rolling = parseWindow(ctx, usage.rolling);
    const weekly = parseWindow(ctx, usage.weekly);
    const monthly = parseWindow(ctx, usage.monthly);
    if (!rolling || !weekly || !monthly) return null;

    // 0% session whose reset sits exactly one period out = placeholder, not a real reset.
    let sessionReset = ctx.util.toIso(rolling.resetMs);
    if (
      rolling.used === 0 &&
      Math.abs(rolling.resetMs - referenceMs - FIVE_HOURS_MS) <=
        PLACEHOLDER_RESET_TOLERANCE_MS
    ) {
      sessionReset = null;
    }

    return [
      buildLine(ctx, "Session", rolling, FIVE_HOURS_MS, sessionReset),
      buildLine(ctx, "Weekly", weekly, WEEK_MS, ctx.util.toIso(weekly.resetMs)),
      buildLine(
        ctx,
        "Monthly",
        monthly,
        MONTH_MS,
        ctx.util.toIso(monthly.resetMs),
      ),
    ];
  }

  function probe(ctx) {
    const apiKey = loadAuthKey(ctx);
    if (!apiKey) {
      throw "OpenCode Go not detected. Log in with OpenCode Go first.";
    }

    let resp, json;
    try {
      const result = ctx.util.requestJson({
        method: "GET",
        url: USAGE_URL,
        headers: {
          Authorization: "Bearer " + apiKey,
          Accept: "application/json",
        },
        timeoutMs: 15000,
      });
      resp = result.resp;
      json = result.json;
    } catch (e) {
      ctx.host.log.error("opencode go usage request failed: " + String(e));
      throw "Request failed. Check your connection.";
    }

    if (resp.status === 401) {
      throw "OpenCode Go key was rejected. Log into OpenCode Go again.";
    }
    if (resp.status === 403 && errorType(json) === "EntitlementError") {
      throw "No OpenCode Go subscription on this key.";
    }
    if (resp.status < 200 || resp.status >= 300) {
      throw "Request failed (HTTP " + resp.status + "). Try again later.";
    }

    const dateMs = ctx.util.parseDateMs(readHeader(resp.headers, "date"));
    const lines = buildLines(ctx, json, dateMs === null ? Date.now() : dateMs);
    if (!lines) {
      throw "Could not parse usage data.";
    }

    return { plan: "Go", lines };
  }

  globalThis.__openusage_plugin = { id: PROVIDER_ID, probe };
})();
