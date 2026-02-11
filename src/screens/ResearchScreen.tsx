import { useState, useEffect, useRef } from "react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { Spinner } from "../components/Spinner.tsx"
import { researchTopic } from "../lib/ai.ts"
import type { Technology } from "../types.ts"

export function ResearchScreen() {
  const { state, dispatch } = useApp()
  const [discoveries, setDiscoveries] = useState<Technology[]>([])
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    researchTopic(state.topic, (tech) => {
      setDiscoveries((prev) => [...prev, tech])
      dispatch({ type: "ADD_TECH", tech })
    })
      .then(() => setDone(true))
      .catch(() => setDone(true))
  }, [])

  useEffect(() => {
    if (done) {
      dispatch({ type: "SET_SCREEN", screen: "curation" })
    }
  }, [done])

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Researching" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <Spinner label={`Researching: ${state.topic}`} />
          {discoveries.length > 0 && (
            <scrollbox flexGrow={1}>
              {discoveries.map((tech, i) => (
                <box key={i}>
                  <text>
                    <span fg="green">{"✓"}</span> {tech.name}{" "}
                    <span fg="#888888">({tech.category})</span>
                  </text>
                </box>
              ))}
            </scrollbox>
          )}
        </box>
      </box>
    </box>
  )
}
