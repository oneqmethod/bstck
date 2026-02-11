import { useState, useEffect } from "react"

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

export function Spinner({ label }: { label?: string }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length)
    }, 80)
    return () => clearInterval(id)
  }, [])

  return (
    <text>
      <span fg="#00BFFF">{FRAMES[frame]}</span>
      {label ? ` ${label}` : ""}
    </text>
  )
}
