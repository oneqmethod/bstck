import { TextAttributes } from "@opentui/core"

export function Header({ subtitle }: { subtitle?: string }) {
  return (
    <box flexDirection="row" gap={1} paddingLeft={1}>
      <text>
        <span fg="#00BFFF"><strong>BStack</strong></span>
      </text>
      {subtitle && (
        <text attributes={TextAttributes.DIM}> ─── {subtitle}</text>
      )}
    </box>
  )
}
