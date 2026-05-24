import { describe, expect, it } from "vitest"
import {
  DEFAULT_LOCALE,
  resources,
  SUPPORTED_LOCALES,
  t,
  type I18nKey,
  type Locale,
} from "@/lib/i18n"

describe("i18n", () => {
  it("defaults to English and includes Traditional Chinese", () => {
    expect(DEFAULT_LOCALE).toBe("en")
    expect(SUPPORTED_LOCALES).toEqual(["en", "zh-TW"])
  })

  it("keeps locale resource keys complete", () => {
    const enKeys = Object.keys(resources.en).sort()
    const zhTwKeys = Object.keys(resources["zh-TW"]).sort()
    expect(zhTwKeys).toEqual(enKeys)
  })

  it("translates typed keys for each supported locale", () => {
    expect(t("en", "settings.language.title")).toBe("Language")
    expect(t("zh-TW", "settings.language.title")).toBe("語言")
  })

  it("fails loud for unsupported locales or missing keys", () => {
    expect(() => t("fr" as Locale, "settings.language.title")).toThrow(
      "Unsupported locale: fr"
    )
    expect(() => t("en", "settings.language.missing" as I18nKey)).toThrow(
      "Missing i18n resource"
    )
  })
})
