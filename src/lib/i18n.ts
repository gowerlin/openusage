const en = {
  "settings.language.title": "Language",
  "settings.language.description": "Choose the app language",
  "settings.language.option.en": "English",
  "settings.language.option.zhTW": "Traditional Chinese",
  "settings.language.ariaLabel": "Language",
} as const

export type Locale = "en" | "zh-TW"
export type I18nKey = keyof typeof en

export const DEFAULT_LOCALE: Locale = "en"
export const SUPPORTED_LOCALES = ["en", "zh-TW"] as const satisfies readonly Locale[]

export const resources: Record<Locale, Record<I18nKey, string>> = {
  en,
  "zh-TW": {
    "settings.language.title": "語言",
    "settings.language.description": "選擇應用程式語言",
    "settings.language.option.en": "英文",
    "settings.language.option.zhTW": "繁體中文",
    "settings.language.ariaLabel": "語言",
  },
}

export const LOCALE_OPTIONS: { value: Locale; labelKey: I18nKey }[] = [
  { value: "en", labelKey: "settings.language.option.en" },
  { value: "zh-TW", labelKey: "settings.language.option.zhTW" },
]

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
}

export function t(locale: Locale, key: I18nKey): string {
  if (!isLocale(locale)) {
    throw new Error(`Unsupported locale: ${String(locale)}`)
  }

  const value = resources[locale][key]
  if (value == null) {
    throw new Error(`Missing i18n resource: ${locale}.${String(key)}`)
  }
  return value
}
