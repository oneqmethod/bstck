import { test, expect, afterEach } from "bun:test"
import { renderScreen, typeText, type TestSetup } from "../test-helpers.tsx"
import { TopicInputScreen } from "./TopicInputScreen.tsx"

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders prompt and examples", async () => {
  t = await renderScreen(TopicInputScreen)
  const frame = t.frame()
  expect(frame).toContain("What do you want to build?")
  expect(frame).toContain("Examples")
})

test("Enter with text dispatches topic and navigates to research", async () => {
  t = await renderScreen(TopicInputScreen)
  typeText(t, "chat app")
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  await t.renderOnce()
  t.mockInput.pressEnter()
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_TOPIC", topic: "chat app" })
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "research" })
})

test("Enter with empty text does nothing", async () => {
  t = await renderScreen(TopicInputScreen)
  t.mockInput.pressEnter()
  await t.renderOnce()
  const topicCalls = t.dispatch.mock.calls.filter(
    ([a]: [any]) => a.type === "SET_TOPIC"
  )
  expect(topicCalls).toHaveLength(0)
})

test("Escape navigates to mode-select", async () => {
  t = await renderScreen(TopicInputScreen)
  t.mockInput.pressEscape()
  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "mode-select" })
})
