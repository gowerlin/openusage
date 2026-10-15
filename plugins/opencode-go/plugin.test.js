import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeCtx } from "../test-helpers.js";

const AUTH_PATH = "~/.local/share/opencode/auth.json";
const USAGE_URL = "https://opencode.ai/zen/go/v1/usage";
const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

// Upstream fixture: Tests/OpenUsageTests/OpenCodeUsageMapperTests.swift (sampleBody).
const SAMPLE_BODY = {
  usage: {
    rolling: {
      status: "ok",
      percent: 12,
      resetsAt: "2026-07-12T13:30:00.662Z",
    },
    weekly: { status: "ok", percent: 8, resetsAt: "2026-07-13T00:00:00.662Z" },
    monthly: {
      status: "rate-limited",
      percent: 100,
      resetsAt: "2026-08-04T11:18:32.662Z",
    },
  },
};

const loadPlugin = async () => {
  await import("./plugin.js");
  return globalThis.__openusage_plugin;
};

function setAuth(ctx, value = "go-key") {
  ctx.host.fs.writeText(
    AUTH_PATH,
    JSON.stringify({
      openai: { type: "oauth", access: "other-provider" },
      "opencode-go": { type: "api", key: value },
    }),
  );
}

function setResponse(ctx, status, body, headers = {}) {
  ctx.host.http.request.mockReturnValue({
    status,
    headers,
    bodyText: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function bodyAt(capturedMs, rollingPercent, rollingResetMs) {
  return {
    usage: {
      rolling: {
        percent: rollingPercent,
        resetsAt: new Date(rollingResetMs).toISOString(),
      },
      weekly: {
        percent: 1,
        resetsAt: new Date(capturedMs + 3 * 86400000).toISOString(),
      },
      monthly: {
        percent: 0,
        resetsAt: new Date(capturedMs + 20 * 86400000).toISOString(),
      },
    },
  };
}

describe("opencode-go plugin", () => {
  beforeEach(() => {
    delete globalThis.__openusage_plugin;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("ships plugin metadata with links and expected line layout", () => {
    const manifest = JSON.parse(
      readFileSync("plugins/opencode-go/plugin.json", "utf8"),
    );

    expect(manifest.id).toBe("opencode-go");
    expect(manifest.name).toBe("OpenCode Go");
    expect(manifest.brandColor).toBe("#000000");
    expect(manifest.links).toEqual([
      { label: "Console", url: "https://opencode.ai/auth" },
      { label: "Docs", url: "https://opencode.ai/docs/go/" },
    ]);
    expect(manifest.lines).toEqual([
      { type: "progress", label: "Session", scope: "overview", primaryOrder: 1 },
      { type: "progress", label: "Weekly", scope: "overview", period: "weekly" },
      { type: "progress", label: "Monthly", scope: "detail" },
    ]);
  });

  it("throws when auth.json is missing", async () => {
    const ctx = makeCtx();
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("OpenCode Go not detected");
    expect(ctx.host.http.request).not.toHaveBeenCalled();
  });

  it("throws when auth.json has no opencode-go key", async () => {
    const ctx = makeCtx();
    ctx.host.fs.writeText(AUTH_PATH, JSON.stringify({ openai: { key: "x" } }));
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("OpenCode Go not detected");
    expect(ctx.host.http.request).not.toHaveBeenCalled();
  });

  it("fails loud when auth.json is not valid json", async () => {
    const ctx = makeCtx();
    ctx.host.fs.writeText(AUTH_PATH, "{not json");
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("not valid JSON");
  });

  it("calls the official usage API with the Go key as bearer", async () => {
    const ctx = makeCtx();
    setAuth(ctx, "  go-secret-key  ");
    setResponse(ctx, 200, SAMPLE_BODY);

    const plugin = await loadPlugin();
    plugin.probe(ctx);

    const req = ctx.host.http.request.mock.calls[0][0];
    expect(req.method).toBe("GET");
    expect(req.url).toBe(USAGE_URL);
    expect(req.headers.Authorization).toBe("Bearer go-secret-key");
    expect(req.headers.Accept).toBe("application/json");
  });

  it("maps dashboard percents and resets to Session / Weekly / Monthly", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 200, SAMPLE_BODY);

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);

    expect(result.plan).toBe("Go");
    expect(result.lines).toEqual([
      {
        type: "progress",
        label: "Session",
        used: 12,
        limit: 100,
        format: { kind: "percent" },
        resetsAt: "2026-07-12T13:30:00.662Z",
        periodDurationMs: FIVE_HOURS_MS,
      },
      {
        type: "progress",
        label: "Weekly",
        used: 8,
        limit: 100,
        format: { kind: "percent" },
        resetsAt: "2026-07-13T00:00:00.662Z",
        periodDurationMs: 7 * 24 * 60 * 60 * 1000,
      },
      {
        type: "progress",
        label: "Monthly",
        used: 100,
        limit: 100,
        format: { kind: "percent" },
        resetsAt: "2026-08-04T11:18:32.662Z",
        periodDurationMs: 30 * 24 * 60 * 60 * 1000,
      },
    ]);
  });

  it("clamps percents to 0..100", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    const body = JSON.parse(JSON.stringify(SAMPLE_BODY));
    body.usage.rolling.percent = 140;
    body.usage.weekly.percent = -5;
    setResponse(ctx, 200, body);

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines[0].used).toBe(100);
    expect(result.lines[1].used).toBe(0);
  });

  it("drops the untouched rolling window placeholder reset", async () => {
    const capturedMs = Date.parse("2027-01-15T08:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(capturedMs);
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 200, bodyAt(capturedMs, 0, capturedMs + FIVE_HOURS_MS + 800));

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines[0].used).toBe(0);
    expect(result.lines[0].resetsAt).toBeUndefined();
    expect(result.lines[1].resetsAt).toBeDefined();
  });

  it("keeps the reset for a sub-1% session that already started", async () => {
    const capturedMs = Date.parse("2027-01-15T08:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(capturedMs);
    const ctx = makeCtx();
    setAuth(ctx);
    const anchored = capturedMs + FIVE_HOURS_MS - 30000;
    setResponse(ctx, 200, bodyAt(capturedMs, 0, anchored));

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines[0].resetsAt).toBe(new Date(anchored).toISOString());
  });

  it("uses the HTTP Date header over a skewed local clock", async () => {
    const serverMs = Date.parse("2027-01-15T08:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(serverMs + 2 * 60 * 1000);
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 200, bodyAt(serverMs, 0, serverMs + FIVE_HOURS_MS + 500), {
      date: "Fri, 15 Jan 2027 08:00:00 GMT",
    });

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines[0].resetsAt).toBeUndefined();
  });

  it("reports a rejected key on 401", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 401, {
      type: "error",
      error: { type: "AuthError", message: "bad key" },
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("OpenCode Go key was rejected");
  });

  it("reports no subscription on 403 EntitlementError", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 403, {
      type: "error",
      error: { type: "EntitlementError", message: "no go" },
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow(
      "No OpenCode Go subscription on this key.",
    );
  });

  it("reports HTTP status on other failures", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 403, "<html>cloudflare</html>");
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Request failed (HTTP 403)");
  });

  it("reports connection failures", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    ctx.host.http.request.mockImplementation(() => {
      throw new Error("network down");
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Request failed. Check your connection.");
  });

  it("throws on a malformed usage body", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 200, { usage: { rolling: { percent: 1 } } });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Could not parse usage data.");
  });

  it("no longer reads local sqlite history", async () => {
    const ctx = makeCtx();
    setAuth(ctx);
    setResponse(ctx, 200, SAMPLE_BODY);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    expect(ctx.host.sqlite.query).not.toHaveBeenCalled();
  });
});
