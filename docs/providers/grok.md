# Grok

Tracks Grok Build weekly credit pool and pay-as-you-go cap from the local Grok CLI login.

> Reverse-engineered, undocumented API. May change without notice.

## Overview

- **Protocol:** REST (plain JSON)
- **Base URL:** `https://cli-chat-proxy.grok.com/v1`
- **Auth:** cached Grok CLI token from `~/.grok/auth.json`
- **Refresh:** Grok CLI refresh token from the same file
- **Usage unit:** percent (credits), raw billing units (legacy)
- **Plan source:** `GET /settings` (`subscription_tier_display`)
- **Reset period:** `currentPeriod` from the credits response (weekly for unified billing)

## Setup

1. Install and sign in to the Grok CLI:

```bash
grok login
```

2. Enable the Grok plugin in OpenUsage settings.

OpenUsage reads the same local auth file that the Grok CLI uses. Access tokens are refreshed automatically before expiry when a `refresh_token` is present. If refresh fails, run `grok login` again.

## Endpoints

Both billing calls use the same headers:

| Header | Required | Value |
|--------|----------|-------|
| Authorization | yes | `Bearer <token from ~/.grok/auth.json>` |
| X-XAI-Token-Auth | yes | `xai-grok-cli` |
| Accept | yes | `application/json` |

### GET /billing?format=credits (primary)

Same call the Grok CLI makes. Returns the unified-billing credit pool. A 401/403 triggers one
token refresh and retry. Upstream `5fcb4312`.

#### Response

```jsonc
{
  "config": {
    "currentPeriod": {
      "type": "USAGE_PERIOD_TYPE_WEEKLY",   // non-weekly = account not migrated -> no Weekly line
      "start": "2026-10-13T00:00:00.238389+00:00",
      "end": "2026-10-20T00:00:00.238389+00:00"
    },
    "creditUsagePercent": 37.5,             // proto-JSON: missing = 0
    "onDemandCap": { "val": 2500 }          // pay-as-you-go cap; missing = 0 (disabled)
  }
}
```

#### Team accounts

Team / business principals get `HTTP 412` with `{"error":"No personal team"}`: no personal quota on
this surface. Upstream `37f9a219`. OpenUsage falls back to the legacy call; if that has no
`monthlyLimit` either, the card shows "Grok team accounts have no personal quota."

### GET /billing (legacy, optional)

Older monthly credit budget. Shown only when the response has a usable `monthlyLimit`
(unified-billing accounts may no longer return one).

```json
{
  "config": {
    "monthlyLimit": { "val": 60000 },
    "used": { "val": 4277 },
    "onDemandCap": { "val": 0 },
    "billingPeriodStart": "2026-05-01T00:00:00+00:00",
    "billingPeriodEnd": "2026-06-01T00:00:00+00:00"
  }
}
```

Used fields: `used.val`, `monthlyLimit.val` (> 0), `billingPeriodEnd` (reset), `onDemandCap.val`
(Pay as you go only when the credits call failed).

### GET /settings

Returns remote CLI settings. OpenUsage reads `subscription_tier_display` from this response and shows it as the provider plan label, for example `SuperGrok Heavy`.

## Displayed Lines

| Line | Source | Description |
|------|--------|-------------|
| Weekly | credits | Percent of the shared weekly pool used, resets at `currentPeriod.end` |
| Credits used | legacy | Percent of `monthlyLimit` used (only when `monthlyLimit` is present) |
| Pay as you go | credits (legacy if credits failed) | `{onDemandCap} cap`, or `Disabled` when 0 |

Credits call failed but legacy works → legacy lines only. Both failed → error from the credits call.

## Errors

| Condition | Message |
|-----------|---------|
| Missing auth file | "Grok not logged in. Run `grok login`." |
| No usable token in auth file | "Grok auth invalid. Run `grok login` again." |
| Team account, no legacy meter | "Grok team accounts have no personal quota." |
| Expired token with no refresh token | "Grok auth expired. Run `grok login` again." |
| Refresh token rejected | "Grok auth expired. Run `grok login` again." |
| 401/403 after retry | "Grok auth expired. Run `grok login` again." |
| HTTP error | "Grok billing request failed (HTTP {status}). Try again later." |
| Network error | "Grok billing request failed. Check your connection." |
| Invalid response | "Grok billing response changed." |
