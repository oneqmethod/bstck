import { useState } from "react"
import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

export function RepoInputScreen() {
  const { state, dispatch } = useApp()
  const [value, setValue] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(0)

  useKeyboard((key) => {
    if (key.name === "escape") {
      dispatch({ type: "SET_SCREEN", screen: "mode-select" })
    }
    if (key.name === "return" || key.name === "enter") {
      const trimmed = value.trim()
      if (trimmed) {
        dispatch({ type: "ADD_REPO", slug: trimmed })
        setValue("")
      }
    }
    if (key.name === "tab") {
      if (state.repoSlugs.length > 0) {
        dispatch({ type: "SET_SCREEN", screen: "analysis" })
      }
    }
    if (key.name === "d" && !value && state.repoSlugs.length > 0) {
      dispatch({ type: "REMOVE_REPO", index: highlightIndex })
      if (highlightIndex >= state.repoSlugs.length - 1 && highlightIndex > 0) {
        setHighlightIndex(highlightIndex - 1)
      }
    }
    if (key.name === "up" && highlightIndex > 0) {
      setHighlightIndex(highlightIndex - 1)
    }
    if (key.name === "down" && highlightIndex < state.repoSlugs.length - 1) {
      setHighlightIndex(highlightIndex + 1)
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Explore Repositories" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <text>Enter owner/repo or package name:</text>
          <input
            value={value}
            onChange={setValue}
            placeholder="e.g. vercel/next.js"
            focused
          />
          {state.repoSlugs.length > 0 && (
            <box flexDirection="column" marginTop={1}>
              <text attributes={TextAttributes.DIM}>Added:</text>
              {state.repoSlugs.map((slug, i) => (
                <text key={slug + i}>
                  <span fg="green">{"\u2713"}</span>{" "}
                  {i === highlightIndex ? (
                    <span fg="#00BFFF">{slug}</span>
                  ) : (
                    slug
                  )}
                </text>
              ))}
            </box>
          )}
        </box>
        <StatusBar hints={"\u23ce add \u00b7 tab analyze \u00b7 d remove \u00b7 \u2191\u2193 nav \u00b7 esc back"} />
      </box>
    </box>
  )
}
