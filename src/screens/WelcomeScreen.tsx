import { TextAttributes } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useApp } from "../App.tsx"

export function WelcomeScreen() {
  const { dispatch } = useApp()
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "return" || key.name === "enter") {
      dispatch({ type: "SET_SCREEN", screen: "mode-select" })
    }
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <box flexGrow={1} flexDirection="column" alignItems="center" justifyContent="center">
      <box
        border
        borderStyle="rounded"
        padding={2}
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <ascii-font font="shade" text="BStack" />
        <text attributes={TextAttributes.DIM}>
          Curate tech stacks for Claude Code
        </text>
        <box marginTop={1}>
          <text attributes={TextAttributes.DIM}>Press Enter to start</text>
        </box>
      </box>
    </box>
  )
}
