import { streamText, Output } from "ai"
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
  repoUrl: z.string().nullable(),
})

export async function fetchSource(slug: string): Promise<string> {
  const proc = Bun.spawn(["bunx", "--bun", "opensrc", slug], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const output = await new Response(proc.stdout).text()
  await proc.exited
  return output
}

export async function analyzeRepos(
  slugs: string[],
  onStatus: (slug: string, status: "fetching" | "done") => void,
  onTech: (tech: Technology) => void
): Promise<void> {
  // Fetch all repos
  const sources: string[] = []
  for (const slug of slugs) {
    onStatus(slug, "fetching")
    const output = await fetchSource(slug)
    sources.push(`--- ${slug} ---\n${output}`)
    onStatus(slug, "done")
  }

  const combined = sources.join("\n\n")

  // Stream structured tech extraction
  const result = streamText({
    model: createModel("openai/gpt-5.1-codex"),
    output: Output.array({ element: TechSchema }),
    prompt: `Analyze the following repository source information and extract the key technologies, frameworks, libraries, and tools used. For each technology provide the name, category, a short description, reasoning for why it's part of this stack, documentation URL, and optionally a GitHub repository URL.

Return 6-15 specific, concrete technologies that form the tech stack of these repositories.

${combined}`,
  })

  for await (const tech of result.elementStream) {
    onTech({ ...tech, selected: true })
  }
}
