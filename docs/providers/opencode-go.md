# OpenCode Go

> Reads OpenCode Go plan usage from OpenCode's official usage API (account-wide, same numbers as the OpenCode dashboard).

## Overview

- **Source of truth:** `GET https://opencode.ai/zen/go/v1/usage`
- **Auth:** `opencode-go` API key from `~/.local/share/opencode/auth.json`, sent as `Authorization: Bearer <key>`
  - Windows: `%USERPROFILE%\.local\share\opencode\auth.json` (per [OpenCode troubleshooting docs](https://opencode.ai/docs/troubleshooting))
- **Provider ID:** `opencode-go`
- **Usage scope:** account-wide (includes usage from other machines)

## Detection

The plugin needs `auth.json` with an `opencode-go` entry holding a non-empty `key`. Without it the probe shows: `OpenCode Go not detected. Log in with OpenCode Go first.`

## Response

```json
{
  "usage": {
    "rolling": { "status": "ok", "percent": 12, "resetsAt": "2026-07-12T13:30:00.662Z" },
    "weekly":  { "status": "ok", "percent": 8,  "resetsAt": "2026-07-13T00:00:00.662Z" },
    "monthly": { "status": "rate-limited", "percent": 100, "resetsAt": "2026-08-04T11:18:32.662Z" }
  }
}
```

| Line | Field | Period |
|---|---|---|
| Session | `usage.rolling` | rolling 5h |
| Weekly | `usage.weekly` | 7 days |
| Monthly | `usage.monthly` | billing cycle (~30 days) |

`percent` is shown as a 0–100 percent bar; `resetsAt` drives the reset countdown.

While the rolling window has no usage, the API answers `resetsAt = now + 5h` on every request. A 0% Session whose reset sits within 2s of exactly 5h from the response `Date` header (local clock if missing) is treated as that placeholder and shows no countdown.

## Errors

- `401` → `OpenCode Go key was rejected. Log into OpenCode Go again.`
- `403` with `error.type = "EntitlementError"` → `No OpenCode Go subscription on this key.`
- other non-2xx → `Request failed (HTTP <status>). Try again later.`
- unreadable / invalid `auth.json` → explicit error (not treated as logged out)

## Not supported

- OpenCode 2 `credential` table in `opencode*.db` (key stored in SQLite instead of `auth.json`).
- `OPENCODE_DATA_DIR` / `XDG_DATA_HOME` overrides (not in the host env whitelist).
- Local spend tiles (Zen / Go dollars from SQLite logs).
