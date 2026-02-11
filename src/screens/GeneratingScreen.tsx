import { useState, useEffect, useRef } from "react"
import { TextAttributes } from "@opentui/core"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { Spinner } from "../components/Spinner.tsx"
import { sourceSkill } from "../lib/skills.ts"
import { generateCustomSkill, generateClaudeMd } from "../lib/generator.ts"
import type { SkillResult, SkillStatus } from "../types.ts"

function StatusIcon({ status }: { status: SkillStatus }) {
  switch (status) {
    case "done":
      return (
        <text>
          <span fg="green">✓</span>
        </text>
      )
    case "error":
      return (
        <text>
          <span fg="red">✗</span>
        </text>
      )
    case "pending":
      return <text attributes={TextAttributes.DIM}>·</text>
    default:
      return <Spinner />
  }
}

function statusLabel(status: SkillStatus): string {
  switch (status) {
    case "pending":
      return "waiting"
    case "searching":
      return "searching skills.sh"
    case "validating":
      return "validating"
    case "installing":
      return "installing"
    case "generating":
      return "generating custom skill"
    case "done":
      return "done"
    case "error":
      return "error"
  }
}

export function GeneratingScreen() {
  const { state, dispatch } = useApp()
  const [logs, setLogs] = useState<string[]>([])
  const [generatingClaudeMd, setGeneratingClaudeMd] = useState(false)
  const started = useRef(false)

  const selectedTechs = state.technologies.filter((t) => t.selected)
  const results = state.skillResults
  const doneCount = results.filter(
    (r) => r.status === "done" || r.status === "error"
  ).length
  const total = results.length

  useEffect(() => {
    if (started.current) return
    started.current = true

    async function run() {
      // Initialize results
      const initial: SkillResult[] = selectedTechs.map((t) => ({
        techName: t.name,
        source: "custom",
        skillName: t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        status: "pending" as const,
        log: [],
      }))
      dispatch({ type: "SET_SKILL_RESULTS", results: initial })

      // Process each tech sequentially
      for (let i = 0; i < selectedTechs.length; i++) {
        const tech = selectedTechs[i]!

        dispatch({
          type: "UPDATE_SKILL_RESULT",
          index: i,
          result: { status: "searching" },
        })

        const addLog = (msg: string) => {
          setLogs((prev) => [...prev, `[${tech.name}] ${msg}`])
        }

        // Step 1: Try to source from skills.sh
        let skillResult = await sourceSkill(tech, state.targetDir, addLog)

        // Step 2: If no skills.sh match, generate custom
        if (skillResult.source === "custom" && skillResult.status !== "done") {
          dispatch({
            type: "UPDATE_SKILL_RESULT",
            index: i,
            result: { status: "generating" },
          })
          skillResult = await generateCustomSkill(tech, state.targetDir, addLog)
        }

        dispatch({
          type: "UPDATE_SKILL_RESULT",
          index: i,
          result: {
            status: skillResult.status,
            source: skillResult.source,
            skillName: skillResult.skillName,
            log: skillResult.log,
          },
        })
      }

      // Generate CLAUDE.md
      setGeneratingClaudeMd(true)
      setLogs((prev) => [...prev, "Generating CLAUDE.md..."])
      await generateClaudeMd(selectedTechs, state.targetDir)
      dispatch({ type: "SET_CLAUDE_MD_GENERATED" })
      setLogs((prev) => [...prev, "CLAUDE.md generated"])

      // Auto-advance
      dispatch({ type: "SET_SCREEN", screen: "done" })
    }

    run()
  }, [])

  return (
    <box flexGrow={1} flexDirection="column">
      <Header subtitle="Setting Up" />

      <box flexDirection="column" paddingLeft={2} paddingRight={2} marginTop={1} gap={0}>
        {/* Progress */}
        <text>
          <span fg="#00BFFF">
            {total > 0 ? `${doneCount}/${total}` : "0/0"}
          </span>{" "}
          <span attributes={TextAttributes.DIM}>skills processed</span>
        </text>

        {/* Per-tech status */}
        <box flexDirection="column" marginTop={1}>
          {results.map((r) => (
            <box key={r.techName} flexDirection="row" gap={1}>
              <StatusIcon status={r.status} />
              <text>
                {r.techName}
                {r.status === "done" && (
                  <span attributes={TextAttributes.DIM}>
                    {" "}
                    ({r.source === "skills.sh"
                      ? "installed from skills.sh"
                      : "custom generated"})
                  </span>
                )}
                {r.status !== "done" &&
                  r.status !== "pending" &&
                  r.status !== "error" && (
                    <span attributes={TextAttributes.DIM}>
                      {" "}
                      — {statusLabel(r.status)}
                    </span>
                  )}
              </text>
            </box>
          ))}
          {generatingClaudeMd && (
            <box flexDirection="row" gap={1} marginTop={1}>
              {state.claudeMdGenerated ? (
                <text>
                  <span fg="green">✓</span>
                </text>
              ) : (
                <Spinner />
              )}
              <text>CLAUDE.md</text>
            </box>
          )}
        </box>
      </box>

      {/* Log panel */}
      <box flexGrow={1} marginTop={1} paddingLeft={2} paddingRight={2}>
        <scrollbox flexGrow={1} height={10}>
          {logs.map((msg, i) => (
            <text key={i} attributes={TextAttributes.DIM}>
              {msg}
            </text>
          ))}
        </scrollbox>
      </box>
    </box>
  )
}
