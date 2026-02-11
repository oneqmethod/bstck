import { test, expect, afterEach } from "bun:test"
import { renderScreen, mockTech, type TestSetup } from "../test-helpers.tsx"
import { DoneScreen } from "./DoneScreen.tsx"
import type { SkillResult } from "../types.ts"

const techs = [mockTech({ name: "React", selected: true })]
const results: SkillResult[] = [
  { techName: "React", source: "custom", skillName: "react", status: "done", log: [] },
]

let t: TestSetup
afterEach(() => { try { t?.renderer.destroy() } catch {} })

test("renders summary", async () => {
  t = await renderScreen(DoneScreen, {
    state: {
      technologies: techs,
      skillResults: results,
      claudeMdGenerated: true,
      targetDir: "./out",
    },
  })
  const frame = t.frame()
  expect(frame).toContain("1 technologies")
  expect(frame).toContain("./out")
  expect(frame).toContain("CLAUDE.md")
  expect(frame).toContain("ready")
})

test("Enter destroys renderer", async () => {
  t = await renderScreen(DoneScreen, {
    state: { technologies: techs, skillResults: results, claudeMdGenerated: true },
  })
  t.mockInput.pressEnter()
})

test("Escape destroys renderer", async () => {
  t = await renderScreen(DoneScreen, {
    state: { technologies: techs, skillResults: results, claudeMdGenerated: true },
  })
  t.mockInput.pressEscape()
})
