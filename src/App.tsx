import { createContext, useContext, useReducer, type Dispatch } from "react"
import type { AppState, AppAction, Screen } from "./types.ts"
import { WelcomeScreen } from "./screens/WelcomeScreen.tsx"
import { ModeSelectScreen } from "./screens/ModeSelectScreen.tsx"
import { TopicInputScreen } from "./screens/TopicInputScreen.tsx"
import { RepoInputScreen } from "./screens/RepoInputScreen.tsx"
import { ResearchScreen } from "./screens/ResearchScreen.tsx"
import { AnalysisScreen } from "./screens/AnalysisScreen.tsx"
import { CurationScreen } from "./screens/CurationScreen.tsx"
import { ConfigScreen } from "./screens/ConfigScreen.tsx"
import { GeneratingScreen } from "./screens/GeneratingScreen.tsx"
import { DoneScreen } from "./screens/DoneScreen.tsx"

export const initialState: AppState = {
  screen: "welcome",
  mode: null,
  topic: "",
  repoSlugs: [],
  technologies: [],
  targetDir: "./out",
  skillResults: [],
  claudeMdGenerated: false,
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen }
    case "SET_MODE":
      return { ...state, mode: action.mode }
    case "SET_TOPIC":
      return { ...state, topic: action.topic }
    case "ADD_REPO":
      return { ...state, repoSlugs: [...state.repoSlugs, action.slug] }
    case "REMOVE_REPO":
      return { ...state, repoSlugs: state.repoSlugs.filter((_, i) => i !== action.index) }
    case "ADD_TECH":
      return { ...state, technologies: [...state.technologies, action.tech] }
    case "SET_TECHS":
      return { ...state, technologies: action.techs }
    case "TOGGLE_TECH":
      return {
        ...state,
        technologies: state.technologies.map((t, i) =>
          i === action.index ? { ...t, selected: !t.selected } : t
        ),
      }
    case "SELECT_ALL":
      return {
        ...state,
        technologies: state.technologies.map((t) => ({ ...t, selected: true })),
      }
    case "SELECT_NONE":
      return {
        ...state,
        technologies: state.technologies.map((t) => ({ ...t, selected: false })),
      }
    case "SET_TARGET_DIR":
      return { ...state, targetDir: action.dir }
    case "SET_SKILL_RESULTS":
      return { ...state, skillResults: action.results }
    case "UPDATE_SKILL_RESULT":
      return {
        ...state,
        skillResults: state.skillResults.map((r, i) =>
          i === action.index ? { ...r, ...action.result } : r
        ),
      }
    case "SET_CLAUDE_MD_GENERATED":
      return { ...state, claudeMdGenerated: true }
  }
}

type AppContextType = {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

function ScreenRouter({ screen }: { screen: Screen }) {
  switch (screen) {
    case "welcome":
      return <WelcomeScreen />
    case "mode-select":
      return <ModeSelectScreen />
    case "topic-input":
      return <TopicInputScreen />
    case "repo-input":
      return <RepoInputScreen />
    case "research":
      return <ResearchScreen />
    case "analysis":
      return <AnalysisScreen />
    case "curation":
      return <CurationScreen />
    case "config":
      return <ConfigScreen />
    case "generating":
      return <GeneratingScreen />
    case "done":
      return <DoneScreen />
  }
}

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <box flexGrow={1} flexDirection="column">
        <ScreenRouter screen={state.screen} />
      </box>
    </AppContext.Provider>
  )
}
