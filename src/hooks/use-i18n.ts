import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { t as translate, type I18nKey, type Locale } from "@/lib/i18n"
import { useAppPreferencesStore } from "@/stores/app-preferences-store"

export function useI18n(localeOverride?: Locale) {
  const { language, setLanguage } = useAppPreferencesStore(
    useShallow((state) => ({
      language: state.language,
      setLanguage: state.setLanguage,
    }))
  )
  const locale = localeOverride ?? language
  const t = useCallback((key: I18nKey) => translate(locale, key), [locale])

  return {
    locale,
    setLocale: setLanguage,
    setLanguage,
    t,
  }
}
