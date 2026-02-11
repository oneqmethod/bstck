import { test, expect, afterEach, mock } from "bun:test"
import { mockTech } from "../test-helpers.tsx"

const analyzeReposMock = mock()

mock.module("../lib/repo.ts", () => ({
  analyzeRepos: analyzeReposMock,
  fetchSource: mock(async () => "mock source"),
}))

const { renderScreen } = await import("../test-helpers.tsx")
const { AnalysisScreen } = await import("./AnalysisScreen.tsx")

let t: Awaited<ReturnType<typeof renderScreen>>
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("displays repo slugs", async () => {
  analyzeReposMock.mockImplementation(() => new Promise(() => {}))
  t = await renderScreen(AnalysisScreen, {
    state: { repoSlugs: ["vercel/next.js"] },
  })
  expect(t.frame()).toContain("vercel/next.js")
})

test("displays discovered techs", async () => {
  analyzeReposMock.mockImplementation(
    async (_slugs: string[], onStatus: Function, onTech: Function) => {
      onStatus("vercel/next.js", "fetching")
      onStatus("vercel/next.js", "done")
      onTech(mockTech({ name: "TypeScript", category: "language" }))
    }
  )
  t = await renderScreen(AnalysisScreen, {
    state: { repoSlugs: ["vercel/next.js"] },
  })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  expect(t.frame()).toContain("TypeScript")
})

test("auto-advances to curation after completion", async () => {
  analyzeReposMock.mockImplementation(async () => {})
  t = await renderScreen(AnalysisScreen, {
    state: { repoSlugs: ["vercel/next.js"] },
  })
  await new Promise((r) => setTimeout(r, 50))
  await t.renderOnce()
  // Wait for the 1s setTimeout
  await new Promise((r) => setTimeout(r, 1100))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "curation" })
})

test("Escape navigates to repo-input", async () => {
  analyzeReposMock.mockImplementation(() => new Promise(() => {}))
  t = await renderScreen(AnalysisScreen, {
    state: { repoSlugs: ["vercel/next.js"] },
  })
  t.mockInput.pressEscape()
  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "repo-input" })
})
