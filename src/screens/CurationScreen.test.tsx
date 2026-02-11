import { test, expect, afterEach } from "bun:test"
import { renderScreen, mockTech, type TestSetup } from "../test-helpers.tsx"
import { CurationScreen } from "./CurationScreen.tsx"

const techs = [
  mockTech({ name: "React", selected: true }),
  mockTech({ name: "TypeScript", category: "language", selected: false }),
]

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders tech list", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  const frame = t.frame()
  expect(frame).toContain("Technologies")
  expect(frame).toContain("React")
})

test("Enter toggles tech selection", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  t.mockInput.pressEnter()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "TOGGLE_TECH", index: 0 })
})

test("A selects all", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  t.mockInput.pressKey("a")
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SELECT_ALL" })
})

test("N selects none", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  t.mockInput.pressKey("n")
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SELECT_NONE" })
})

test("C navigates to config when techs selected", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  t.mockInput.pressKey("c")
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "config" })
})

test("C does nothing when no techs selected", async () => {
  const noSelected = techs.map((t) => ({ ...t, selected: false }))
  t = await renderScreen(CurationScreen, { state: { technologies: noSelected } })
  t.mockInput.pressKey("c")
  await t.renderOnce()
  const screenCalls = t.dispatch.mock.calls.filter(
    ([a]: [any]) => a.type === "SET_SCREEN"
  )
  expect(screenCalls).toHaveLength(0)
})

test("Escape destroys renderer", async () => {
  t = await renderScreen(CurationScreen, { state: { technologies: techs } })
  t.mockInput.pressEscape()
})
