import { beforeEach, describe, expect, it } from "vitest"
import { makeCtx } from "../test-helpers.js"

const AUTH_PATH = "~/.grok/auth.json"
const BILLING_URL = "https://cli-chat-proxy.grok.com/v1/billing"
const CREDITS_URL = "https://cli-chat-proxy.grok.com/v1/billing?format=credits"
const SETTINGS_URL = "https://cli-chat-proxy.grok.com/v1/settings"
const REFRESH_URL = "https://auth.x.ai/oauth2/token"

// Captured live by upstream (robinebers/openusage GrokCreditsConfigFixtures.swift, 2026-07-06).
const CAPTURED_CREDITS = {
  config: {
    creditUsagePercent: 99.0,
    currentPeriod: {
      type: "USAGE_PERIOD_TYPE_WEEKLY",
      start: "2026-06-30T21:36:52.140114+00:00",
      end: "2026-07-07T21:36:52.140114+00:00",
    },
    onDemandCap: { val: 0 },
    onDemandUsed: { val: 0 },
    isUnifiedBillingUser: true,
    prepaidBalance: { val: 0 },
    topUpMethod: "TOP_UP_METHOD_SAVED_PAYMENT_METHOD",
    billingPeriodStart: "2026-06-30T21:36:52.140114+00:00",
    billingPeriodEnd: "2026-07-07T21:36:52.140114+00:00",
  },
}

// Unified-billing account: legacy endpoint still answers, but without the monthly meter.
const UNIFIED_BILLING = { config: { used: { val: 0 }, onDemandCap: { val: 0 }, isUnifiedBillingUser: true } }

const loadPlugin = async () => {
  await import("./plugin.js?test=" + Math.random())
  return globalThis.__openusage_plugin
}

function writeAuth(ctx, entry) {
  const auth = {}
  auth["https://auth.x.ai::client"] = entry || {
    key: "test-token",
    email: "user@example.com",
    expires_at: "2026-06-01T00:00:00Z",
  }
  ctx.host.fs.writeText(AUTH_PATH, JSON.stringify(auth))
}

function creditsData(overrides) {
  return { config: Object.assign({}, CAPTURED_CREDITS.config, overrides || {}) }
}

function billingData(overrides) {
  const config = Object.assign({
    monthlyLimit: { val: 60000 },
    used: { val: 4277 },
    onDemandCap: { val: 0 },
    billingPeriodStart: "2026-05-01T00:00:00+00:00",
    billingPeriodEnd: "2026-06-01T00:00:00+00:00",
  }, overrides || {})
  return { config }
}

// Each source: plain object -> 200 JSON body, { status } -> raw response, Error -> thrown.
function respond(source) {
  if (source instanceof Error) throw source
  if (source && typeof source.status === "number") return source
  return { status: 200, bodyText: JSON.stringify(source) }
}

function mockGrokApi(ctx, opts) {
  const o = Object.assign({
    credits: CAPTURED_CREDITS,
    billing: billingData(),
    settings: { subscription_tier_display: "SuperGrok Heavy" },
  }, opts || {})
  ctx.host.http.request.mockImplementation((req) => {
    if (req.url === CREDITS_URL) return respond(o.credits)
    if (req.url === BILLING_URL) return respond(o.billing)
    if (req.url === SETTINGS_URL) return respond(o.settings)
    if (req.url === REFRESH_URL && o.refresh) return respond(o.refresh)
    return { status: 404, bodyText: "" }
  })
}

async function setup(opts) {
  const ctx = makeCtx()
  writeAuth(ctx)
  mockGrokApi(ctx, opts)
  const plugin = await loadPlugin()
  return { ctx, plugin }
}

async function probeWith(opts) {
  const { ctx, plugin } = await setup(opts)
  return { ctx, result: plugin.probe(ctx) }
}

const find = (result, label) => result.lines.find((l) => l.label === label)
const labels = (result) => result.lines.map((l) => l.label)
const callsTo = (ctx, url) => ctx.host.http.request.mock.calls.filter((c) => c[0].url === url).map((c) => c[0])

describe("grok plugin", () => {
  beforeEach(() => {
    delete globalThis.__openusage_plugin
  })

  describe("auth", () => {
    it("throws when auth file is missing", async () => {
      const ctx = makeCtx()
      const plugin = await loadPlugin()
      expect(() => plugin.probe(ctx)).toThrow("Grok not logged in. Run `grok login`.")
    })

    it("throws when auth file has no usable token", async () => {
      const ctx = makeCtx()
      ctx.host.fs.writeText(AUTH_PATH, JSON.stringify({ account: { email: "user@example.com" } }))
      const plugin = await loadPlugin()
      expect(() => plugin.probe(ctx)).toThrow("Grok auth invalid. Run `grok login` again.")
    })

    it("throws when the only token is expired and no refresh token is available", async () => {
      const ctx = makeCtx()
      writeAuth(ctx, { key: "expired-token", email: "user@example.com", expires_at: "2026-01-01T00:00:00Z" })
      const plugin = await loadPlugin()
      expect(() => plugin.probe(ctx)).toThrow("Grok auth expired. Run `grok login` again.")
    })

    it("refreshes an expired Grok CLI token and persists rotated auth", async () => {
      const ctx = makeCtx()
      writeAuth(ctx, {
        key: "expired-token",
        refresh_token: "refresh-token",
        email: "user@example.com",
        oidc_client_id: "client-id",
        expires_at: "2026-01-01T00:00:00Z",
      })
      mockGrokApi(ctx, { refresh: { access_token: "new-token", refresh_token: "new-refresh", expires_in: 3600 } })

      const plugin = await loadPlugin()
      const result = plugin.probe(ctx)

      expect(result.plan).toBe("SuperGrok Heavy")
      const first = ctx.host.http.request.mock.calls[0][0]
      expect(first.url).toBe(REFRESH_URL)
      expect(first.bodyText).toContain("client_id=client-id")
      expect(first.bodyText).toContain("refresh_token=refresh-token")
      expect(callsTo(ctx, CREDITS_URL)[0].headers.Authorization).toBe("Bearer new-token")
      expect(callsTo(ctx, BILLING_URL)[0].headers.Authorization).toBe("Bearer new-token")

      const authWrites = ctx.host.fs.writeText.mock.calls.filter((call) => call[0] === AUTH_PATH)
      const entry = JSON.parse(authWrites[authWrites.length - 1][1])["https://auth.x.ai::client"]
      expect(entry.key).toBe("new-token")
      expect(entry.refresh_token).toBe("new-refresh")
      expect(entry.expires_at).toBe("2026-02-02T01:00:00.000Z")
    })

    it("refreshes and retries once when credits returns an auth error", async () => {
      const ctx = makeCtx()
      writeAuth(ctx, {
        key: "old-token",
        refresh_token: "refresh-token",
        email: "user@example.com",
        expires_at: "2026-06-01T00:00:00Z",
      })
      mockGrokApi(ctx, { refresh: { access_token: "new-token", refresh_token: "new-refresh", expires_in: 3600 } })
      const base = ctx.host.http.request.getMockImplementation()
      let creditsCalls = 0
      ctx.host.http.request.mockImplementation((req) => {
        if (req.url === CREDITS_URL && ++creditsCalls === 1) return { status: 401, bodyText: "" }
        return base(req)
      })

      const plugin = await loadPlugin()
      const result = plugin.probe(ctx)

      expect(find(result, "Weekly").used).toBe(99)
      expect(callsTo(ctx, CREDITS_URL).map((c) => c.headers.Authorization)).toEqual([
        "Bearer old-token",
        "Bearer new-token",
      ])
      expect(callsTo(ctx, BILLING_URL)[0].headers.Authorization).toBe("Bearer new-token")
      expect(callsTo(ctx, REFRESH_URL)[0].bodyText).toContain("client_id=client")
    })

    it("uses a still-valid token when proactive refresh is unauthorized", async () => {
      const ctx = makeCtx()
      writeAuth(ctx, {
        key: "old-token",
        refresh_token: "refresh-token",
        email: "user@example.com",
        expires_at: "2026-02-02T00:04:00Z",
      })
      mockGrokApi(ctx, { refresh: { status: 401, bodyText: JSON.stringify({ error: "invalid_grant" }) } })

      const plugin = await loadPlugin()
      const result = plugin.probe(ctx)

      expect(result.plan).toBe("SuperGrok Heavy")
      expect(callsTo(ctx, CREDITS_URL)[0].headers.Authorization).toBe("Bearer old-token")
    })

    it("uses the first non-expired token", async () => {
      const ctx = makeCtx()
      ctx.host.fs.writeText(AUTH_PATH, JSON.stringify({
        expired: { key: "expired-token", expires_at: "2026-01-01T00:00:00Z" },
        active: { key: "active-token", email: "active@example.com", expires_at: "2026-06-01T00:00:00Z" },
      }))
      mockGrokApi(ctx)

      const plugin = await loadPlugin()
      plugin.probe(ctx)

      expect(ctx.host.http.request.mock.calls[0][0].headers.Authorization).toBe("Bearer active-token")
    })

    it("throws the login hint when credits stays unauthorized", async () => {
      const { ctx, plugin } = await setup({
        credits: { status: 401, bodyText: "" },
        billing: { status: 401, bodyText: "" },
      })
      expect(() => plugin.probe(ctx)).toThrow("Grok auth expired. Run `grok login` again.")
    })
  })

  describe("requests", () => {
    it("calls credits first, then legacy billing, with Grok CLI headers", async () => {
      const { ctx } = await probeWith()
      const urls = ctx.host.http.request.mock.calls.map((c) => c[0].url)
      expect(urls.slice(0, 2)).toEqual([CREDITS_URL, BILLING_URL])

      for (const call of [callsTo(ctx, CREDITS_URL)[0], callsTo(ctx, BILLING_URL)[0]]) {
        expect(call.method).toBe("GET")
        expect(call.headers.Authorization).toBe("Bearer test-token")
        expect(call.headers["X-XAI-Token-Auth"]).toBe("xai-grok-cli")
        expect(call.headers.Accept).toBe("application/json")
      }
    })

    it("reads the plan name from settings instead of auth email", async () => {
      const { ctx, result } = await probeWith()
      const settingsCall = callsTo(ctx, SETTINGS_URL)[0]
      expect(settingsCall.headers.Authorization).toBe("Bearer test-token")
      expect(settingsCall.headers["X-XAI-Token-Auth"]).toBe("xai-grok-cli")
      expect(result.plan).toBe("SuperGrok Heavy")
    })

    it("omits the plan label when settings does not include a plan", async () => {
      const { result } = await probeWith({ settings: { release_channel: "stable" } })
      expect(result.plan).toBe(null)
    })
  })

  describe("weekly shared pool (credits)", () => {
    it("renders Weekly first with reset countdown from the captured payload", async () => {
      const { result } = await probeWith()
      const line = result.lines[0]

      expect(line.label).toBe("Weekly")
      expect(line.type).toBe("progress")
      expect(line.used).toBe(99)
      expect(line.limit).toBe(100)
      expect(line.format).toEqual({ kind: "percent" })
      expect(line.resetsAt).toBe("2026-07-07T21:36:52.140Z")
      expect(line.periodDurationMs).toBe(7 * 24 * 60 * 60 * 1000)
    })

    it("treats a missing creditUsagePercent as 0 (proto-JSON drops zeros)", async () => {
      const credits = creditsData()
      delete credits.config.creditUsagePercent
      const { result } = await probeWith({ credits })
      expect(find(result, "Weekly").used).toBe(0)
    })

    it("clamps Weekly percent to 0..100", async () => {
      const { result } = await probeWith({ credits: creditsData({ creditUsagePercent: 140 }) })
      expect(find(result, "Weekly").used).toBe(100)
    })

    it("omits Weekly when the account period is not weekly", async () => {
      const { result } = await probeWith({
        credits: creditsData({
          currentPeriod: {
            type: "USAGE_PERIOD_TYPE_MONTHLY",
            start: "2026-06-01T00:00:00+00:00",
            end: "2026-07-01T00:00:00+00:00",
          },
        }),
      })
      expect(labels(result)).toEqual(["Credits used", "Pay as you go"])
    })

    it("renders pay as you go from the credits cap", async () => {
      const disabled = await probeWith({ credits: creditsData({ onDemandCap: { val: 0 } }) })
      expect(find(disabled.result, "Pay as you go")).toMatchObject({ type: "badge", text: "Disabled", color: "#a3a3a3" })

      const missing = creditsData()
      delete missing.config.onDemandCap
      const absent = await probeWith({ credits: missing })
      expect(find(absent.result, "Pay as you go").text).toBe("Disabled")

      // Credits cap wins over the legacy cap.
      const enabled = await probeWith({
        credits: creditsData({ onDemandCap: { val: 2500 } }),
        billing: billingData({ onDemandCap: { val: 10 } }),
      })
      expect(find(enabled.result, "Pay as you go")).toMatchObject({ text: "2500 cap", color: "#22c55e" })
    })
  })

  describe("legacy monthly meter (optional)", () => {
    it("renders credits used as percent progress", async () => {
      const { result } = await probeWith()
      const line = find(result, "Credits used")

      expect(line.type).toBe("progress")
      expect(line.used).toBeCloseTo(7.128, 3)
      expect(line.limit).toBe(100)
      expect(line.format).toEqual({ kind: "percent" })
      expect(line.resetsAt).toBe("2026-06-01T00:00:00.000Z")
    })

    it("parses billing values provided as strings", async () => {
      const { result } = await probeWith({
        billing: billingData({ monthlyLimit: { val: "10000" }, used: { val: "2500" }, onDemandCap: { val: "0" } }),
      })
      expect(find(result, "Credits used").used).toBe(25)
    })

    it("does not render duplicate reset or billing detail rows", async () => {
      const { result } = await probeWith()
      expect(labels(result)).toEqual(["Weekly", "Credits used", "Pay as you go"])
    })
  })

  describe("source combinations", () => {
    it("unified billing (no monthlyLimit) + credits OK: no throw, Weekly shown", async () => {
      const { ctx, result } = await probeWith({ billing: UNIFIED_BILLING })

      expect(labels(result)).toEqual(["Weekly", "Pay as you go"])
      expect(find(result, "Weekly").used).toBe(99)
      expect(ctx.host.log.info).toHaveBeenCalledWith(expect.stringContaining("no monthlyLimit"))
    })

    it("credits OK but legacy billing fails: Weekly still shown", async () => {
      for (const billing of [{ status: 500, bodyText: "" }, new Error("offline"), { status: 200, bodyText: "nope" }]) {
        delete globalThis.__openusage_plugin
        const { result } = await probeWith({ billing })
        expect(labels(result)).toEqual(["Weekly", "Pay as you go"])
      }
    })

    it("legacy account with both sources: Weekly and Credits used shown", async () => {
      const { result } = await probeWith()
      expect(find(result, "Weekly")).toBeDefined()
      expect(find(result, "Credits used")).toBeDefined()
    })

    it("credits fails, legacy OK: Credits used and legacy pay as you go shown", async () => {
      for (const credits of [{ status: 500, bodyText: "" }, new Error("offline"), { status: 200, bodyText: "nope" }]) {
        delete globalThis.__openusage_plugin
        const { ctx, result } = await probeWith({ credits, billing: billingData({ onDemandCap: { val: "2500" } }) })
        expect(labels(result)).toEqual(["Credits used", "Pay as you go"])
        expect(find(result, "Pay as you go").text).toBe("2500 cap")
        expect(ctx.host.log.warn).toHaveBeenCalled()
      }
    })

    it("team principal (credits 412 No personal team) falls back to legacy meter", async () => {
      const { result } = await probeWith({
        credits: { status: 412, bodyText: JSON.stringify({ error: "No personal team" }) },
      })
      expect(labels(result)).toEqual(["Credits used", "Pay as you go"])
    })

    it("treats non-numeric percent, bad cap, or backwards period as credits failure", async () => {
      const bad = [
        creditsData({ creditUsagePercent: "lots" }),
        creditsData({ onDemandCap: 5 }),
        creditsData({
          currentPeriod: {
            type: "USAGE_PERIOD_TYPE_WEEKLY",
            start: "2026-07-07T00:00:00+00:00",
            end: "2026-07-01T00:00:00+00:00",
          },
        }),
      ]
      for (const credits of bad) {
        delete globalThis.__openusage_plugin
        const { result } = await probeWith({ credits })
        expect(labels(result)).toEqual(["Credits used", "Pay as you go"])
      }
    })
  })

  describe("both sources fail", () => {
    async function expectThrow(opts, message) {
      const { ctx, plugin } = await setup(opts)
      expect(() => plugin.probe(ctx)).toThrow(message)
      expect(ctx.host.log.error).toHaveBeenCalledWith(expect.stringContaining("Grok billing failed"))
    }

    it("throws the credits HTTP error", async () => {
      await expectThrow(
        { credits: { status: 500, bodyText: "" }, billing: { status: 500, bodyText: "" } },
        "Grok billing request failed (HTTP 500). Try again later."
      )
    })

    it("throws a connection error when both requests throw", async () => {
      await expectThrow(
        { credits: new Error("offline"), billing: new Error("offline") },
        "Grok billing request failed. Check your connection."
      )
    })

    it("throws response changed on invalid credits JSON and no monthly meter", async () => {
      await expectThrow(
        { credits: { status: 200, bodyText: "not-json" }, billing: UNIFIED_BILLING },
        "Grok billing response changed."
      )
    })

    it("throws a team message for a team principal without a legacy meter", async () => {
      await expectThrow(
        { credits: { status: 412, bodyText: JSON.stringify({ error: "No personal team" }) }, billing: UNIFIED_BILLING },
        "Grok team accounts have no personal quota."
      )
    })

    it("does not treat other 412 bodies as a team account", async () => {
      await expectThrow(
        { credits: { status: 412, bodyText: "precondition" }, billing: { status: 500, bodyText: "" } },
        "Grok billing request failed (HTTP 412). Try again later."
      )
    })
  })
})
