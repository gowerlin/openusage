import { describe, expect, it, beforeEach } from "vitest"
import { useAppPreferencesStore } from "@/stores/app-preferences-store"

describe("useAppPreferencesStore", () => {
  beforeEach(() => {
    useAppPreferencesStore.getState().resetState()
  })

  it("defaults language to English", () => {
    expect(useAppPreferencesStore.getState().language).toBe("en")
  })

  it("updates language", () => {
    useAppPreferencesStore.getState().setLanguage("zh-TW")
    expect(useAppPreferencesStore.getState().language).toBe("zh-TW")
  })
})
