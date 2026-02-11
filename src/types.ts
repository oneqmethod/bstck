export type Screen =
  | "welcome"
  | "mode-select"
  | "topic-input"
  | "repo-input"
  | "research"
  | "analysis"
  | "curation"
  | "config"
  | "generating"
  | "done"

export type TechCategory =
  | "language"
  | "framework"
  | "library"
  | "tool"
  | "platform"
  | "database"
  | "other"

export type Technology = {
  name: string
  category: TechCategory
  description: string
  reasoning: string
  docsUrl: string
  repoUrl?: string
  selected: boolean
}

export type SkillStatus =
  | "pending"
  | "searching"
  | "validating"
  | "installing"
  | "generating"
  | "done"
  | "error"

export type SkillResult = {
  techName: string
  source: "skills.sh" | "custom"
  skillName: string
  status: SkillStatus
  log: string[]
}

export type AppState = {
  screen: Screen
  mode: "topic" | "repo" | null
  topic: string
  repoSlugs: string[]
  technologies: Technology[]
  targetDir: string
  skillResults: SkillResult[]
  claudeMdGenerated: boolean
}

export type AppAction =
  | { type: "SET_SCREEN"; screen: Screen }
  | { type: "SET_MODE"; mode: "topic" | "repo" }
  | { type: "SET_TOPIC"; topic: string }
  | { type: "ADD_REPO"; slug: string }
  | { type: "REMOVE_REPO"; index: number }
  | { type: "ADD_TECH"; tech: Technology }
  | { type: "SET_TECHS"; techs: Technology[] }
  | { type: "TOGGLE_TECH"; index: number }
  | { type: "SELECT_ALL" }
  | { type: "SELECT_NONE" }
  | { type: "SET_TARGET_DIR"; dir: string }
  | { type: "SET_SKILL_RESULTS"; results: SkillResult[] }
  | { type: "UPDATE_SKILL_RESULT"; index: number; result: Partial<SkillResult> }
  | { type: "SET_CLAUDE_MD_GENERATED" }
