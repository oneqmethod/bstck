import { test, expect, afterEach } from "bun:test"
import { renderScreen, mockTech, type TestSetup } from "../test-helpers.tsx"
import { ConfigScreen } from "./ConfigScreen.tsx"

const techs = [
  mockTech({ name: "React", selected: true }),
  mockTech({ name: "Bun", category: "tool", selected: true }),
]

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders target dir and selected techs", async () => {
  t = await renderScreen(ConfigScreen, {
    state: { technologies: techs, targetDir: "./out" },
  })
  const frame = t.frame()
  expect(frame).toContain("Target Directory")
  expect(frame).toContain("React")
  expect(frame).toContain("Bun")
  expect(frame).toContain("2 technologies")
})

test("Enter navigates to generating", async () => {
  t = await renderScreen(ConfigScreen, { state: { technologies: techs } })
  t.mockInput.pressEnter()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "generating" })
})

test("Escape navigates to curation", async () => {
  t = await renderScreen(ConfigScreen, { state: { technologies: techs } })
  t.mockInput.pressEscape()
  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "curation" })
})
