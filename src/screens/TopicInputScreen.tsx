import { useState } from "react"
import { TextAttributes } from "@opentui/core"
import { useKeyboard } from "@opentui/react"
import { useApp } from "../App.tsx"
import { Header } from "../components/Header.tsx"
import { StatusBar } from "../components/StatusBar.tsx"

export function TopicInputScreen() {
  const { dispatch } = useApp()
  const [topic, setTopic] = useState("")

  useKeyboard((key) => {
    if (key.name === "escape") {
      dispatch({ type: "SET_SCREEN", screen: "mode-select" })
    }
    if ((key.name === "return" || key.name === "enter") && topic.trim()) {
      dispatch({ type: "SET_TOPIC", topic: topic.trim() })
      dispatch({ type: "SET_SCREEN", screen: "research" })
    }
  })

  return (
    <box flexGrow={1} flexDirection="column">
      <box border borderStyle="rounded" flexGrow={1} flexDirection="column" padding={1}>
        <Header subtitle="Research a Topic" />
        <box flexDirection="column" padding={1} gap={1} flexGrow={1}>
          <text>What do you want to build?</text>
          <input
            value={topic}
            onChange={setTopic}
            placeholder="e.g. real-time chat app with AI features"
            focused
          />
          <box marginTop={1} flexDirection="column" gap={0}>
            <text attributes={TextAttributes.DIM}>Examples:</text>
            <text attributes={TextAttributes.DIM}>  - E-commerce platform with payments</text>
            <text attributes={TextAttributes.DIM}>  - CLI tool for managing Docker containers</text>
            <text attributes={TextAttributes.DIM}>  - Mobile app for fitness tracking</text>
          </box>
        </box>
        <StatusBar hints="esc back · ⏎ go" />
      </box>
    </box>
  )
}
