import { test, expect, afterEach } from "bun:test"
import { renderScreen, type TestSetup } from "../test-helpers.tsx"
import { WelcomeScreen } from "./WelcomeScreen.tsx"

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders banner and prompt", async () => {
  t = await renderScreen(WelcomeScreen)
  const frame = t.frame()
  expect(frame).toContain("Press Enter to start")
  expect(frame).toContain("Curate tech stacks")
})

test("Enter navigates to mode-select", async () => {
  t = await renderScreen(WelcomeScreen)
  t.mockInput.pressEnter()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "mode-select" })
})

test("Escape destroys renderer", async () => {
  t = await renderScreen(WelcomeScreen)
  t.mockInput.pressEscape()
})
