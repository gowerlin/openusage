import { describe, expect, it } from "vitest"
import {
  DEFAULT_LOCALE,
  resources,
  SUPPORTED_LOCALES,
  t,
  translateDisplayLabel,
  translateDisplayValue,
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
    expect(t("zh-TW", "footer.paused")).toBe("已暫停")
  })

  it("translates macaron theme labels", () => {
    expect(t("en", "settings.appTheme.option.macaronPink")).toBe("Macaron Pink")
    expect(t("en", "settings.appTheme.option.macaronGreen")).toBe("Macaron Green")
    expect(t("en", "settings.appTheme.option.macaronBlue")).toBe("Macaron Blue")
    expect(t("zh-TW", "settings.appTheme.option.macaronPink")).toBe("馬卡龍粉")
    expect(t("zh-TW", "settings.appTheme.option.macaronGreen")).toBe("馬卡龍綠")
    expect(t("zh-TW", "settings.appTheme.option.macaronBlue")).toBe("馬卡龍藍")
  })

  it("translates app-owned plugin labels and preserves unknown runtime labels", () => {
    expect(translateDisplayLabel("en", "Session")).toBe("Session")
    expect(translateDisplayLabel("zh-TW", "Session")).toBe("工作階段")
    expect(translateDisplayLabel("zh-TW", "Provider-specific label")).toBe("Provider-specific label")
  })

  it("translates labels and settings merged from upstream tauri-legacy", () => {
    expect(translateDisplayLabel("zh-TW", "Usage Trend")).toBe("用量趨勢")
    expect(translateDisplayLabel("zh-TW", "Rate Limit Resets")).toBe("速率限制重置")
    expect(translateDisplayLabel("zh-TW", "Weekly quota")).toBe("每週配額")
    expect(translateDisplayLabel("zh-TW", "Daily quota")).toBe("每日配額")
    expect(translateDisplayLabel("zh-TW", "Extra usage balance")).toBe("額外用量餘額")
    expect(t("zh-TW", "settings.menubarMetric.title")).toBe("指標")
    expect(t("zh-TW", "settings.menubarMetric.option.weekly")).toBe("每週")
  })

  it("translates the usage history runner hint and preserves other values", () => {
    expect(translateDisplayLabel("zh-TW", "Usage history")).toBe("用量歷史")
    expect(translateDisplayValue("en", "Needs Node.js or Bun")).toBe(
      "Needs Node.js or Bun"
    )
    expect(translateDisplayValue("zh-TW", "Needs Node.js or Bun")).toBe(
      "需要 Node.js 或 Bun"
    )
    expect(translateDisplayValue("zh-TW", "Free")).toBe("Free")
  })

  it("translates rate limit reset grants values", () => {
    expect(translateDisplayValue("en", "1 available")).toBe("1 available")
    expect(translateDisplayValue("zh-TW", "1 available")).toBe("可用 1 次")
    expect(translateDisplayValue("zh-TW", "0 available")).toBe("可用 0 次")
    expect(translateDisplayValue("zh-TW", "12 available")).toBe("可用 12 次")
    expect(translateDisplayValue("zh-TW", "1.5 available")).toBe("1.5 available")
    expect(translateDisplayValue("zh-TW", "Not available")).toBe("Not available")
    expect(translateDisplayValue("zh-TW", "Pro")).toBe("Pro")
    expect(translateDisplayValue("zh-TW", "Free")).toBe("Free")
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
