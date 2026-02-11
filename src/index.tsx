import { createCliRenderer, TextAttributes } from "@opentui/core";
import { createRoot } from "@opentui/react";

function App() {
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="center">
        <ascii-font font="tiny" text="BStack" />
        <text attributes={TextAttributes.DIM}>Create a tech stack for Brainshop</text>
      </box>
    </box>
  );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
