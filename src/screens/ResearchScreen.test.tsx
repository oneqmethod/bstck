import { test, expect, afterEach, mock } from "bun:test"
import { mockTech } from "../test-helpers.tsx"

const researchTopicMock = mock()

mock.module("../lib/ai.ts", () => ({
  researchTopic: researchTopicMock,
}))

const { renderScreen } = await import("../test-helpers.tsx")
const { ResearchScreen } = await import("./ResearchScreen.tsx")

let t: Awaited<ReturnType<typeof renderScreen>>
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("shows spinner while researching", async () => {
  researchTopicMock.mockImplementation(() => new Promise(() => {}))
  t = await renderScreen(ResearchScreen, { state: { topic: "chat app" } })
  expect(t.frame()).toContain("research")
})

test("displays discovered techs", async () => {
  researchTopicMock.mockImplementation(async (_topic: string, onTech: Function) => {
    onTech(mockTech({ name: "Express" }))
  })
  t = await renderScreen(ResearchScreen, { state: { topic: "chat app" } })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.frame()).toContain("Express")
})

test("auto-advances to curation on completion", async () => {
  researchTopicMock.mockImplementation(async () => {})
  t = await renderScreen(ResearchScreen, { state: { topic: "chat app" } })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "curation" })
})

test("error state shows error text", async () => {
  researchTopicMock.mockImplementation(async () => {
    throw new Error("API failed")
  })
  t = await renderScreen(ResearchScreen, { state: { topic: "chat app" } })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.frame()).toContain("Error")
})

test("Escape in error state navigates to topic-input", async () => {
  researchTopicMock.mockImplementation(async () => {
    throw new Error("API failed")
  })
  t = await renderScreen(ResearchScreen, { state: { topic: "chat app" } })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  t.mockInput.pressEscape()
  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "topic-input" })
})
