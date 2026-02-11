import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App.tsx"

const renderer = await createCliRenderer({ exitOnCtrlC: false })

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "f12") renderer.console.toggle()
})

createRoot(renderer).render(<App />)
