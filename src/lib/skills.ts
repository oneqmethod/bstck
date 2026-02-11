import { generateText, Output } from "ai"
import { z } from "zod"
import type { Technology, SkillResult } from "../types.ts"

const ValidationSchema = z.object({
  isMatch: z.boolean(),
  confidence: z.number(),
  reasoning: z.string(),
  isGenericOrSpammy: z.boolean(),
})

type Candidate = { owner: string; repo: string; skillName: string }

function parseCandidates(output: string): Candidate[] {
  const candidates: Candidate[] = []
  const lines = output.split("\n")
  for (const line of lines) {
    // Match patterns like "owner/repo@skill-name" or "owner/repo skill-name"
    const match = line.match(/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)[@\s]+([a-zA-Z0-9_.-]+)/)
    if (match) {
      candidates.push({ owner: match[1]!, repo: match[2]!, skillName: match[3]! })
    }
  }
  return candidates
}

async function validateCandidate(
  candidate: Candidate,
  tech: Technology
): Promise<{ isMatch: boolean; confidence: number }> {
  const result = await generateText({
    model: "openai/gpt-4.1",
    output: Output.object({ schema: ValidationSchema }),
    prompt: `You are validating whether a Claude Code skill matches a technology.

Technology: "${tech.name}" — ${tech.description}
Skill candidate: "${candidate.owner}/${candidate.repo}@${candidate.skillName}"

Evaluate if this skill is specifically about "${tech.name}" and would provide useful coding guidance for it. Be strict — reject generic, spammy, or unrelated skills.

Return your assessment.`,
  })

  const validation = result.output
  if (!validation || validation.isGenericOrSpammy) {
    return { isMatch: false, confidence: 0 }
  }
  return { isMatch: validation.isMatch, confidence: validation.confidence }
}

export async function sourceSkill(
  tech: Technology,
  targetDir: string,
  onLog: (msg: string) => void
): Promise<SkillResult> {
  const result: SkillResult = {
    techName: tech.name,
    source: "custom",
    skillName: tech.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    status: "searching",
    log: [],
  }

  const log = (msg: string) => {
    result.log.push(msg)
    onLog(msg)
  }

  try {
    // Step 1: Search for skills
    log(`Searching skills.sh for "${tech.name}"...`)
    const searchProc = Bun.spawn(["npx", "skills", "find", tech.name], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const searchOutput = await new Response(searchProc.stdout).text()
    await searchProc.exited

    const candidates = parseCandidates(searchOutput)
    log(`Found ${candidates.length} candidate(s)`)

    if (candidates.length === 0) {
      log("No candidates found, will generate custom skill")
      result.source = "custom"
      return result
    }

    // Step 2: Validate candidates
    result.status = "validating"
    let bestCandidate: Candidate | null = null
    let bestConfidence = 0

    for (const candidate of candidates) {
      log(`Validating ${candidate.owner}/${candidate.repo}@${candidate.skillName}...`)
      const validation = await validateCandidate(candidate, tech)

      if (validation.isMatch && validation.confidence > bestConfidence) {
        bestConfidence = validation.confidence
        bestCandidate = candidate
      }
    }

    // Step 3: Install if confident enough
    if (bestCandidate && bestConfidence >= 0.7) {
      result.status = "installing"
      log(`Installing ${bestCandidate.owner}/${bestCandidate.repo}@${bestCandidate.skillName}...`)

      const installProc = Bun.spawn(
        [
          "npx",
          "skills",
          "add",
          `${bestCandidate.owner}/${bestCandidate.repo}`,
          "--skill",
          bestCandidate.skillName,
          "--agent",
          "claude-code",
          "-y",
        ],
        {
          cwd: targetDir,
          stdout: "pipe",
          stderr: "pipe",
        }
      )
      await installProc.exited

      result.source = "skills.sh"
      result.skillName = bestCandidate.skillName
      result.status = "done"
      log(`Installed from skills.sh`)
      return result
    }

    // Step 4: No confident match
    log("No confident match found, will generate custom skill")
    result.source = "custom"
    return result
  } catch (err) {
    log(`Error during skill search: ${err}`)
    result.source = "custom"
    return result
  }
}
