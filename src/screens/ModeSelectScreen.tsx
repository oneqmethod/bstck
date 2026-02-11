import { useKeyboard, useRenderer } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

const options = [
  {
    name: "Research a Topic",
    description: "AI searches the web for the best technologies for your project",
    value: "topic" as const,
  },
  {
    name: "Explore Repositories",
    description: "Fetch repos via opensrc, analyze their tech stack",
    value: "repo" as const,
  },
]

export function ModeSelectScreen() {
  const { dispatch } = useApp()
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <text>How do you want to build your stack?</text>
          <box marginTop={1}>
            <select
              options={options}
              onSelect={(_index, option: (typeof options)[number] | null) => {
                if (!option) return
                const mode = option.value
                dispatch({ type: "SET_MODE", mode })
                dispatch({
                  type: "SET_SCREEN",
                  screen: mode === "topic" ? "topic-input" : "repo-input",
                })
              }}
              focused
            />
          </box>
        </box>
        <StatusBar hints="esc quit · ↑↓ nav · ⏎ select" />
      </box>
    </box>
  )
}
