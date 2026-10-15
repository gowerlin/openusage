import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { openUrl } from "@tauri-apps/plugin-opener"
import { invoke } from "@tauri-apps/api/core"

import { SideNav } from "@/components/side-nav"

const darkModeState = vi.hoisted(() => ({
  useDarkModeMock: vi.fn(() => false),
}))

vi.mock("@/hooks/use-dark-mode", () => ({
  useDarkMode: darkModeState.useDarkModeMock,
}))

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn(() => Promise.resolve()),
}))

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve()),
}))

describe("SideNav", () => {
  it("calls onViewChange for Home and Settings", async () => {
    const onViewChange = vi.fn()
    render(<SideNav activeView="home" onViewChange={onViewChange} plugins={[]} />)

    await userEvent.click(screen.getByRole("button", { name: "Settings" }))
    expect(onViewChange).toHaveBeenCalledWith("settings")

    await userEvent.click(screen.getByRole("button", { name: "Home" }))
    expect(onViewChange).toHaveBeenCalledWith("home")
  })

  it("renders plugin icon button and uses brand color when appropriate", () => {
    const onViewChange = vi.fn()
    render(
      <SideNav
        activeView="home"
        onViewChange={onViewChange}
        plugins={[
          { id: "p1", name: "Plugin 1", iconUrl: "icon.svg", brandColor: "#ff0000" },
        ]}
      />
    )

    const btn = screen.getByRole("button", { name: "Plugin 1" })
    expect(btn).toBeInTheDocument()

    const icon = screen.getByRole("img", { name: "Plugin 1" })
    expect(icon).toHaveStyle({ backgroundColor: "#ff0000" })
  })

  it("falls back to currentColor (light) or white (dark) for low-contrast brand colors", () => {
    const onViewChange = vi.fn()

    // Light mode + very light color => currentColor
    darkModeState.useDarkModeMock.mockReturnValueOnce(false)
    const { rerender } = render(
      <SideNav
        activeView="home"
        onViewChange={onViewChange}
        plugins={[{ id: "p", name: "P", iconUrl: "icon.svg", brandColor: "#ffffff" }]}
      />
    )
    const pStyle = screen.getByRole("img", { name: "P" }).getAttribute("style") ?? ""
    expect(pStyle).toMatch(/background-color:\s*currentcolor/i)

    // Dark mode + very dark color => white
    darkModeState.useDarkModeMock.mockReturnValueOnce(true)
    rerender(
      <SideNav
        activeView="home"
        onViewChange={onViewChange}
        plugins={[{ id: "p2", name: "P2", iconUrl: "icon.svg", brandColor: "#000000" }]}
      />
    )
    const p2Style = screen.getByRole("img", { name: "P2" }).getAttribute("style") ?? ""
    expect(p2Style).toContain("rgb(255, 255, 255)")
  })

  it("opens the issues page and hides the panel from Help", async () => {
    const onViewChange = vi.fn()
    render(<SideNav activeView="home" onViewChange={onViewChange} plugins={[]} />)

    await userEvent.click(screen.getByRole("button", { name: "Help" }))

    expect(openUrl).toHaveBeenCalledWith("https://github.com/gowerlin/openusage/issues")
    expect(invoke).toHaveBeenCalledWith("hide_panel")
  })
  describe("Token dashboard", () => {
    const mockInvoke = (launch: unknown, status = { running: false, managed: false }) => {
      vi.mocked(invoke).mockImplementation(((cmd: string) => {
        if (cmd === "launch_token_dashboard") return Promise.resolve(launch)
        if (cmd === "token_dashboard_status") return Promise.resolve(status)
        return Promise.resolve()
      }) as typeof invoke)
    }

    afterEach(() => {
      vi.mocked(invoke).mockReset()
      vi.mocked(invoke).mockImplementation((() => Promise.resolve()) as unknown as typeof invoke)
      vi.mocked(openUrl).mockClear()
      vi.restoreAllMocks()
    })

    it("renders above Help and launches, then hides the panel", async () => {
      mockInvoke({ kind: "started" })
      render(<SideNav activeView="home" onViewChange={vi.fn()} plugins={[]} />)

      const buttons = screen.getAllByRole("button")
      const dashboard = screen.getByRole("button", { name: "Token Dashboard" })
      expect(buttons.indexOf(dashboard)).toBe(buttons.indexOf(screen.getByRole("button", { name: "Help" })) - 1)

      await userEvent.click(dashboard)

      expect(invoke).toHaveBeenCalledWith("launch_token_dashboard")
      await waitFor(() => expect(invoke).toHaveBeenCalledWith("hide_panel"))
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("shows the running marker when the dashboard is running", async () => {
      mockInvoke({ kind: "opened" }, { running: true, managed: false })
      render(<SideNav activeView="home" onViewChange={vi.fn()} plugins={[]} />)

      expect(await screen.findByTestId("token-dashboard-running")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Token Dashboard" })).toHaveAttribute(
        "title",
        "Token Dashboard (running)"
      )
    })

    it("shows a Node.js hint with install guide link when not installed", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
      mockInvoke({ kind: "notInstalled", hint: "needs node" })
      render(<SideNav activeView="home" onViewChange={vi.fn()} plugins={[]} />)

      await userEvent.click(screen.getByRole("button", { name: "Token Dashboard" }))

      const alert = await screen.findByRole("alert")
      expect(alert).toHaveTextContent("Node.js 18.18+")
      expect(consoleError).toHaveBeenCalled()
      expect(invoke).not.toHaveBeenCalledWith("hide_panel")

      await userEvent.click(screen.getByRole("button", { name: "Install guide" }))
      expect(openUrl).toHaveBeenCalledWith("https://github.com/doggy8088/TokenUsageInsights#readme")

      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("shows the failure reason when launch fails", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
      mockInvoke({ kind: "failed", reason: "dashboard exited before it was ready (exit code 1)" })
      render(<SideNav activeView="home" onViewChange={vi.fn()} plugins={[]} />)

      await userEvent.click(screen.getByRole("button", { name: "Token Dashboard" }))

      const alert = await screen.findByRole("alert")
      expect(alert).toHaveTextContent("Token Dashboard failed to start: dashboard exited before it was ready (exit code 1)")
      expect(screen.queryByRole("button", { name: "Install guide" })).not.toBeInTheDocument()
      expect(consoleError).toHaveBeenCalled()
    })
  })
})
