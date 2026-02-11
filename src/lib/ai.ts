import { generateText, streamText, Output, stepCountIs } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createModel } from "./model.ts"
import type { Technology, TechCategory } from "../types.ts"

const TechCategorySchema = z.enum([
  "language",
  "framework",
  "library",
  "tool",
  "platform",
  "database",
  "other",
]) as z.ZodType<TechCategory>

const TechSchema = z.object({
  name: z.string(),
  category: TechCategorySchema,
  description: z.string(),
  reasoning: z.string(),
  docsUrl: z.string(),
  repoUrl: z.string().optional(),
})

export type ResearchStep = {
  phase: "researching" | "extracting"
  stepNumber: number
  toolCalls?: { name: string; args: Record<string, unknown> }[]
  text?: string
  finishReason?: string
}

export async function researchTopic(
  topic: string,
  onTech: (tech: Technology) => void,
  onStep?: (step: ResearchStep) => void
) {
  let stepNumber = 0

  // Pass 1: web research
  const { text: research } = await generateText({
    model: createModel("openai/gpt-5.1-codex"),
    tools: { webSearch: openai.tools.webSearch() },
    stopWhen: stepCountIs(5),
    onStepFinish(stepResult) {
      stepNumber++
      onStep?.({
        phase: "researching",
        stepNumber,
        toolCalls: stepResult.toolCalls.map((tc) => ({
          name: tc.toolName,
          args: (tc as { input?: unknown }).input as Record<string, unknown> ?? {},
        })),
        text: stepResult.text?.slice(0, 200),
        finishReason: stepResult.finishReason,
      })
    },
    prompt: `Research the best technologies, frameworks, libraries, and tools for building a project about: "${topic}". Search the web for the most current and recommended options. Focus on production-ready, well-maintained technologies. Summarize your findings with specific technology names, what category they fall into, and why they are recommended.`,
  })

  // Pass 2: stream structured output
  onStep?.({ phase: "extracting", stepNumber: 0 })

  const result = streamText({
    model: createModel("openai/gpt-5.1-codex"),
    output: Output.array({ element: TechSchema }),
    prompt: `Based on this research, extract a list of recommended technologies. For each technology provide the name, category, a short description, reasoning for why it's recommended, documentation URL, and optionally a GitHub repository URL.

Research:
${research}

Return 6-12 specific, concrete technologies that would form a complete stack for: "${topic}".`,
  })

  for await (const tech of result.elementStream) {
    onTech({ ...tech, selected: true })
  }
}
