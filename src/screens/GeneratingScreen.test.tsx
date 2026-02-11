import { test, expect, afterEach, mock } from "bun:test"
import { mockTech } from "../test-helpers.tsx"

const sourceSkillMock = mock()
const generateCustomSkillMock = mock()
const generateClaudeMdMock = mock()

mock.module("../lib/skills.ts", () => ({
  sourceSkill: sourceSkillMock,
}))

mock.module("../lib/generator.ts", () => ({
  generateCustomSkill: generateCustomSkillMock,
  generateClaudeMd: generateClaudeMdMock,
}))

const { renderScreen } = await import("../test-helpers.tsx")
const { GeneratingScreen } = await import("./GeneratingScreen.tsx")

const selectedTech = mockTech({ name: "React", selected: true })

let t: Awaited<ReturnType<typeof renderScreen>>
afterEach(() => {
  try { t?.renderer.destroy() } catch {}
  sourceSkillMock.mockReset()
  generateCustomSkillMock.mockReset()
  generateClaudeMdMock.mockReset()
})

test("shows progress counter", async () => {
  sourceSkillMock.mockImplementation(() => new Promise(() => {}))
  t = await renderScreen(GeneratingScreen, {
    state: {
      technologies: [selectedTech],
      skillResults: [
        { techName: "React", source: "custom" as const, skillName: "react", status: "pending" as const, log: [] },
      ],
    },
  })
  expect(t.frame()).toContain("skills processed")
})

test("completes full flow and advances to done", async () => {
  sourceSkillMock.mockImplementation(async (tech: any) => ({
    techName: tech.name,
    source: "custom",
    skillName: "react",
    status: "generating",
    log: [],
  }))
  generateCustomSkillMock.mockImplementation(async (tech: any) => ({
    techName: tech.name,
    source: "custom",
    skillName: "react",
    status: "done",
    log: [],
  }))
  generateClaudeMdMock.mockImplementation(async () => {})

  t = await renderScreen(GeneratingScreen, {
    state: { technologies: [selectedTech] },
  })

  await new Promise((r) => setTimeout(r, 200))
  await t.renderOnce()

  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_CLAUDE_MD_GENERATED" })
  expect(t.dispatch).toHaveBeenCalledWith({ type: "SET_SCREEN", screen: "done" })
})
