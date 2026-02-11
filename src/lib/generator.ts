import { generateText, stepCountIs } from "ai"
import { openai } from "@ai-sdk/openai"
import { mkdir } from "fs/promises"
import type { Technology, SkillResult } from "../types.ts"

export async function generateClaudeMd(
  techs: Technology[],
  targetDir: string
): Promise<void> {
  const techList = techs
    .map((t) => `- ${t.name} (${t.category}): ${t.description}`)
    .join("\n")

  const skillNames = techs
    .map((t) => t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .join(", ")

  const { text } = await generateText({
    model: "openai/gpt-4.1",
    prompt: `Generate a CLAUDE.md file for a project that uses these technologies:

${techList}

The file should include these sections:
1. **Project** — Brief description of the tech stack
2. **Commands** — Common dev commands (install, dev, build, test, lint)
3. **Architecture** — High-level architecture overview based on the technologies
4. **Conventions** — Code style and project conventions
5. **Workflow Rules** — Important rules including: "Before implementing with any technology, load its skill first using the relevant slash command."

List available skills: ${skillNames}

Keep it concise and practical. Output only the markdown content, no code fences.`,
  })

  await Bun.write(`${targetDir}/CLAUDE.md`, text)
}

export async function generateCustomSkill(
  tech: Technology,
  targetDir: string,
  onLog: (msg: string) => void
): Promise<SkillResult> {
  const skillName = tech.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  const skillDir = `${targetDir}/.claude/skills/${skillName}`
  const refsDir = `${skillDir}/references`

  const result: SkillResult = {
    techName: tech.name,
    source: "custom",
    skillName,
    status: "generating",
    log: [],
  }

  const log = (msg: string) => {
    result.log.push(msg)
    onLog(msg)
  }

  try {
    // Fetch docs context via opensrc
    log(`Fetching docs for ${tech.name}...`)
    let docsContext = ""
    try {
      const opensrcProc = Bun.spawn(
        ["bunx", "--bun", "opensrc", tech.repoUrl || tech.name],
        { stdout: "pipe", stderr: "pipe" }
      )
      docsContext = await new Response(opensrcProc.stdout).text()
      await opensrcProc.exited
      log("Fetched source documentation")
    } catch {
      log("Could not fetch docs, proceeding with web search only")
    }

    // Generate skill files with AI + web search
    log(`Generating skill files for ${tech.name}...`)
    const { text } = await generateText({
      model: "openai/gpt-4.1",
      tools: { webSearch: openai.tools.webSearch() },
      stopWhen: stepCountIs(5),
      prompt: `You are generating a Claude Code skill for the technology: "${tech.name}".
Description: ${tech.description}
Docs URL: ${tech.docsUrl}
${tech.repoUrl ? `Repo: ${tech.repoUrl}` : ""}

${docsContext ? `Here is documentation context:\n${docsContext.slice(0, 8000)}\n` : ""}

Search the web for the most current documentation, API references, common patterns, and known gotchas for ${tech.name}.

Then generate exactly 5 files as a skill package. Output them in this exact format, using "---FILE: <path>---" as delimiters:

---FILE: SKILL.md---
(YAML frontmatter with name, description, globs patterns, then rules for using ${tech.name})

---FILE: references/REFERENCE.md---
(Overview of ${tech.name}: what it is, key concepts, getting started)

---FILE: references/api.md---
(API reference: key functions, methods, components, configuration options)

---FILE: references/patterns.md---
(Common patterns, best practices, idiomatic usage examples)

---FILE: references/gotchas.md---
(Known gotchas, common mistakes, breaking changes, migration notes)

Make each file practical and concise. Focus on what a developer needs to know to use ${tech.name} effectively with Claude Code.`,
    })

    // Parse and write files
    await mkdir(refsDir, { recursive: true })

    const fileBlocks = text.split(/---FILE:\s*/)
    for (const block of fileBlocks) {
      if (!block.trim()) continue
      const newlineIdx = block.indexOf("\n")
      if (newlineIdx === -1) continue

      const pathLine = block.slice(0, newlineIdx).replace(/---$/, "").trim()
      const content = block.slice(newlineIdx + 1).trim()

      if (!pathLine || !content) continue

      const filePath = `${skillDir}/${pathLine}`
      const fileDir = filePath.slice(0, filePath.lastIndexOf("/"))
      await mkdir(fileDir, { recursive: true })
      await Bun.write(filePath, content)
      log(`Wrote ${pathLine}`)
    }

    result.status = "done"
    log(`Custom skill generated for ${tech.name}`)
    return result
  } catch (err) {
    log(`Error generating skill: ${err}`)
    result.status = "error"
    return result
  }
}
