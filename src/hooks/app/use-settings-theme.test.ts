import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useSettingsTheme } from "@/hooks/app/use-settings-theme"
import type { ThemeMode } from "@/lib/settings"

const originalMatchMedia = window.matchMedia

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe("useSettingsTheme", () => {
  beforeEach(() => {
    document.documentElement.className = ""
    mockMatchMedia(false)
  })

  afterEach(() => {
    document.documentElement.className = ""
    window.matchMedia = originalMatchMedia
  })

  it("applies a macaron root class and clears dark plus other macaron classes", () => {
    document.documentElement.classList.add("dark", "theme-macaron-green")

    renderHook(() => useSettingsTheme("macaron-pink" as ThemeMode))

    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.classList.contains("theme-macaron-pink")).toBe(true)
    expect(document.documentElement.classList.contains("theme-macaron-green")).toBe(false)
    expect(document.documentElement.classList.contains("theme-macaron-blue")).toBe(false)
  })

  it("removes macaron classes when returning to system mode", () => {
    mockMatchMedia(true)
    document.documentElement.classList.add("theme-macaron-blue")

    renderHook(() => useSettingsTheme("system"))

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("theme-macaron-pink")).toBe(false)
    expect(document.documentElement.classList.contains("theme-macaron-green")).toBe(false)
    expect(document.documentElement.classList.contains("theme-macaron-blue")).toBe(false)
  })

  it("cleans macaron classes when switching to light mode", () => {
    const { rerender } = renderHook(
      ({ mode }) => useSettingsTheme(mode as ThemeMode),
      { initialProps: { mode: "macaron-blue" } }
    )

    expect(document.documentElement.classList.contains("theme-macaron-blue")).toBe(true)

    rerender({ mode: "light" })

    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.classList.contains("theme-macaron-blue")).toBe(false)
  })
})
