import { useState } from "react"
import { TextAttributes } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

export function CurationScreen() {
  const { state, dispatch } = useApp()
  const renderer = useRenderer()
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const techs = state.technologies
  const highlighted = techs[highlightedIndex] ?? techs[0]

  const options = techs.map((t, i) => ({
    name: `${t.selected ? "[x]" : "[ ]"} ${t.name}`,
    description: t.category,
    value: i,
  }))

  useKeyboard((key) => {
    if (key.name === "a") {
      dispatch({ type: "SELECT_ALL" })
    }
    if (key.name === "n") {
      dispatch({ type: "SELECT_NONE" })
    }
    if (key.name === "c") {
      const hasSelected = techs.some((t) => t.selected)
      if (hasSelected) {
        dispatch({ type: "SET_SCREEN", screen: "config" })
      }
    }
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Curate Your Stack" />
        <box flexDirection="row" flexGrow={1} padding={1} gap={1}>
          <box flexDirection="column" width="40%">
            <text>
              <strong>Technologies</strong>
            </text>
            <box marginTop={1} flexGrow={1}>
              <select
                options={options}
                focused
                flexGrow={1}
                onChange={(index: number) => {
                  setHighlightedIndex(index)
                }}
                onSelect={(index: number) => {
                  dispatch({ type: "TOGGLE_TECH", index })
                }}
              />
            </box>
          </box>
          <box
            flexDirection="column"
            width="60%"
            border
            borderStyle="rounded"
            padding={1}
            gap={1}
          >
            {highlighted ? (
              <>
                <text>
                  <strong><span fg="#00BFFF">{highlighted.name}</span></strong>
                </text>
                <text>
                  <span attributes={TextAttributes.DIM}>Category:</span>{" "}
                  <span fg="yellow">{highlighted.category}</span>
                </text>
                <text>
                  <span attributes={TextAttributes.DIM}>Description:</span>
                </text>
                <text>{highlighted.description}</text>
                {highlighted.docsUrl && (
                  <text>
                    <span attributes={TextAttributes.DIM}>Docs:</span>{" "}
                    <span fg="cyan">{highlighted.docsUrl}</span>
                  </text>
                )}
              </>
            ) : (
              <text attributes={TextAttributes.DIM}>No technologies found</text>
            )}
          </box>
        </box>
        <StatusBar hints="⏎ toggle · a all · n none · c next" />
      </box>
    </box>
  )
}
