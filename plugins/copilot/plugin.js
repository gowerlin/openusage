(function () {
  const KEYCHAIN_SERVICE = "OpenUsage-copilot";
  const GH_KEYCHAIN_SERVICE = "gh:github.com";
  const USAGE_URL = "https://api.github.com/copilot_internal/user";
  const USER_ORGS_URL = "https://api.github.com/user/orgs?per_page=100";
  const ORG_USAGE_URL = (org) =>
    "https://api.github.com/orgs/" +
    encodeURIComponent(org) +
    "/settings/billing/usage/summary";

  function readJson(ctx, path) {
    try {
      if (!ctx.host.fs.exists(path)) return null;
      const text = ctx.host.fs.readText(path);
      return ctx.util.tryParseJson(text);
    } catch (e) {
      ctx.host.log.warn("readJson failed for " + path + ": " + String(e));
      return null;
    }
  }

  function writeJson(ctx, path, value) {
    try {
      ctx.host.fs.writeText(path, JSON.stringify(value));
    } catch (e) {
      ctx.host.log.warn("writeJson failed for " + path + ": " + String(e));
    }
  }

  function saveToken(ctx, token) {
    try {
      ctx.host.keychain.writeGenericPassword(
        KEYCHAIN_SERVICE,
        JSON.stringify({ token: token }),
      );
    } catch (e) {
      ctx.host.log.warn("keychain write failed: " + String(e));
    }
    writeJson(ctx, ctx.app.pluginDataDir + "/auth.json", { token: token });
  }

  function clearCachedToken(ctx) {
    try {
      ctx.host.keychain.deleteGenericPassword(KEYCHAIN_SERVICE);
    } catch (e) {
      ctx.host.log.info("keychain delete failed: " + String(e));
    }
    writeJson(ctx, ctx.app.pluginDataDir + "/auth.json", null);
  }

  function loadTokenFromKeychain(ctx) {
    try {
      const raw = ctx.host.keychain.readGenericPassword(KEYCHAIN_SERVICE);
      if (raw) {
        const parsed = ctx.util.tryParseJson(raw);
        if (parsed && parsed.token) {
          ctx.host.log.info("token loaded from OpenUsage keychain");
          return { token: parsed.token, source: "keychain" };
        }
      }
    } catch (e) {
      ctx.host.log.info("OpenUsage keychain read failed: " + String(e));
    }
    return null;
  }

  function loadTokenFromGhCli(ctx) {
    try {
      const raw = ctx.host.keychain.readGenericPassword(GH_KEYCHAIN_SERVICE);
      if (raw) {
        let token = raw;
        if (
          typeof token === "string" &&
          token.indexOf("go-keyring-base64:") === 0
        ) {
          token = ctx.base64.decode(token.slice("go-keyring-base64:".length));
        }
        if (token) {
          ctx.host.log.info("token loaded from gh CLI keychain");
          return { token: token, source: "gh-cli" };
        }
      }
    } catch (e) {
      ctx.host.log.info("gh CLI keychain read failed: " + String(e));
    }
    return null;
  }

  function loadTokenFromStateFile(ctx) {
    const data = readJson(ctx, ctx.app.pluginDataDir + "/auth.json");
    if (data && data.token) {
      ctx.host.log.info("token loaded from state file");
      return { token: data.token, source: "state" };
    }
    return null;
  }

  function loadToken(ctx) {
    return (
      loadTokenFromKeychain(ctx) ||
      loadTokenFromGhCli(ctx) ||
      loadTokenFromStateFile(ctx)
    );
  }

  function fetchUsage(ctx, token) {
    return ctx.util.request({
      method: "GET",
      url: USAGE_URL,
      headers: {
        Authorization: "token " + token,
        Accept: "application/json",
        "Editor-Version": "vscode/1.96.2",
        "Editor-Plugin-Version": "copilot-chat/0.26.7",
        "User-Agent": "GitHubCopilotChat/0.26.7",
        "X-Github-Api-Version": "2025-04-01",
      },
      timeoutMs: 10000,
    });
  }

  const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

  function num(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  function formatCount(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  }

  function percentLine(ctx, label, usedPercent, resetDate) {
    return ctx.line.progress({
      label: label,
      used: Math.min(100, Math.max(0, usedPercent)),
      limit: 100,
      format: { kind: "percent" },
      resetsAt: ctx.util.toIso(resetDate),
      periodDurationMs: PERIOD_MS,
    });
  }

  // quota_snapshots bucket -> percent-used meter, or null. Suppressed: missing bucket,
  // unlimited (flag or -1 sentinel; paid chat/completions), zero entitlement (placeholder).
  function snapshotLine(ctx, label, snapshot, resetDate) {
    if (!snapshot || typeof snapshot !== "object") return null;
    const entitlement = num(snapshot.entitlement);
    const remaining = num(snapshot.remaining);
    if (snapshot.unlimited === true || entitlement === -1 || remaining === -1) return null;
    if (entitlement === 0) return null;
    const percentRemaining = num(snapshot.percent_remaining);
    if (percentRemaining !== null) {
      return percentLine(ctx, label, 100 - percentRemaining, resetDate);
    }
    if (entitlement !== null && entitlement > 0 && remaining !== null) {
      return percentLine(ctx, label, 100 - (remaining / entitlement) * 100, resetDate);
    }
    return null;
  }

  // Overage beyond the included Credits pool, only once extra spend is enabled. Real 0 is shown.
  function extraUsageLine(ctx, premium) {
    if (!premium || premium.overage_permitted !== true) return null;
    const overage = Math.max(0, num(premium.overage_count) || 0);
    return ctx.line.text({ label: "Extra Usage", value: formatCount(overage) });
  }

  // Legacy free tier (predates quota_snapshots): remaining vs monthly limit.
  function limitedLine(ctx, label, remaining, total, resetDate) {
    if (num(remaining) === null || num(total) === null || total <= 0) return null;
    const used = Math.max(0, total - remaining);
    return percentLine(ctx, label, Math.round((used / total) * 100), resetDate);
  }

  // Org-managed seat placeholder can still carry the user's own credits_used (no allotment).
  function personalCreditsLine(ctx, premium) {
    const used = premium ? num(premium.credits_used) : null;
    if (used === null || used <= 0) return null;
    return ctx.line.text({ label: "Credits", value: formatCount(used) });
  }

  function githubGet(ctx, url, token) {
    return ctx.util.request({
      method: "GET",
      url: url,
      headers: {
        Authorization: "token " + token,
        Accept: "application/vnd.github+json",
        "User-Agent": "OpenUsage",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      timeoutMs: 15000,
    });
  }

  // Billing summary -> Org Credits / Org Spend, or null when no Copilot AI-credit items.
  function orgUsageLines(ctx, body) {
    const items = body && Array.isArray(body.usageItems) ? body.usageItems : null;
    if (!items) return null;
    const creditItems = items.filter(function (item) {
      if (!item || typeof item.product !== "string" || typeof item.unitType !== "string")
        return false;
      const unit = item.unitType.trim().toLowerCase();
      return (
        item.product.trim().toLowerCase() === "copilot" &&
        (unit === "ai-units" || unit === "ai-credits")
      );
    });
    if (creditItems.length === 0) return null;
    let credits = 0;
    let spend = 0;
    for (const item of creditItems) {
      credits += Math.max(0, num(item.grossQuantity) || 0);
      spend += Math.max(0, num(item.netAmount) || 0);
    }
    return [
      ctx.line.text({ label: "Org Credits", value: formatCount(credits) + " credits" }),
      ctx.line.text({ label: "Org Spend", value: "$" + spend.toFixed(2) }),
    ];
  }

  // One org's summary -> lines, null (no access / no Copilot credits), or "transient" (429/5xx/network).
  function fetchOrgUsage(ctx, org, token) {
    let resp;
    try {
      resp = githubGet(ctx, ORG_USAGE_URL(org), token);
    } catch (e) {
      ctx.host.log.warn("org billing summary request failed: " + String(e));
      return "transient";
    }
    if (resp.status !== 200) {
      ctx.host.log.info("org billing summary for one org: HTTP " + resp.status);
      return resp.status === 429 || resp.status >= 500 ? "transient" : null;
    }
    return orgUsageLines(ctx, ctx.util.tryParseJson(resp.bodyText));
  }

  // Org-managed seat: usage lives in org billing (owner / billing manager only; 403 is expected).
  function orgBillingLines(ctx, token) {
    const cachePath = ctx.app.pluginDataDir + "/billing-org.json";
    const cached = readJson(ctx, cachePath);
    if (cached && typeof cached.org === "string" && cached.org) {
      const result = fetchOrgUsage(ctx, cached.org, token);
      if (result === "transient") return [];
      if (result) return result;
      writeJson(ctx, cachePath, null);
    }

    let resp;
    try {
      resp = githubGet(ctx, USER_ORGS_URL, token);
    } catch (e) {
      ctx.host.log.warn("org list request failed: " + String(e));
      return [];
    }
    if (resp.status !== 200) {
      ctx.host.log.info("org list HTTP " + resp.status + "; skipping org billing lookup");
      return [];
    }
    const orgs = ctx.util.tryParseJson(resp.bodyText);
    if (!Array.isArray(orgs)) return [];
    for (const entry of orgs) {
      const org = entry && typeof entry.login === "string" ? entry.login.trim() : "";
      if (!org) continue;
      const result = fetchOrgUsage(ctx, org, token);
      if (result && result !== "transient") {
        writeJson(ctx, cachePath, { org: org });
        return result;
      }
    }
    return [];
  }

  function mapUsage(ctx, data, token) {
    const resetDate = data.quota_reset_date || data.limited_user_reset_date;
    const snapshots = data.quota_snapshots || {};
    const premium = snapshots.premium_interactions;
    const lines = [];
    const push = (line) => line && lines.push(line);

    const creditsLine = snapshotLine(ctx, "Credits", premium, resetDate);
    push(creditsLine);
    if (creditsLine) push(extraUsageLine(ctx, premium));
    push(snapshotLine(ctx, "Chat", snapshots.chat, resetDate));
    push(snapshotLine(ctx, "Completions", snapshots.completions, resetDate));

    if (lines.length === 0 && data.limited_user_quotas && data.monthly_quotas) {
      const lq = data.limited_user_quotas;
      const mq = data.monthly_quotas;
      push(limitedLine(ctx, "Chat", lq.chat, mq.chat, resetDate));
      push(limitedLine(ctx, "Completions", lq.completions, mq.completions, resetDate));
    }
    if (lines.length > 0) return lines;

    if (data.token_based_billing !== true) {
      throw "Usage data unavailable for this account.";
    }
    // Org-managed seat: personal credits_used plus org billing (best-effort).
    push(personalCreditsLine(ctx, premium));
    for (const line of orgBillingLines(ctx, token)) lines.push(line);
    if (lines.length === 0) {
      lines.push(ctx.line.badge({ label: "Status", text: "No usage data", color: "#a3a3a3" }));
    }
    return lines;
  }

  function probe(ctx) {
    const cred = loadToken(ctx);
    if (!cred) {
      throw "Not logged in. Run `gh auth login` first.";
    }

    let token = cred.token;
    let source = cred.source;

    let resp;
    try {
      resp = fetchUsage(ctx, token);
    } catch (e) {
      ctx.host.log.error("usage request exception: " + String(e));
      throw "Usage request failed. Check your connection.";
    }

    if (resp.status === 401 || resp.status === 403) {
      // If cached token is stale, clear it and try fallback sources
      if (source === "keychain") {
        ctx.host.log.info("cached token invalid, trying fallback sources");
        clearCachedToken(ctx);
        const fallback = loadTokenFromGhCli(ctx);
        if (fallback) {
          try {
            resp = fetchUsage(ctx, fallback.token);
          } catch (e) {
            ctx.host.log.error("fallback usage request exception: " + String(e));
            throw "Usage request failed. Check your connection.";
          }
          if (resp.status >= 200 && resp.status < 300) {
            // Fallback worked, persist the new token
            saveToken(ctx, fallback.token);
            token = fallback.token;
            source = fallback.source;
          }
        }
      }
      // Still failing after retry
      if (resp.status === 401 || resp.status === 403) {
        throw "Token invalid. Run `gh auth login` to re-authenticate.";
      }
    }

    if (resp.status < 200 || resp.status >= 300) {
      ctx.host.log.error("usage returned error: status=" + resp.status);
      throw (
        "Usage request failed (HTTP " +
        String(resp.status) +
        "). Try again later."
      );
    }

    // Persist gh-cli token to OpenUsage keychain for future use
    if (source === "gh-cli") {
      saveToken(ctx, token);
    }

    const data = ctx.util.tryParseJson(resp.bodyText);
    if (data === null) {
      throw "Usage response invalid. Try again later.";
    }

    ctx.host.log.info("usage fetch succeeded");

    let plan = null;
    if (data.copilot_plan) {
      plan = ctx.fmt.planLabel(data.copilot_plan);
    }

    return { plan: plan, lines: mapUsage(ctx, data, token) };
  }

  globalThis.__openusage_plugin = { id: "copilot", probe };
})();
