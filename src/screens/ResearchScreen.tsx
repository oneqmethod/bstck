import { useState, useEffect, useRef } from "react"
import { useKeyboard } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"
import { Spinner } from "../components/Spinner.tsx"
import { researchTopic, type ResearchStep } from "../lib/ai.ts"
import type { Technology } from "../types.ts"

export function ResearchScreen() {
  const { state, dispatch } = useApp()
  const [discoveries, setDiscoveries] = useState<Technology[]>([])
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<ResearchStep | null>(null)
  const [searches, setSearches] = useState<string[]>([])
  const started = useRef(false)
  const errorRef = useRef(error)
  errorRef.current = error

  useKeyboard((key) => {
    if (errorRef.current) {
      if (key.name === "escape") {
        dispatch({ type: "SET_SCREEN", screen: "topic-input" })
      }
      if (key.name === "return" || key.name === "enter") {
        started.current = false
        setError(null)
      }
    }
  })

  useEffect(() => {
    if (started.current) return
    started.current = true

    researchTopic(
      state.topic,
      (tech) => {
        setDiscoveries((prev) => [...prev, tech])
        dispatch({ type: "ADD_TECH", tech })
      },
      (s) => {
        setStep(s)
        if (s.toolCalls) {
          for (const tc of s.toolCalls) {
            if (tc.name === "webSearch" && tc.args?.query) {
              setSearches((prev) => [...prev, tc.args.query as string])
            }
          }
        }
      }
    )
      .then(() => setDone(true))
      .catch((err) => setError(err instanceof Error ? err.message : "Research failed"))
  }, [error])

  useEffect(() => {
    if (done) {
      dispatch({ type: "SET_SCREEN", screen: "curation" })
    }
  }, [done])

  const phaseLabel =
    step?.phase === "extracting"
      ? "Extracting technologies..."
      : step
        ? `Researching web... Step ${step.stepNumber}/5`
        : "Starting research..."

  if (error) {
    return (
      <box flexGrow={1} flexDirection="column">
        <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
          <Header subtitle="Research Failed" />
          <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
            <text>
              <span fg="red">Error:</span> {error}
            </text>
          </box>
          <StatusBar hints="esc back · ⏎ retry" />
        </box>
      </box>
    )
  }

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Researching" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <Spinner label={phaseLabel} />
          {searches.length > 0 && (
            <box flexDirection="column">
              {searches.slice(-3).map((q, i) => (
                <text key={i}>
                  <span fg="cyan">{"~>"}</span>{" "}
                  <span fg="#888888">{q}</span>
                </text>
              ))}
            </box>
          )}
          {step?.text && (
            <text fg="#666666">
              {step.text.length > 120 ? step.text.slice(0, 120) + "..." : step.text}
            </text>
          )}
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
