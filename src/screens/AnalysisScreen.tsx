import { useState, useEffect, useRef } from "react"
import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"
import { Spinner } from "../components/Spinner.tsx"
import { analyzeRepos } from "../lib/repo.ts"
import type { Technology } from "../types.ts"

export function AnalysisScreen() {
  const { state, dispatch } = useApp()
  const [repoStatus, setRepoStatus] = useState<Record<string, "fetching" | "done">>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [techs, setTechs] = useState<Technology[]>([])
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useKeyboard((key) => {
    if (key.name === "escape") {
      dispatch({ type: "SET_SCREEN", screen: "repo-input" })
    }
  })

  useEffect(() => {
    if (started.current) return
    started.current = true

    analyzeRepos(
      state.repoSlugs,
      (slug, status) => {
        setRepoStatus((prev) => ({ ...prev, [slug]: status }))
        if (status === "done") {
          // Check if all are done to show analyzing phase
          setRepoStatus((prev) => {
            const updated = { ...prev, [slug]: status }
            const allDone = state.repoSlugs.every((s) => updated[s] === "done")
            if (allDone) setAnalyzing(true)
            return updated
          })
        }
      },
      (tech) => {
        setTechs((prev) => [...prev, tech])
        dispatch({ type: "ADD_TECH", tech })
      }
    ).then(() => {
      setDone(true)
      setAnalyzing(false)
    })
  }, [])

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_SCREEN", screen: "curation" })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [done])

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Analyzing Repos" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <box flexDirection="column">
            {state.repoSlugs.map((slug) => (
              <box key={slug} flexDirection="row" gap={1}>
                {repoStatus[slug] === "done" ? (
                  <text><span fg="green">{"\u2713"}</span> {slug}</text>
                ) : repoStatus[slug] === "fetching" ? (
                  <box flexDirection="row" gap={1}>
                    <Spinner />
                    <text>{slug}</text>
                  </box>
                ) : (
                  <text attributes={TextAttributes.DIM}>{slug}</text>
                )}
              </box>
            ))}
          </box>

          {analyzing && !done && (
            <box marginTop={1}>
              <Spinner label="Analyzing tech stack..." />
            </box>
          )}

          {techs.length > 0 && (
            <box flexDirection="column" marginTop={1}>
              <text attributes={TextAttributes.DIM}>Discovered technologies:</text>
              <scrollbox flexGrow={1}>
                {techs.map((tech, i) => (
                  <text key={tech.name + i}>
                    <span fg="green">{"\u2713"}</span>{" "}
                    <span fg="#00BFFF">{tech.name}</span>{" "}
                    <span fg="gray">({tech.category})</span>
                  </text>
                ))}
              </scrollbox>
            </box>
          )}

          {done && (
            <box marginTop={1}>
              <text>
                <span fg="green">{"\u2713"}</span> Analysis complete — found {techs.length} technologies
              </text>
            </box>
          )}
        </box>
        <StatusBar hints="esc back" />
      </box>
    </box>
  )
}
