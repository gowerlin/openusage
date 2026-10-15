import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MetricLineRenderer } from "@/components/provider-card-metric-line"
import type { MetricLine } from "@/lib/plugin-types"

function renderLine(line: MetricLine) {
  return render(
    <MetricLineRenderer
      line={line}
      displayMode="used"
      resetTimerDisplayMode="relative"
      timeFormatMode="auto"
      now={0}
      locale="en"
    />
  )
}

describe("MetricLineRenderer text line", () => {
  it("lets the label shrink first and gives the value up to 70%", () => {
    renderLine({ type: "text", label: "Yesterday", value: "$213.36 · 597M tokens" })

    const label = screen.getByText("Yesterday")
    expect(label).toHaveClass("min-w-0", "truncate")
    expect(label).toHaveAttribute("title", "Yesterday")

    const value = screen.getByText("$213.36 · 597M tokens")
    expect(value).toHaveClass("flex-shrink-0", "max-w-[70%]", "truncate")
    expect(value).not.toHaveClass("max-w-[45%]")
    expect(value).toHaveAttribute("title", "$213.36 · 597M tokens")
  })
})
