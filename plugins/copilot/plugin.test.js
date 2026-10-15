import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePluginTestContext } from "../test-helpers.js";

const loadPlugin = async () => {
  await import("./plugin.js");
  return globalThis.__openusage_plugin;
};

function makeUsageResponse(overrides = {}) {
  return {
    copilot_plan: "pro",
    quota_reset_date: "2099-01-15T00:00:00Z",
    quota_snapshots: {
      premium_interactions: {
        percent_remaining: 80,
        entitlement: 300,
        remaining: 240,
        quota_id: "premium",
      },
      chat: {
        percent_remaining: 95,
        entitlement: 1000,
        remaining: 950,
        quota_id: "chat",
      },
    },
    ...overrides,
  };
}

function setKeychainToken(ctx, token) {
  ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
    if (service === "OpenUsage-copilot") return JSON.stringify({ token });
    return null;
  });
}

function setGhCliKeychain(ctx, value) {
  ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
    if (service === "gh:github.com") return value;
    return null;
  });
}

function setStateFileToken(ctx, token) {
  ctx.host.fs.writeText(
    ctx.app.pluginDataDir + "/auth.json",
    JSON.stringify({ token }),
  );
}

function mockUsageOk(ctx, body) {
  ctx.host.http.request.mockReturnValue({
    status: 200,
    bodyText: JSON.stringify(body || makeUsageResponse()),
  });
}

describe("copilot plugin", () => {
  beforeEach(() => {
    delete globalThis.__openusage_plugin;
    if (vi.resetModules) vi.resetModules();
  });

  it("throws when no token found", async () => {
    const ctx = makePluginTestContext();
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Not logged in. Run `gh auth login` first.");
  });

  it("loads token from OpenUsage keychain", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "ghu_keychain");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token ghu_keychain");
  });

  it("loads token from gh CLI keychain (plain)", async () => {
    const ctx = makePluginTestContext();
    setGhCliKeychain(ctx, "gho_plain_token");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token gho_plain_token");
  });

  it("loads token from gh CLI keychain (base64-encoded)", async () => {
    const ctx = makePluginTestContext();
    const encoded = ctx.base64.encode("gho_encoded_token");
    setGhCliKeychain(ctx, "go-keyring-base64:" + encoded);
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token gho_encoded_token");
  });

  it("loads token from state file", async () => {
    const ctx = makePluginTestContext();
    setStateFileToken(ctx, "ghu_state");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token ghu_state");
  });

  it("prefers keychain over gh-cli", async () => {
    const ctx = makePluginTestContext();
    ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
      if (service === "OpenUsage-copilot")
        return JSON.stringify({ token: "ghu_keychain" });
      if (service === "gh:github.com") return "gho_ghcli";
      return null;
    });
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token ghu_keychain");
  });

  it("prefers keychain over state file", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "ghu_keychain");
    setStateFileToken(ctx, "ghu_state");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toBe("token ghu_keychain");
  });

  it("persists token from gh-cli to keychain and state file", async () => {
    const ctx = makePluginTestContext();
    setGhCliKeychain(ctx, "gho_persist");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    expect(ctx.host.keychain.writeGenericPassword).toHaveBeenCalledWith(
      "OpenUsage-copilot",
      JSON.stringify({ token: "gho_persist" }),
    );
    const stateFile = ctx.host.fs.readText(
      ctx.app.pluginDataDir + "/auth.json",
    );
    expect(JSON.parse(stateFile).token).toBe("gho_persist");
  });

  it("does not persist token loaded from OpenUsage keychain", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "ghu_already");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    expect(ctx.host.keychain.writeGenericPassword).not.toHaveBeenCalled();
  });

  it("renders both Credits and Chat lines for paid tier", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const credits = result.lines.find((l) => l.label === "Credits");
    const chat = result.lines.find((l) => l.label === "Chat");
    expect(credits).toBeTruthy();
    expect(credits.used).toBe(20); // 100 - 80
    expect(credits.limit).toBe(100);
    expect(chat).toBeTruthy();
    expect(chat.used).toBe(5); // 100 - 95
  });

  it("renders only Credits when Chat is missing", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify(
        makeUsageResponse({
          quota_snapshots: {
            premium_interactions: {
              percent_remaining: 50,
              entitlement: 300,
              remaining: 150,
              quota_id: "premium",
            },
          },
        }),
      ),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    expect(result.lines.find((l) => l.label === "Chat")).toBeFalsy();
  });

  it("throws when no quota data and not token-based billing", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({ copilot_plan: "free" }),
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Usage data unavailable for this account.");
  });

  it("returns plan label from copilot_plan", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.plan).toBe("Pro");
  });

  it("capitalizes multi-word plan labels", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify(
        makeUsageResponse({ copilot_plan: "business plus" }),
      ),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.plan).toBe("Business Plus");
  });

  it("propagates resetsAt from quota_reset_date", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const credits = result.lines.find((l) => l.label === "Credits");
    expect(credits.resetsAt).toBe("2099-01-15T00:00:00.000Z");
  });

  it("clamps usedPercent to 0 when percent_remaining > 100", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify(
        makeUsageResponse({
          quota_snapshots: {
            premium_interactions: {
              percent_remaining: 120,
              entitlement: 300,
              remaining: 360,
              quota_id: "premium",
            },
          },
        }),
      ),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits").used).toBe(0);
  });

  it("throws on 401", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({ status: 401, bodyText: "" });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Token invalid. Run `gh auth login` to re-authenticate.");
  });

  it("throws on 403", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({ status: 403, bodyText: "" });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Token invalid. Run `gh auth login` to re-authenticate.");
  });

  it("throws on HTTP 500", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({ status: 500, bodyText: "" });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow(
      "Usage request failed (HTTP 500). Try again later.",
    );
  });

  it("throws on network error", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockImplementation(() => {
      throw new Error("ECONNREFUSED");
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow(
      "Usage request failed. Check your connection.",
    );
  });

  it("throws on invalid JSON response", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: "not-json",
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow(
      "Usage response invalid. Try again later.",
    );
  });

  it("uses 'token' auth header format (not 'Bearer')", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "ghu_format");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers.Authorization).toMatch(/^token /);
    expect(call.headers.Authorization).not.toMatch(/^Bearer /);
  });

  it("includes correct User-Agent and editor headers", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    plugin.probe(ctx);
    const call = ctx.host.http.request.mock.calls[0][0];
    expect(call.headers["User-Agent"]).toBe("GitHubCopilotChat/0.26.7");
    expect(call.headers["Editor-Version"]).toBe("vscode/1.96.2");
    expect(call.headers["X-Github-Api-Version"]).toBe("2025-04-01");
  });

  it("includes periodDurationMs on paid tier progress lines", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    mockUsageOk(ctx);
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const credits = result.lines.find((l) => l.label === "Credits");
    const chat = result.lines.find((l) => l.label === "Chat");
    expect(credits.periodDurationMs).toBe(30 * 24 * 60 * 60 * 1000);
    expect(chat.periodDurationMs).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("renders Chat and Completions for free tier (limited_user_quotas)", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({
        copilot_plan: "individual",
        access_type_sku: "free_limited_copilot",
        limited_user_quotas: { chat: 410, completions: 4000 },
        monthly_quotas: { chat: 500, completions: 4000 },
        limited_user_reset_date: "2026-02-11",
      }),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const chat = result.lines.find((l) => l.label === "Chat");
    const completions = result.lines.find((l) => l.label === "Completions");
    expect(chat).toBeTruthy();
    expect(chat.used).toBe(18); // (500 - 410) / 500 * 100 = 18%
    expect(completions).toBeTruthy();
    expect(completions.used).toBe(0); // (4000 - 4000) / 4000 * 100 = 0%
  });

  it("includes periodDurationMs on free tier progress lines", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({
        copilot_plan: "individual",
        limited_user_quotas: { chat: 400, completions: 3000 },
        monthly_quotas: { chat: 500, completions: 4000 },
        limited_user_reset_date: "2026-02-11",
      }),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const chat = result.lines.find((l) => l.label === "Chat");
    const completions = result.lines.find((l) => l.label === "Completions");
    expect(chat.periodDurationMs).toBe(30 * 24 * 60 * 60 * 1000);
    expect(completions.periodDurationMs).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("propagates resetsAt from limited_user_reset_date for free tier", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({
        copilot_plan: "individual",
        limited_user_quotas: { chat: 450, completions: 3500 },
        monthly_quotas: { chat: 500, completions: 4000 },
        limited_user_reset_date: "2026-02-11",
      }),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const chat = result.lines.find((l) => l.label === "Chat");
    expect(chat.resetsAt).toBe("2026-02-11T00:00:00.000Z");
  });

  it("handles free tier with partially used quotas", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({
        copilot_plan: "individual",
        limited_user_quotas: { chat: 250, completions: 2000 },
        monthly_quotas: { chat: 500, completions: 4000 },
        limited_user_reset_date: "2026-02-15",
      }),
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    const chat = result.lines.find((l) => l.label === "Chat");
    const completions = result.lines.find((l) => l.label === "Completions");
    expect(chat.used).toBe(50); // 50% used
    expect(completions.used).toBe(50); // 50% used
  });

  it("handles graceful keychain write failure", async () => {
    const ctx = makePluginTestContext();
    setGhCliKeychain(ctx, "gho_tok");
    mockUsageOk(ctx);
    ctx.host.keychain.writeGenericPassword.mockImplementation(() => {
      throw new Error("keychain locked");
    });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).not.toThrow();
    expect(ctx.host.log.warn).toHaveBeenCalled();
  });

  it("retries with gh-cli token when cached keychain token is stale", async () => {
    const ctx = makePluginTestContext();
    let callCount = 0;
    // First call returns stale keychain token, second call returns fresh gh-cli token
    ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
      if (service === "OpenUsage-copilot") {
        return JSON.stringify({ token: "stale_token" });
      }
      if (service === "gh:github.com") {
        return "fresh_gh_token";
      }
      return null;
    });
    // First request with stale token returns 401, second with fresh token succeeds
    ctx.host.http.request.mockImplementation((opts) => {
      callCount++;
      if (opts.headers.Authorization === "token stale_token") {
        return { status: 401, bodyText: "" };
      }
      return { status: 200, bodyText: JSON.stringify(makeUsageResponse()) };
    });
    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
    expect(callCount).toBe(2);
    // Should have cleared the stale token
    expect(ctx.host.keychain.deleteGenericPassword).toHaveBeenCalledWith("OpenUsage-copilot");
    // Should have saved the fresh token
    expect(ctx.host.keychain.writeGenericPassword).toHaveBeenCalled();
  });

  it("throws when stale keychain token and no fallback available", async () => {
    const ctx = makePluginTestContext();
    ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
      if (service === "OpenUsage-copilot") {
        return JSON.stringify({ token: "stale_token" });
      }
      return null; // No gh-cli fallback
    });
    ctx.host.http.request.mockReturnValue({ status: 401, bodyText: "" });
    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Token invalid");
  });

  it("falls back when OpenUsage keychain payload lacks token field", async () => {
    const ctx = makePluginTestContext();
    ctx.host.keychain.readGenericPassword.mockImplementation((service) => {
      if (service === "OpenUsage-copilot") return JSON.stringify({ notToken: "x" });
      if (service === "gh:github.com") return "gho_fallback";
      return null;
    });
    mockUsageOk(ctx, makeUsageResponse({ copilot_plan: null }));

    const plugin = await loadPlugin();
    const result = plugin.probe(ctx);
    expect(result.plan).toBeNull();
    expect(result.lines.find((l) => l.label === "Credits")).toBeTruthy();
  });

  it("throws when free-tier quotas are present but invalid", async () => {
    const ctx = makePluginTestContext();
    setKeychainToken(ctx, "tok");
    ctx.host.http.request.mockReturnValue({
      status: 200,
      bodyText: JSON.stringify({
        limited_user_quotas: { chat: 10, completions: "x" },
        monthly_quotas: { chat: 0, completions: 0 },
        limited_user_reset_date: "2026-02-11",
      }),
    });

    const plugin = await loadPlugin();
    expect(() => plugin.probe(ctx)).toThrow("Usage data unavailable for this account.");
  });

  describe("AI Credits (upstream v0.7.x)", () => {
    const BILLING_ORG_PATH = "/billing-org.json";

    function paidBody() {
      return {
        copilot_plan: "pro",
        quota_reset_date: "2099-01-15T00:00:00Z",
        quota_snapshots: {
          premium_interactions: { entitlement: 300, remaining: 123, percent_remaining: 41, quota_id: "premium" },
          chat: { entitlement: 1000, remaining: 950, percent_remaining: 95, quota_id: "chat" },
        },
      };
    }

    // Org-managed Business seat placeholder (upstream issue #839 / #1094 shape).
    function businessPlaceholder(creditsUsed) {
      const bucket = (overagePermitted) => ({
        entitlement: 0,
        remaining: 0,
        unlimited: true,
        overage_permitted: overagePermitted,
        overage_count: 0,
      });
      const premium = bucket(true);
      if (creditsUsed !== undefined) premium.credits_used = creditsUsed;
      return {
        copilot_plan: "business",
        token_based_billing: true,
        quota_snapshots: { chat: bucket(false), completions: bucket(false), premium_interactions: premium },
      };
    }

    function orgSummary() {
      return {
        usageItems: [
          { product: "Copilot", sku: "copilot_ai_unit", unitType: "ai-units", grossQuantity: 298.698546, netAmount: 0 },
        ],
      };
    }

    function route(ctx, routes) {
      ctx.host.http.request.mockImplementation((opts) => {
        const hit = routes.find(([sub]) => opts.url.includes(sub));
        if (!hit) return { status: 404, bodyText: "" };
        const res = hit[1];
        return { status: res.status, bodyText: res.body === undefined ? "" : JSON.stringify(res.body) };
      });
    }

    function urls(ctx) {
      return ctx.host.http.request.mock.calls.map((c) => c[0].url);
    }

    function cachedOrg(ctx) {
      const path = ctx.app.pluginDataDir + BILLING_ORG_PATH;
      if (!ctx.host.fs.exists(path)) return null;
      const data = JSON.parse(ctx.host.fs.readText(path));
      return data ? data.org : null;
    }

    function setCachedOrg(ctx, org) {
      ctx.host.fs.writeText(ctx.app.pluginDataDir + BILLING_ORG_PATH, JSON.stringify({ org }));
    }

    const line = (result, label) => result.lines.find((l) => l.label === label);

    it("maps paid Credits and Chat as percent used", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      mockUsageOk(ctx, paidBody());
      const result = (await loadPlugin()).probe(ctx);
      expect(result.plan).toBe("Pro");
      expect(line(result, "Credits").used).toBe(59);
      expect(line(result, "Credits").resetsAt).toBe("2099-01-15T00:00:00.000Z");
      expect(line(result, "Chat").used).toBe(5);
      expect(line(result, "Extra Usage")).toBeUndefined();
    });

    it("suppresses unlimited and -1 sentinel buckets", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      const body = paidBody();
      body.quota_snapshots.chat = { unlimited: true, entitlement: 0, remaining: 0 };
      body.quota_snapshots.completions = { entitlement: -1, remaining: -1 };
      mockUsageOk(ctx, body);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Chat")).toBeUndefined();
      expect(line(result, "Completions")).toBeUndefined();
      expect(line(result, "Credits").used).toBe(59);
    });

    it("shows Extra Usage when overage permitted, including real zero", async () => {
      for (const overage of [36, 0]) {
        const ctx = makePluginTestContext();
        setKeychainToken(ctx, "tok");
        const body = paidBody();
        body.quota_snapshots.premium_interactions.overage_permitted = true;
        body.quota_snapshots.premium_interactions.overage_count = overage;
        mockUsageOk(ctx, body);
        const result = (await loadPlugin()).probe(ctx);
        expect(line(result, "Extra Usage")).toEqual({ type: "text", label: "Extra Usage", value: String(overage) });
        expect(ctx.host.http.request).toHaveBeenCalledTimes(1);
      }
    });

    it("ignores legacy limited quotas when snapshots are present", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      const body = paidBody();
      body.quota_snapshots.chat = { entitlement: -1, remaining: -1 };
      body.quota_snapshots.completions = { entitlement: -1, remaining: -1 };
      body.limited_user_quotas = { chat: 100, completions: 1000 };
      body.monthly_quotas = { chat: 500, completions: 4000 };
      mockUsageOk(ctx, body);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Credits")).toBeTruthy();
      expect(line(result, "Chat")).toBeUndefined();
      expect(line(result, "Completions")).toBeUndefined();
    });

    it("suppresses zero-entitlement Credits placeholder", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      mockUsageOk(ctx, {
        copilot_plan: "business",
        quota_snapshots: {
          premium_interactions: { entitlement: 0, remaining: 0, percent_remaining: 100 },
          chat: { entitlement: 1000, remaining: 800, percent_remaining: 80 },
        },
      });
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Credits")).toBeUndefined();
      expect(line(result, "Chat").used).toBe(20);
    });

    it("maps live free account snapshots", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      const b = (entitlement, remaining, pct) => ({
        entitlement, remaining, percent_remaining: pct, overage_permitted: false, token_based_billing: true,
      });
      mockUsageOk(ctx, {
        copilot_plan: "individual",
        access_type_sku: "free_limited_copilot",
        token_based_billing: true,
        quota_reset_date: "2099-07-01",
        quota_snapshots: { chat: b(200, 182, 91), completions: b(2000, 1989, 99.4), premium_interactions: b(0, 0, 0) },
      });
      const result = (await loadPlugin()).probe(ctx);
      expect(result.plan).toBe("Individual");
      expect(line(result, "Credits")).toBeUndefined();
      expect(line(result, "Extra Usage")).toBeUndefined();
      expect(line(result, "Chat").used).toBe(9);
      expect(line(result, "Completions").used).toBeCloseTo(0.6, 4);
      expect(ctx.host.http.request).toHaveBeenCalledTimes(1);
    });

    it("org member (403 billing) with no personal credits shows explicit No usage data", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/user/orgs", { status: 200, body: [{ login: "acme" }] }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 403 }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(result.plan).toBe("Business");
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].text).toBe("No usage data");
      expect(cachedOrg(ctx)).toBeNull();
    });

    it("org member shows personal Credits count despite forbidden org billing", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder(2111) }],
        ["/user/orgs", { status: 200, body: [{ login: "acme" }] }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 403 }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(result.lines).toEqual([{ type: "text", label: "Credits", value: "2111" }]);
      expect(cachedOrg(ctx)).toBeNull();
    });

    it("org admin gets personal Credits plus Org Credits / Org Spend and caches org", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder(2111) }],
        ["/user/orgs", { status: 200, body: [{ login: "acme" }] }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 200, body: orgSummary() }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Credits").value).toBe("2111");
      expect(line(result, "Org Credits").value).toBe("298.7 credits");
      expect(line(result, "Org Spend").value).toBe("$0.00");
      expect(line(result, "Extra Usage")).toBeUndefined();
      expect(cachedOrg(ctx)).toBe("acme");
      const orgCall = ctx.host.http.request.mock.calls.find((c) => c[0].url.includes("/user/orgs"))[0];
      expect(orgCall.headers.Authorization).toBe("token tok");
      expect(orgCall.headers["X-GitHub-Api-Version"]).toBe("2022-11-28");
    });

    it("sums credit items and billed spend, ignoring non-credit units", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/user/orgs", { status: 200, body: [{ login: "acme" }] }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 200, body: { usageItems: [
          { product: "Copilot", unitType: "ai-units", grossQuantity: 100.5, netAmount: 1.25 },
          { product: "Copilot", unitType: "ai-credits", grossQuantity: 50, netAmount: 0.5 },
          { product: "Actions", unitType: "minutes", grossQuantity: 120, netAmount: 0.96 },
          { product: "Copilot", unitType: "user-months", grossQuantity: 10, netAmount: 190 },
        ] } }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Org Credits").value).toBe("150.5 credits");
      expect(line(result, "Org Spend").value).toBe("$1.75");
    });

    it("uses cached org without listing orgs", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      setCachedOrg(ctx, "acme");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 200, body: orgSummary() }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Org Credits")).toBeTruthy();
      expect(urls(ctx).some((u) => u.includes("/user/orgs"))).toBe(false);
    });

    it("evicts stale cached org and re-discovers", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      setCachedOrg(ctx, "oldorg");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/orgs/oldorg/settings/billing/usage/summary", { status: 404 }],
        ["/user/orgs", { status: 200, body: [{ login: "acme" }] }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 200, body: orgSummary() }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Org Credits")).toBeTruthy();
      expect(cachedOrg(ctx)).toBe("acme");
    });

    it("keeps probing past an org whose billing has an outage", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/user/orgs", { status: 200, body: [{ login: "brokenorg" }, { login: "acme" }] }],
        ["/orgs/brokenorg/settings/billing/usage/summary", { status: 503 }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 200, body: orgSummary() }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(line(result, "Org Credits")).toBeTruthy();
      expect(cachedOrg(ctx)).toBe("acme");
    });

    it("keeps cached org on transient billing failure", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      setCachedOrg(ctx, "acme");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/orgs/acme/settings/billing/usage/summary", { status: 503 }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(result.lines[0].text).toBe("No usage data");
      expect(cachedOrg(ctx)).toBe("acme");
      expect(urls(ctx).some((u) => u.includes("/user/orgs"))).toBe(false);
    });

    it("org list failure degrades to explicit No usage data", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      route(ctx, [
        ["/copilot_internal/user", { status: 200, body: businessPlaceholder() }],
        ["/user/orgs", { status: 403 }],
      ]);
      const result = (await loadPlugin()).probe(ctx);
      expect(result.plan).toBe("Business");
      expect(result.lines[0].text).toBe("No usage data");
    });

    it("personal paid account makes no org calls", async () => {
      const ctx = makePluginTestContext();
      setKeychainToken(ctx, "tok");
      mockUsageOk(ctx, paidBody());
      (await loadPlugin()).probe(ctx);
      expect(ctx.host.http.request).toHaveBeenCalledTimes(1);
    });
  });
});
