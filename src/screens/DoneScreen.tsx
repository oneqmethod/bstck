import { TextAttributes } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

export function DoneScreen() {
  const { state } = useApp()
  const renderer = useRenderer()

  const selectedTechs = state.technologies.filter((t) => t.selected)
  const results = state.skillResults

  useKeyboard((key) => {
    if (key.name === "return" || key.name === "enter" || key.name === "escape") {
      renderer.destroy()
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Done!" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <text>
            <span fg="green"><strong>✓</strong></span> Set up{" "}
            <span fg="yellow">{selectedTechs.length}</span> technologies
          </text>

          <text>
            <span attributes={TextAttributes.DIM}>Target:</span>{" "}
            <span fg="cyan">{state.targetDir}</span>
          </text>

          <box marginTop={1} flexDirection="column">
            <text>
              <strong>Generated structure:</strong>
            </text>
            <box marginTop={1} flexDirection="column" paddingLeft={2}>
              <text>
                {state.claudeMdGenerated ? (
                  <span fg="green">✓</span>
                ) : (
                  <span attributes={TextAttributes.DIM}>-</span>
                )}{" "}
                CLAUDE.md
              </text>
              <text>
                <span attributes={TextAttributes.DIM}>└─</span> .claude/skills/
              </text>
              {results.map((r, i) => {
                const prefix = i === results.length - 1 ? "   └─" : "   ├─"
                const icon = r.source === "skills.sh" ? (
                  <span fg="green">✓</span>
                ) : (
                  <span fg="yellow">★</span>
                )
                return (
                  <text key={r.skillName}>
                    <span attributes={TextAttributes.DIM}>{prefix}</span> {icon}{" "}
                    {r.skillName}/
                  </text>
                )
              })}
            </box>
          </box>

          <box marginTop={1}>
            <text>
              <span fg="green"><strong>Your Claude Code environment is ready!</strong></span>
            </text>
          </box>
        </box>
        <StatusBar hints="⏎ exit" />
      </box>
    </box>
  )
}
