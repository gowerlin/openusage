import type { ResetTimerDisplayMode, TimeFormatMode } from "@/lib/settings"
import { formatCompactDuration } from "@/lib/pace-tooltip"
import { DEFAULT_LOCALE, t, type Locale } from "@/lib/i18n"

const timeFormatterCache = new Map<string, Intl.DateTimeFormat>()

export function getTimeFormatter(mode: TimeFormatMode, locale: Locale = DEFAULT_LOCALE): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${mode}`
  const cached = timeFormatterCache.get(cacheKey)
  if (cached) return cached
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" }
  if (mode === "12h") opts.hour12 = true
  else if (mode === "24h") opts.hour12 = false
  // "auto" leaves hour12 unset so the user's locale decides.
  const formatterLocale = locale === DEFAULT_LOCALE ? undefined : locale
  const formatter = new Intl.DateTimeFormat(formatterLocale, opts)
  timeFormatterCache.set(cacheKey, formatter)
  return formatter
}

const RESET_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

const RESET_SOON_THRESHOLD_MS = 5 * 60 * 1000

function parseResetTimestamp(resetsAtIso: string): number | null {
  const resetsAtMs = Date.parse(resetsAtIso)
  return Number.isFinite(resetsAtMs) ? resetsAtMs : null
}

function getLocalDayIndex(timestampMs: number): number {
  const date = new Date(timestampMs)
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
}

function formatMonthDay(timestampMs: number, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return RESET_MONTH_DAY_FORMATTER.format(timestampMs)
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(timestampMs)
}

export function formatResetRelativeLabel(
  nowMs: number,
  resetsAtIso: string,
  locale: Locale = DEFAULT_LOCALE,
): string | null {
  const resetsAtMs = parseResetTimestamp(resetsAtIso)
  if (resetsAtMs === null) return null
  const deltaMs = resetsAtMs - nowMs
  if (deltaMs < RESET_SOON_THRESHOLD_MS) return t(locale, "reset.soon")
  const durationText = formatCompactDuration(deltaMs, locale)
  return durationText ? `${t(locale, "reset.in")} ${durationText}${t(locale, "reset.inSuffix")}` : null
}

export function formatResetAbsoluteLabel(
  nowMs: number,
  resetsAtIso: string,
  timeFormatMode: TimeFormatMode = "auto",
  locale: Locale = DEFAULT_LOCALE,
): string | null {
  const resetsAtMs = parseResetTimestamp(resetsAtIso)
  if (resetsAtMs === null) return null
  if (resetsAtMs - nowMs <= 0) return t(locale, "reset.soon")
  const dayDiff = getLocalDayIndex(resetsAtMs) - getLocalDayIndex(nowMs)
  const timeText = getTimeFormatter(timeFormatMode, locale).format(resetsAtMs)
  if (dayDiff <= 0) return `${t(locale, "reset.todayAt")} ${timeText}`
  if (dayDiff === 1) return `${t(locale, "reset.tomorrowAt")} ${timeText}`
  const dateText = formatMonthDay(resetsAtMs, locale)
  return `${t(locale, "reset.dateAt")} ${dateText} ${t(locale, "reset.at")} ${timeText}`.replace(/\s+/g, " ").trim()
}

export function formatResetTooltipText({
  nowMs,
  resetsAtIso,
  visibleMode,
  timeFormatMode = "auto",
  locale = DEFAULT_LOCALE,
}: {
  nowMs: number
  resetsAtIso: string
  visibleMode: ResetTimerDisplayMode
  timeFormatMode?: TimeFormatMode
  locale?: Locale
}): string | null {
  return visibleMode === "absolute"
    ? formatResetRelativeLabel(nowMs, resetsAtIso, locale)
    : formatResetAbsoluteLabel(nowMs, resetsAtIso, timeFormatMode, locale)
}
