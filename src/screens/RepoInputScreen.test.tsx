import { test, expect, afterEach } from "bun:test"
import { renderScreen, typeText, type TestSetup } from "../test-helpers.tsx"
import { RepoInputScreen } from "./RepoInputScreen.tsx"

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders prompt", async () => {
  t = await renderScreen(RepoInputScreen)
  expect(t.frame()).toContain("Enter owner/repo")
})

test("Enter with text dispatches ADD_REPO", async () => {
  t = await renderScreen(RepoInputScreen)
  typeText(t, "vercel/next.js")
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  await t.renderOnce()
  t.mockInput.pressEnter()
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "ADD_REPO", slug: "vercel/next.js" })
})

test("Tab with repos navigates to analysis", async () => {
  t = await renderScreen(RepoInputScreen, {
    state: { repoSlugs: ["vercel/next.js"] },
  })
  t.mockInput.pressTab()
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "analysis" })
})

test("Tab without repos does nothing", async () => {
  t = await renderScreen(RepoInputScreen)
  t.mockInput.pressTab()
  await t.renderOnce()
  const screenCalls = t.dispatch.mock.calls.filter(
    ([a]: [any]) => a.type === "SET_SCREEN"
  )
  expect(screenCalls).toHaveLength(0)
})

test("displays added repos", async () => {
  t = await renderScreen(RepoInputScreen, {
    state: { repoSlugs: ["vercel/next.js", "facebook/react"] },
  })
  const frame = t.frame()
  expect(frame).toContain("vercel/next.js")
  expect(frame).toContain("facebook/react")
})

test("Escape navigates to mode-select", async () => {
  t = await renderScreen(RepoInputScreen)
  t.mockInput.pressEscape()
  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "mode-select" })
})
