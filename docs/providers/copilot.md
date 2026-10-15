# GitHub Copilot

Tracks GitHub Copilot AI credits and quotas for paid, free, and org-managed (Business / Enterprise) seats.

## Authentication

The plugin looks for a GitHub token in this order:

1. **OpenUsage Keychain** (`OpenUsage-copilot`) — Token previously cached by the plugin
2. **GitHub CLI Keychain** (`gh:github.com`) — Token from `gh auth login`
3. **State File** (`auth.json`) — Fallback file-based storage

### Setup

Install and authenticate with the GitHub CLI:

```bash
# Install gh CLI (macOS)
brew install gh

# Authenticate
gh auth login
```

Choose "GitHub.com" and follow the prompts. The plugin will automatically read the token from the gh CLI keychain.

Once authenticated via gh CLI, the plugin caches the token in the OpenUsage keychain for faster access on subsequent probes.

## API

**Endpoint:** `https://api.github.com/copilot_internal/user`

**Headers:**
```
Authorization: token <token>
Accept: application/json
Editor-Version: vscode/1.96.2
Editor-Plugin-Version: copilot-chat/0.26.7
User-Agent: GitHubCopilotChat/0.26.7
X-Github-Api-Version: 2025-04-01
```

### Response (Paid Tier)

Since June 2026 Copilot bills all plans by **AI credits**; `premium_interactions` is the credit pool.

```jsonc
{
  "copilot_plan": "pro",
  "quota_reset_date": "2026-07-01T00:00:00Z",
  "quota_snapshots": {
    "premium_interactions": {       // AI credits pool -> Credits
      "percent_remaining": 80,
      "entitlement": 300,
      "remaining": 240,
      "overage_permitted": true,    // extra spend enabled -> Extra Usage line
      "overage_count": 12,          // usage beyond included credits
      "quota_id": "premium_interactions"
    },
    "chat": {                       // unlimited on paid plans -> no line
      "unlimited": true,
      "entitlement": -1,
      "remaining": -1
    },
    "completions": { "unlimited": true, "entitlement": -1, "remaining": -1 }
  }
}
```

### Response (Free Tier)

Either `quota_snapshots` with finite `chat` / `completions` buckets, or the legacy shape:

```json
{
  "copilot_plan": "individual",
  "access_type_sku": "free_limited_copilot",
  "limited_user_quotas": {
    "chat": 410,
    "completions": 4000
  },
  "monthly_quotas": {
    "chat": 500,
    "completions": 4000
  },
  "limited_user_reset_date": "2025-02-11"
}
```

### Response (Org-managed seat)

Copilot Business / Enterprise assigned by an organization returns no per-seat allotment:

```jsonc
{
  "copilot_plan": "business",
  "token_based_billing": true,      // org-managed seat marker
  "quota_snapshots": {
    "premium_interactions": {
      "entitlement": 0,             // placeholder, no allotment
      "credits_used": 42            // the user's own credits (optional)
    }
  }
}
```

### Org billing (org-managed seats only)

Public REST API, headers `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`:

1. `GET https://api.github.com/user/orgs?per_page=100`
2. `GET https://api.github.com/orgs/{org}/settings/billing/usage/summary` per org, until one has
   `usageItems[]` with `product: "copilot"` and `unitType` `ai-units` / `ai-credits`.

- Sums `grossQuantity` → Org Credits, `netAmount` → Org Spend.
- Needs **org owner or billing manager**; members get 403 (expected, skipped).
- Matching org cached in `billing-org.json`; re-discovered when it stops answering. 429 / 5xx / network → no org lines this refresh, cache kept.
- Numbers are **organization-wide**, not the user's share. Org Credits is a count (API has no org allotment).

Upstream `c6e4cb95` (AI Credits + Extra Usage), `8b567aee` (org-level credits).

## Displayed Lines

| Line        | When | Description |
|-------------|------|-------------|
| Credits     | Paid | AI credits used (percent of `premium_interactions`) |
| Extra Usage | Paid, `overage_permitted: true` | `overage_count` beyond included credits; real 0 shown |
| Chat        | Free | Chat messages used (percent) |
| Completions | Free | Code completions used (percent) |
| Credits     | Org-managed | Personal `credits_used` as a count (only when > 0) |
| Org Credits | Org-managed, org admin | Org-wide AI credits this month (`N credits`) |
| Org Spend   | Org-managed, org admin | Org-wide billed amount (`$N.NN`) |

- Unlimited buckets (`unlimited: true` or `-1`) and zero-entitlement placeholders produce no line.
- Org-managed seat with no personal credits and no org access → `Status: No usage data` badge.
- Progress lines include `resetsAt` and a 30-day `periodDurationMs` (2592000000ms).

## Errors

| Condition       | Message                                           |
|-----------------|---------------------------------------------------|
| No token found  | "Not logged in. Run `gh auth login` first."       |
| 401/403         | "Token invalid. Run `gh auth login` to re-authenticate." |
| HTTP error      | "Usage request failed (HTTP {status}). Try again later." |
| Network error   | "Usage request failed. Check your connection."    |
| Invalid JSON    | "Usage response invalid. Try again later."        |
| No meters, not org-managed | "Usage data unavailable for this account." |

## Windows

The keychain host API is macOS-only. On Windows, `gh auth login` stores its token in Windows
Credential Manager, which the plugin cannot read, so the panel shows "Not logged in" unless a
token exists in the plugin's `auth.json`.
