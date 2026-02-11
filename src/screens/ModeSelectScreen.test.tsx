import { test, expect, afterEach } from "bun:test"
import { renderScreen, type TestSetup } from "../test-helpers.tsx"
import { ModeSelectScreen } from "./ModeSelectScreen.tsx"

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders mode options", async () => {
  t = await renderScreen(ModeSelectScreen)
  const frame = t.frame()
  expect(frame).toContain("Research a Topic")
  expect(frame).toContain("Explore Repositories")
})

test("selecting topic dispatches mode and screen", async () => {
  t = await renderScreen(ModeSelectScreen)
  t.mockInput.pressEnter()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_MODE", mode: "topic" })
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "topic-input" })
})

test("selecting repo dispatches mode and screen", async () => {
  t = await renderScreen(ModeSelectScreen)
  t.mockInput.pressArrow("down")
  await t.renderOnce()
  t.mockInput.pressEnter()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_MODE", mode: "repo" })
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "repo-input" })
})

test("Escape destroys renderer", async () => {
  t = await renderScreen(ModeSelectScreen)
  t.mockInput.pressEscape()
})
