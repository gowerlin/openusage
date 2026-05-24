import { useEffect } from "react"
import type { ThemeMode } from "@/lib/settings"

const MACARON_THEME_CLASSES = {
  "macaron-pink": "theme-macaron-pink",
  "macaron-green": "theme-macaron-green",
  "macaron-blue": "theme-macaron-blue",
} as const satisfies Partial<Record<ThemeMode, string>>

const macaronClasses = Object.values(MACARON_THEME_CLASSES)

export function useSettingsTheme(themeMode: ThemeMode) {
  useEffect(() => {
    const root = document.documentElement
    const clearMacaronThemes = () => {
      root.classList.remove(...macaronClasses)
    }
    const apply = (dark: boolean) => {
      clearMacaronThemes()
      root.classList.toggle("dark", dark)
    }

    const macaronClass = (MACARON_THEME_CLASSES as Partial<Record<ThemeMode, string>>)[themeMode]
    if (macaronClass) {
      clearMacaronThemes()
      root.classList.remove("dark")
      root.classList.add(macaronClass)
      return
    }

    if (themeMode === "light") {
      apply(false)
      return
    }
    if (themeMode === "dark") {
      apply(true)
      return
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    apply(mq.matches)
    const handler = (e: MediaQueryListEvent) => apply(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [themeMode])
}
