import { TextAttributes } from "@opentui/core"

export function StatusBar({ hints }: { hints: string }) {
  return (
    <box paddingLeft={1} paddingRight={1}>
      <text attributes={TextAttributes.DIM}>{hints}</text>
    </box>
  )
}
