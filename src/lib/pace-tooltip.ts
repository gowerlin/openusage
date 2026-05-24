import type { PaceResult, PaceStatus } from "@/lib/pace-status"
import type { ProgressFormat } from "@/lib/plugin-types"
import type { DisplayMode } from "@/lib/settings"
import { formatCountNumber, formatFixedPrecisionNumber } from "@/lib/utils"
import { DEFAULT_LOCALE, t, type Locale } from "@/lib/i18n"

export function getPaceStatusText(status: PaceStatus, locale: Locale = DEFAULT_LOCALE): string {
  if (status === "ahead") return t(locale, "pace.ahead")
  if (status === "on-track") return t(locale, "pace.onTrack")
  return t(locale, "pace.behind")
}

export function formatCompactDuration(deltaMs: number, locale: Locale = DEFAULT_LOCALE): string | null {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return null
  const totalSeconds = Math.floor(deltaMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60
  const dayUnit = t(locale, "duration.day")
  const hourUnit = t(locale, "duration.hour")
  const minuteUnit = t(locale, "duration.minute")

  if (days > 0) return `${days}${dayUnit} ${hours}${hourUnit}`
  if (totalHours > 0) return `${totalHours}${hourUnit} ${minutes}${minuteUnit}`
  if (totalMinutes > 0) return `${totalMinutes}${minuteUnit}`
  return t(locale, "duration.lessThanMinute")
}

function getRunsOutDurationText({
  paceResult,
  used,
  limit,
  periodDurationMs,
  resetsAtMs,
  nowMs,
  locale = DEFAULT_LOCALE,
}: {
  paceResult: PaceResult | null
  used: number
  limit: number
  periodDurationMs: number
  resetsAtMs: number
  nowMs: number
  locale?: Locale
}): string | null {
  if (!paceResult || paceResult.status !== "behind") return null
  const rate = paceResult.projectedUsage / periodDurationMs
  if (rate <= 0) return null
  const etaMs = (limit - used) / rate
  const remainingMs = resetsAtMs - nowMs
  if (etaMs <= 0 || etaMs >= remainingMs) return null
  return formatCompactDuration(etaMs, locale)
}

/**
 * ETA text for when usage will hit the limit, e.g. "Runs out in 4d 5h".
 * Returns null if not behind pace or ETA can't be computed.
 */
export function formatRunsOutText({
  paceResult,
  used,
  limit,
  periodDurationMs,
  resetsAtMs,
  nowMs,
  locale = DEFAULT_LOCALE,
}: {
  paceResult: PaceResult | null
  used: number
  limit: number
  periodDurationMs: number
  resetsAtMs: number
  nowMs: number
  locale?: Locale
}): string | null {
  const durationText = getRunsOutDurationText({ paceResult, used, limit, periodDurationMs, resetsAtMs, nowMs, locale })
  return durationText ? `${t(locale, "pace.runsOutIn")} ${durationText}${t(locale, "pace.runsOutSuffix")}` : null
}

export function buildPaceDetailText({
  paceResult,
  used,
  limit,
  periodDurationMs,
  resetsAtMs,
  nowMs,
  displayMode,
  locale = DEFAULT_LOCALE,
}: {
  paceResult: PaceResult | null
  used: number
  limit: number
  periodDurationMs: number
  resetsAtMs: number
  nowMs: number
  displayMode: DisplayMode
  locale?: Locale
}): string | null {
  if (!paceResult || !Number.isFinite(limit) || limit <= 0 || paceResult.projectedUsage === 0) return null

  if (paceResult.status === "behind") {
    const durationText = getRunsOutDurationText({ paceResult, used, limit, periodDurationMs, resetsAtMs, nowMs, locale })
    if (durationText) return `${t(locale, "pace.limitIn")} ${durationText}${t(locale, "pace.limitSuffix")}`
  }

  // Show projected % at reset (clamped to 100%)
  const projectedPercent = Math.min(100, Math.round((paceResult.projectedUsage / limit) * 100))
  const shownPercent = displayMode === "left" ? 100 - projectedPercent : projectedPercent
  const suffix = displayMode === "left" ? t(locale, "pace.leftAtReset") : t(locale, "pace.usedAtReset")
  return `${shownPercent}% ${suffix}`
}

export function formatDeficitText(
  deficit: number,
  format: ProgressFormat,
  displayMode: DisplayMode,
  locale: Locale = DEFAULT_LOCALE
): string | null {
  if (!Number.isFinite(deficit) || deficit <= 0) return null

  const suffix = displayMode === "left" ? t(locale, "pace.short") : t(locale, "pace.inDeficit")
  if (format.kind === "percent") {
    const roundedPercent = Math.round(deficit)
    return roundedPercent > 0 ? `${roundedPercent}% ${suffix}` : null
  }

  const roundedToCents = Math.round(deficit * 100) / 100
  if (roundedToCents <= 0) return null

  if (format.kind === "dollars") return `$${formatFixedPrecisionNumber(roundedToCents)} ${suffix}`
  return `${formatCountNumber(roundedToCents)} ${format.suffix} ${suffix}`
}
