# Claude Code

> Reverse-engineered, undocumented API. May change without notice.

## Overview

- **Protocol:** REST (plain JSON)
- **Base URL:** `https://api.anthropic.com`
- **Auth provider:** `platform.claude.com` (OAuth 2.0)
- **Client ID:** `9d1c250a-e61b-44d9-88ed-5944d1962f5e`
- **Beta header required:** `anthropic-beta: oauth-2025-04-20`
- **Utilization:** integer percentage (0-100)
- **Credits:** cents (divide by 100 for dollars)
- **Timestamps:** ISO 8601 (response), unix milliseconds (credentials file)

## Endpoints

### GET /api/oauth/usage

Returns rate limit windows and optional extra credits.

#### Headers

| Header | Required | Value |
|---|---|---|
| Authorization | yes | `Bearer <access_token>` |
| Accept | yes | `application/json` |
| Content-Type | yes | `application/json` |
| anthropic-beta | yes | `oauth-2025-04-20` |

#### Response

```jsonc
{
  "five_hour": {
    "utilization": 25,              // % used in 5h rolling window
    "resets_at": "2026-01-28T15:00:00Z"
  },
  "seven_day": {
    "utilization": 40,              // % used in 7-day window
    "resets_at": "2026-02-01T00:00:00Z"
  },
  "seven_day_opus": {               // separate weekly Opus limit (optional, plan-dependent)
    "utilization": 0,
    "resets_at": "2026-02-01T00:00:00Z"
  },
  "seven_day_sonnet": {             // separate weekly Sonnet limit (optional, plan-dependent)
    "utilization": 0,
    "resets_at": "2026-02-01T00:00:00Z"
  },
  "seven_day_omelette": {           // separate weekly Claude Design limit (optional, plan-dependent)
    "utilization": 0,
    "resets_at": "2026-02-01T00:00:00Z"
  },
  "limits": [                       // model-scoped windows (optional)
    {
      "kind": "weekly_scoped",
      "scope": { "model": { "display_name": "Fable" } },
      "percent": 12,                // % used, 0-100
      "resets_at": "2026-02-01T00:00:00Z"
    }
  ],
  "extra_usage": {                  // on-demand overage credits (optional)
    "is_enabled": true,
    "used_credits": 500,            // cents spent
    "monthly_limit": 10000,         // cents cap (0 = unlimited)
    "currency": "USD"
  }
}
```

All windows are enforced simultaneously — hitting any limit throttles the user.

### GET /api/oauth/usage?cedar_ember=1&skip_spend=1

Same endpoint and headers; asks for one-off usage-limit reset grants (`cedar_ember` is Anthropic's
internal name). Upstream `00189454`.

- **User-Agent:** `claude-cli/2.1.294 (external, cli)` on all usage requests — Anthropic gates reset grants by client surface.
- **Rate:** at most once per hour. A failed check (non-2xx, bad JSON, error) keeps the last answer and still counts as that hour's check.

#### Response

```jsonc
{
  "cedar_ember": {                  // absent = program not reported for this plan
    "eligible": true,
    "grants": [
      {
        "resets_left": 1,           // resets still usable in this grant
        "ends_at": "2026-02-10T00:00:00Z"  // deadline (optional)
      }
    ]
  }
}
```

Count = sum of `resets_left` (floored, `< 1` skipped) over grants not yet past `ends_at`.
`eligible !== true` or no grants → `0 available`.

## Displayed Lines

| Line | Source | Notes |
|---|---|---|
| Session | `five_hour` | |
| Weekly | `seven_day` | |
| Fable | `limits[]` entry with `kind: "weekly_scoped"`, `scope.model.display_name: "Fable"` | Overview, below Weekly. Uses `percent`, 7-day period. Upstream `4b068d52`. |
| Sonnet | `seven_day_sonnet` | Detail |
| Claude Design | `seven_day_omelette` | Detail |
| Extra usage spent | `extra_usage` | |
| Rate Limit Resets | `cedar_ember` | Detail. Value `N available` (zh-TW `可用 N 次`). Hidden until the first successful grants check. |

Rate Limit Resets color (soonest deadline, only when count > 0 and a deadline exists):

| Time left | Color |
|---|---|
| ≤ 48 hours | red `#ef4444` |
| ≤ 7 days | yellow `#f59e0b` |
| > 7 days | blue `#3b82f6` |

Subtitle shows the soonest deadline date. Resets whose deadline passes between hourly checks are
dropped from the count locally. To use a reset, run `/rate-limit-options` in Claude Code.

## Authentication

### Token Location

On macOS, OpenUsage reads Claude Code credentials from Keychain first. The default service name is:

```text
Claude Code-credentials
```

When `CLAUDE_CONFIG_DIR` is set, Claude Code may use a config-specific service name instead. OpenUsage checks this hashed name before the default service:

```text
Claude Code-credentials-<sha256(CLAUDE_CONFIG_DIR).slice(0, 8)>
```

Keychain values use the same JSON structure as the legacy credentials file:

```jsonc
{
  "claudeAiOauth": {
    "accessToken": "<jwt>",          // OAuth access token (Bearer)
    "refreshToken": "<token>",
    "expiresAt": 1738300000000,      // unix ms
    "scopes": ["..."],
    "subscriptionType": "pro",
    "rateLimitTier": "..."
  }
}
```

**Fallback:** `~/.claude/.credentials.json`. This file can be left behind by older Claude Code versions, so it is treated as a fallback when Keychain does not contain usable credentials.

### Token Refresh

Access tokens are short-lived JWTs. Refreshed proactively 5 minutes before expiration, or reactively on 401/403.

```
POST https://platform.claude.com/v1/oauth/token
Content-Type: application/json
```

```json
{
  "grant_type": "refresh_token",
  "refresh_token": "<refresh_token>",
  "client_id": "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
  "scope": "user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload"
}
```

```jsonc
{
  "access_token": "<new_jwt>",
  "refresh_token": "<new_refresh_token>",  // may be same as previous
  "expires_in": 3600                       // seconds
}
```
