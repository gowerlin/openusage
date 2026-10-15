import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { trayMock, getByIdMock } = vi.hoisted(() => {
  const trayMock = {
    setIcon: vi.fn(),
    setIconAsTemplate: vi.fn(),
    setTitle: vi.fn(),
    setTooltip: vi.fn(),
  }
  return { trayMock, getByIdMock: vi.fn() }
})

vi.mock("@tauri-apps/api/tray", () => ({
  TrayIcon: { getById: getByIdMock },
}))

vi.mock("@tauri-apps/api/path", () => ({
  resolveResource: () => Promise.resolve("icons/tray-icon.png"),
}))

vi.mock("@/lib/tray-bars-icon", () => ({
  getTrayIconSizePx: () => 36,
  renderTrayBarsIcon: () => Promise.resolve("img"),
}))

vi.mock("@/lib/tray-primary-progress", () => ({
  getTrayPrimaryBars: () => [{ id: "claude", fraction: 0.5 }],
}))

vi.mock("@/lib/tray-tooltip", () => ({
  formatTrayPercentText: () => "50%",
  formatTrayTooltip: (_bars: unknown, _meta: unknown, _weekly: boolean, locale: string) =>
    `tooltip:${locale}`,
}))

import { useTrayIcon } from "@/hooks/app/use-tray-icon"
import { useAppPreferencesStore } from "@/stores/app-preferences-store"

const args = {
  pluginsMeta: [{ id: "claude", name: "Claude", iconUrl: "", lines: [], primaryCandidates: [] }],
  pluginSettings: { order: ["claude"], disabled: [] },
  pluginStates: {},
  displayMode: "used" as const,
  menubarIconStyle: "bars" as const,
  menubarMetric: "session" as const,
  activeView: "home",
}

describe("useTrayIcon", () => {
  beforeEach(() => {
    for (const fn of Object.values(trayMock)) fn.mockReset().mockResolvedValue(undefined)
    getByIdMock.mockReset().mockResolvedValue(trayMock)
    useAppPreferencesStore.setState({ language: "en" })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("recomputes the tray tooltip when the language changes", async () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel")
    renderHook(() => useTrayIcon(args))
    await waitFor(() => expect(trayMock.setTooltip).toHaveBeenLastCalledWith("tooltip:en"))

    act(() => {
      useAppPreferencesStore.setState({ language: "zh-TW" })
    })
    await waitFor(() => expect(trayMock.setTooltip).toHaveBeenLastCalledWith("tooltip:zh-TW"))
  })

  it("keeps the Windows desktop tray icon untouched on language change", async () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("Win32")
    renderHook(() => useTrayIcon(args))
    await waitFor(() => expect(getByIdMock).toHaveBeenCalled())

    act(() => {
      useAppPreferencesStore.setState({ language: "zh-TW" })
    })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(trayMock.setTooltip).not.toHaveBeenCalled()
    expect(trayMock.setIcon).not.toHaveBeenCalled()
  })
})
