import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { invoke, isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { getCurrentWindow, PhysicalSize, currentMonitor } from "@tauri-apps/api/window"
import type { ActiveView } from "@/components/side-nav"
import type { DisplayPluginState } from "@/hooks/app/use-app-plugin-views"

const PANEL_WIDTH = 400
const MAX_HEIGHT_FALLBACK_PX = 600
const MAX_HEIGHT_FRACTION_OF_MONITOR = 0.8
const WORK_AREA_MARGIN_PX = 8
// Emitted by Rust only for user drags (not programmatic moves).
const PANEL_USER_MOVED_EVENT = "panel:user-moved"
const PANEL_MOVE_REFIT_DELAY_MS = 150

export function debounce(fn: () => void, delayMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    call: () => {
      clearTimeout(timer)
      timer = setTimeout(fn, delayMs)
    },
    cancel: () => clearTimeout(timer),
  }
}

type MonitorArea = {
  size: { height: number }
  workArea: { position: { y: number }; size: { height: number } }
}

// Physical px. Keeps the window bottom above the taskbar/dock: limited by the
// work area below the window's current top, and by a fraction of the monitor.
export function computeMaxPanelHeightPhysical(
  monitor: MonitorArea,
  windowTop: number,
  factor: number
): number {
  const fractionCap = Math.floor(monitor.size.height * MAX_HEIGHT_FRACTION_OF_MONITOR)
  const workAreaBottom = monitor.workArea.position.y + monitor.workArea.size.height
  const roomCap = Math.floor(workAreaBottom - windowTop - WORK_AREA_MARGIN_PX * factor)
  return Math.max(1, Math.min(fractionCap, roomCap))
}

type UsePanelArgs = {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  showAbout: boolean
  setShowAbout: (value: boolean) => void
  displayPlugins: DisplayPluginState[]
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  if (target.isContentEditable) return true
  if (target.closest("input, textarea, select, [contenteditable='true'], [role='textbox']")) {
    return true
  }

  return false
}

export function usePanel({
  activeView,
  setActiveView,
  showAbout,
  setShowAbout,
  displayPlugins,
}: UsePanelArgs) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trayArrowRef = useRef<HTMLDivElement>(null)
  const panelSurfaceRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [maxPanelHeightPx, setMaxPanelHeightPx] = useState<number | null>(null)
  const maxPanelHeightPxRef = useRef<number | null>(null)
  const focusContainer = useCallback(() => {
    window.requestAnimationFrame(() => {
      containerRef.current?.focus({ preventScroll: true })
    })
  }, [])
  const startPanelDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    if (!isTauri()) return

    event.preventDefault()
    void getCurrentWindow().startDragging().catch((error) => {
      console.error("Failed to start panel drag:", error)
    })
  }, [])

  useEffect(() => {
    if (!isTauri()) return
    const panelSurface = panelSurfaceRef.current
    const trayArrow = trayArrowRef.current
    if (!panelSurface) return

    let frame = 0
    const syncBounds = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const panelRect = panelSurface.getBoundingClientRect()
        const arrowRect = trayArrow?.getBoundingClientRect() ?? null
        invoke("set_panel_window_mask", {
          mask: {
            panelBounds: {
              left: panelRect.left,
              top: panelRect.top,
              right: panelRect.right,
              bottom: panelRect.bottom,
            },
            arrowBounds: arrowRect
              ? {
                  left: arrowRect.left,
                  top: arrowRect.top,
                  right: arrowRect.right,
                  bottom: arrowRect.bottom,
                }
              : null,
          },
        }).catch((error) => {
          console.error("Failed to update panel window mask:", error)
        })
      })
    }

    syncBounds()

    const observer = new ResizeObserver(syncBounds)
    observer.observe(panelSurface)
    if (trayArrow) observer.observe(trayArrow)
    window.addEventListener("resize", syncBounds)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", syncBounds)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        focusContainer()
      }
    }

    window.addEventListener("focus", focusContainer)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", focusContainer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [focusContainer])

  useEffect(() => {
    if (!isTauri()) return
    invoke("init_panel").catch(console.error)
  }, [])

  useEffect(() => {
    if (!isTauri()) return
    if (showAbout) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        invoke("hide_panel")
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showAbout])

  useEffect(() => {
    if (!isTauri()) return
    let cancelled = false
    const unlisteners: (() => void)[] = []

    async function setup() {
      const u1 = await listen<string>("tray:navigate", (event) => {
        setActiveView(event.payload as ActiveView)
        focusContainer()
      })
      if (cancelled) {
        u1()
        return
      }
      unlisteners.push(u1)

      const u2 = await listen("tray:show-about", () => {
        setShowAbout(true)
        focusContainer()
      })
      if (cancelled) {
        u2()
        return
      }
      unlisteners.push(u2)
    }

    void setup()

    return () => {
      cancelled = true
      for (const fn of unlisteners) fn()
    }
  }, [focusContainer, setActiveView, setShowAbout])

  useEffect(() => {
    if (showAbout) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
      if (isEditableTarget(event.target)) return

      const views: ActiveView[] = ["home", ...displayPlugins.map((plugin) => plugin.meta.id)]
      if (views.length === 0) return

      let nextView: ActiveView | undefined

      if (activeView === "settings") {
        nextView = event.key === "ArrowUp" ? views[views.length - 1] : views[0]
      } else {
        const currentIndex = views.indexOf(activeView)
        if (currentIndex === -1) return
        const offset = event.key === "ArrowUp" ? -1 : 1
        nextView = views[(currentIndex + offset + views.length) % views.length]
      }

      if (!nextView || nextView === activeView) return

      event.preventDefault()
      setActiveView(nextView)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeView, displayPlugins, setActiveView, showAbout])

  useEffect(() => {
    if (!isTauri()) return
    const container = containerRef.current
    if (!container) return

    const resizeWindow = async () => {
      const factor = window.devicePixelRatio
      const width = Math.ceil(PANEL_WIDTH * factor)
      const desiredHeightLogical = Math.max(1, container.scrollHeight)

      let maxHeightPhysical: number | null = null
      let maxHeightLogical: number | null = null

      try {
        const monitor = await currentMonitor()
        if (monitor) {
          const windowTop = (await getCurrentWindow().outerPosition()).y
          maxHeightPhysical = computeMaxPanelHeightPhysical(monitor, windowTop, factor)
          maxHeightLogical = Math.floor(maxHeightPhysical / factor)
        }
      } catch (e) {
        console.error("Failed to read panel work area:", e)
      }

      if (maxHeightLogical === null) {
        const screenAvailHeight = Number(window.screen?.availHeight) || MAX_HEIGHT_FALLBACK_PX
        maxHeightLogical = Math.floor(screenAvailHeight * MAX_HEIGHT_FRACTION_OF_MONITOR)
        maxHeightPhysical = Math.floor(maxHeightLogical * factor)
      }

      if (maxPanelHeightPxRef.current !== maxHeightLogical) {
        maxPanelHeightPxRef.current = maxHeightLogical
        setMaxPanelHeightPx(maxHeightLogical)
      }

      const desiredHeightPhysical = Math.ceil(desiredHeightLogical * factor)
      const height = Math.ceil(Math.min(desiredHeightPhysical, maxHeightPhysical!))

      try {
        const currentWindow = getCurrentWindow()
        await currentWindow.setSize(new PhysicalSize(width, height))
      } catch (e) {
        console.error("Failed to resize window:", e)
      }
    }

    resizeWindow()

    const observer = new ResizeObserver(() => {
      resizeWindow()
    })
    observer.observe(container)

    // Max height depends on the window top, so refit once a drag settles.
    const refitAfterMove = debounce(() => void resizeWindow(), PANEL_MOVE_REFIT_DELAY_MS)
    let disposed = false
    let unlistenMoved: (() => void) | null = null
    listen(PANEL_USER_MOVED_EVENT, refitAfterMove.call)
      .then((unlisten) => {
        if (disposed) unlisten()
        else unlistenMoved = unlisten
      })
      .catch((error) => console.error("Failed to listen for panel moves:", error))

    return () => {
      disposed = true
      refitAfterMove.cancel()
      unlistenMoved?.()
      observer.disconnect()
    }
  }, [activeView, displayPlugins])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const check = () => {
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 1)
    }

    check()
    el.addEventListener("scroll", check, { passive: true })

    const ro = new ResizeObserver(check)
    ro.observe(el)

    const mo = new MutationObserver(check)
    mo.observe(el, { childList: true, subtree: true })

    return () => {
      el.removeEventListener("scroll", check)
      ro.disconnect()
      mo.disconnect()
    }
  }, [activeView])

  return {
    containerRef,
    trayArrowRef,
    panelSurfaceRef,
    scrollRef,
    canScrollDown,
    maxPanelHeightPx,
    startPanelDrag,
  }
}
