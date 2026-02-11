import { testRender } from "@opentui/react/test-utils"
import { mock } from "bun:test"
import { AppContext, initialState } from "./App.tsx"
import type { AppState, AppAction } from "./types.ts"
import type { Dispatch, ReactNode } from "react"

type RenderResult = Awaited<ReturnType<typeof testRender>>

export type TestSetup = RenderResult & {
  dispatch: ReturnType<typeof mock<(action: AppAction) => void>>
  pressKey: (name: string, opts?: Record<string, unknown>) => void
  frame: () => string
}

export async function renderScreen(
  Component: () => ReactNode,
  opts?: {
    state?: Partial<AppState>
    width?: number
    height?: number
  }
): Promise<TestSetup> {
  const dispatch = mock<(action: AppAction) => void>(() => {})
  const state: AppState = { ...initialState, ...opts?.state }

  const Wrapper = () => (
    <AppContext.Provider value={{ state, dispatch: dispatch as Dispatch<AppAction> }}>
      <Component />
    </AppContext.Provider>
  )

  const result = await testRender(
    <Wrapper />,
    { width: opts?.width ?? 80, height: opts?.height ?? 24 }
  )

  await result.renderOnce()

  const pressKey = (name: string, extra?: Record<string, unknown>) => {
    result.renderer.keyInput.emit("keypress", {
      name,
      sequence: "",
      ctrl: false,
      shift: false,
      meta: false,
      option: false,
      eventType: "press",
      repeated: false,
      ...extra,
    } as any)
  }

  const frame = () => result.captureCharFrame()

  return { ...result, dispatch, pressKey, frame }
}

export function typeText(setup: TestSetup, text: string) {
  setup.mockInput.typeText(text)
}

export const mockTech = (overrides?: Partial<import("./types.ts").Technology>) => ({
  name: "React",
  category: "framework" as const,
  description: "UI library",
  reasoning: "popular",
  docsUrl: "https://react.dev",
  repoUrl: null,
  selected: true,
  ...overrides,
})
