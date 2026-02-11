import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

export function ConfigScreen() {
  const { state, dispatch } = useApp()

  const selectedTechs = state.technologies.filter((t) => t.selected)
  const techNames = selectedTechs.map((t) => t.name).join(", ")

  useKeyboard((key) => {
    if (key.name === "return" || key.name === "enter") {
      dispatch({ type: "SET_SCREEN", screen: "generating" })
    }
    if (key.name === "escape") {
      dispatch({ type: "SET_SCREEN", screen: "curation" })
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Generate Configuration" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <text>
            <strong>Target Directory</strong>
          </text>
          <input
            value={state.targetDir}
            onChange={(value: string) => {
              dispatch({ type: "SET_TARGET_DIR", dir: value })
            }}
            placeholder="./"
            focused
          />

          <box marginTop={1} flexDirection="column" gap={1}>
            <text>
              <span attributes={TextAttributes.DIM}>Selected technologies:</span>
            </text>
            <text>
              <span fg="cyan">{techNames}</span>
            </text>
          </box>

          <box marginTop={1}>
            <text>
              Will generate: <strong>CLAUDE.md</strong> + skills for{" "}
              <span fg="yellow">{selectedTechs.length}</span> technologies
            </text>
          </box>
        </box>
        <StatusBar hints="esc back · ⏎ generate" />
      </box>
    </box>
  )
}
