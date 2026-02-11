# BStack — Tech Stack Curation CLI

## Context

Terminal UI tool that curates tech stacks and generates Claude Code project configs. Two input modes: AI-powered topic research or GitHub repo analysis via `opensrc`. For each technology in the curated stack, first searches [skills.sh](https://skills.sh) for an existing skill, validates it thoroughly (AI + web search — not just name matching), and installs it. Only when no appropriate skill exists does it fall back to generating a custom skill using `opensrc` + AI. Output: a `.claude/` folder with CLAUDE.md + skills, ready for Claude Code.

---

## User Flow (Screen by Screen)

### 1. Welcome
```
╭──────────────────────────────────────────╮
│                                          │
│         ░█▀▄░█▀▀░▀█▀░█▀█░█▀▀░█░█       │
│         ░█▀▄░▀▀█░░█░░█▀█░█░░░█▀▄       │
│         ░▀▀░░▀▀▀░░▀░░▀░▀░▀▀▀░▀░▀       │
│                                          │
│    Curate tech stacks for Claude Code    │
│                                          │
│          Press Enter to start            │
╰──────────────────────────────────────────╯
```
- `<ascii-font font="shade" text="BStack" />` centered in `<box>`
- Dim tagline: `<text attributes={TextAttributes.DIM}>`
- `useKeyboard`: Enter → mode-select, Escape → `renderer.destroy()`

### 2. Mode Select
```
╭ BStack ──────────────────────────────────╮
│                                          │
│  How do you want to build your stack?    │
│                                          │
│  > ◉ Research a Topic                    │
│      AI searches the web for the best    │
│      technologies for your project       │
│                                          │
│    ○ Explore Repositories                │
│      Fetch repos via opensrc, analyze    │
│      their tech stack                    │
│                                          │
╰──────────────────── esc quit ── ↑↓ nav ──╯
```
- `<select>` with 2 options + descriptions
- `onSelect` → dispatch mode + navigate

### 3a. Topic Input
```
╭ BStack ─── Research a Topic ─────────────╮
│                                          │
│  What do you want to build?              │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ real-time collaborative editor   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Examples:                               │
│    e-commerce platform with payments     │
│    mobile app with offline sync          │
│    CLI tool for database migrations      │
│                                          │
╰──────────────────── esc back ── ⏎ go ────╯
```
- `<input focused>` with placeholder
- Dim examples below
- Enter → research screen, Escape → back

### 3b. Repo Input
```
╭ BStack ─── Explore Repositories ─────────╮
│                                          │
│  Add GitHub repos (owner/repo or pkg):   │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ vercel/next.js                   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Added:                                  │
│    ✓ facebook/react                      │
│    ✓ drizzle-team/drizzle-orm            │
│                                          │
╰────── ⏎ add · tab analyze · esc back ───╯
```
- `<input>` for owner/repo or npm package name (opensrc supports both)
- Enter adds to list, Tab starts analysis
- `d` removes highlighted repo

### 4a. Research Screen (topic)
```
╭ BStack ─── Researching ─────────────────╮
│                                          │
│  ⠹ Researching: real-time collab editor  │
│                                          │
│ ┌─ Discoveries ─────────────────────────┐│
│ │  ✓ Next.js            framework       ││
│ │  ✓ TypeScript          language       ││
│ │  ✓ Yjs                library         ││
│ │  ✓ PostgreSQL          database       ││
│ │  ⠹ researching...                     ││
│ └───────────────────────────────────────┘│
╰──────────────────────────────────────────╯
```
- Spinner (braille frames via `setInterval`)
- `streamText` + `Output.array()` + `elementStream` → techs appear one by one
- `<scrollbox height={...}>` for list
- Auto-advances to Curation when done

### 4b. Analysis Screen (repo)
```
╭ BStack ─── Analyzing Repos ─────────────╮
│                                          │
│  ⠹ Fetching facebook/react...           │
│  ✓ Fetched drizzle-team/drizzle-orm     │
│                                          │
│  ⠹ Analyzing tech stack...              │
│                                          │
│ ┌─ Discovered ──────────────────────────┐│
│ │  ✓ React               framework     ││
│ │  ✓ Drizzle ORM          library      ││
│ └───────────────────────────────────────┘│
╰──────────────────────────────────────────╯
```
- `Bun.spawn(["bunx", "--bun", "opensrc", slug])` per repo
- After fetch: read package.json / config files from fetched source
- AI categorizes into `Technology[]`
- Auto-advances to Curation

### 5. Curation
```
╭ BStack ─── Curate Your Stack ───────────╮
│                                          │
│ ┌─ Technologies ─┐ ┌─ Details ─────────┐│
│ │ [x] Next.js    │ │ Next.js           ││
│ │ [x] TypeScript  │ │ Framework         ││
│ │ [ ] Prisma      │ │                   ││
│ │ [x] Yjs         │ │ React framework   ││
│ │ [x] PostgreSQL  │ │ for production    ││
│ │ [ ] Redis       │ │ with SSR, routing ││
│ │ [x] Tailwind    │ │ and more.         ││
│ │                 │ │ nextjs.org        ││
│ └─────────────────┘ └───────────────────┘│
╰── ⏎ toggle · a all · n none · c next ───╯
```
- Two-panel: `<select>` left, detail `<box>` right
- `onChange` → update detail panel, `onSelect` → toggle `[x]`/`[ ]`
- `useKeyboard`: `a` all, `n` none, `c` continue (≥1 selected)

### 6. Config
```
╭ BStack ─── Generate Configuration ──────╮
│                                          │
│  Target directory:                       │
│  ┌──────────────────────────────────┐    │
│  │ ./my-project                     │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Selected: Next.js, TypeScript, Yjs,     │
│  PostgreSQL, Tailwind CSS                │
│                                          │
│  Will generate:                          │
│    CLAUDE.md + skills for 5 technologies │
│                                          │
╰──────────────── esc back ── ⏎ generate ──╯
```
- `<input>` for target dir (default `./`)
- Summary of selected techs
- Enter → start skill sourcing + generation

### 7. Generating (with Skill Sourcing)
```
╭ BStack ─── Setting Up ──────────────────╮
│                                          │
│  ✓ Next.js       installed from skills.sh│
│  ✓ TypeScript    installed from skills.sh│
│  ⠹ Yjs          searching skills.sh...  │
│  · PostgreSQL                            │
│  · Tailwind CSS                          │
│                                          │
│  ━━━━━━━━━━━━━━━░░░░░░░░  40%          │
│                                          │
│ ┌─ Log ─────────────────────────────────┐│
│ │ Searching skills.sh for "yjs"...      ││
│ │ Found 2 candidates, validating...     ││
│ │ Checking yjs-collaboration skill...   ││
│ └───────────────────────────────────────┘│
╰──────────────────────────────────────────╯
```

**Per-technology pipeline** (shown in log panel):
1. `npx skills find <tech>` → parse candidates
2. For each candidate: fetch skill page from skills.sh URL → get description, install count
3. AI validates: does description match the technology? Is it maintained? Good install count?
4. If still uncertain: web search to verify skill repo quality
5. **Match found** → `npx skills add <owner/repo> --skill <name> --agent claude-code -y --cwd <targetDir>`
6. **No match** → fallback: `opensrc` fetch tech repo/docs → AI generates custom 5-file skill

After all skills sourced:
- Generate CLAUDE.md
- Auto-advance to Done

### 8. Done
```
╭ BStack ─── Done! ───────────────────────╮
│                                          │
│  ✓ Set up 5 technologies                 │
│                                          │
│  ./my-project/                           │
│    CLAUDE.md                             │
│    .claude/skills/                       │
│      ✓ nextjs (skills.sh)               │
│      ✓ typescript (skills.sh)            │
│      ★ yjs (custom)                      │
│      ✓ postgresql (skills.sh)            │
│      ✓ tailwindcss (skills.sh)           │
│                                          │
│  Your Claude Code environment is ready!  │
│                                          │
╰────────────────────────── ⏎ exit ────────╯
```
- Shows source per skill: `skills.sh` or `custom`
- Tree view of generated structure
- Enter/Escape → `renderer.destroy()`

---

## Skill Sourcing Pipeline (lib/skills.ts)

This is the core logic. For each technology:

### Step 1: Search skills.sh
```ts
// Run: npx skills find <query>
const proc = Bun.spawn(["npx", "skills", "find", tech.name], { stdout: "pipe" })
const output = await new Response(proc.stdout).text()
// Parse output lines matching: owner/repo@skill-name
// Extract: { owner, repo, skillName, url }
```

### Step 2: Validate candidates (thorough, not just name match)
For each candidate skill:

```ts
// a) Fetch skill page for metadata
const pageData = await fetchSkillPage(candidate.url)
// Extract: description, weekly installs, first seen date

// b) AI validation — does this skill actually match our technology?
const validation = await generateText({
  model: "openai/gpt-4.1",
  output: Output.object({
    schema: z.object({
      isMatch: z.boolean(),       // Does it match the technology?
      confidence: z.number(),     // 0-1 confidence score
      reasoning: z.string(),      // Why/why not
      isGenericOrSpammy: z.boolean(), // Catch low-quality skills
    })
  }),
  prompt: `Validate if this skill matches the technology "${tech.name}" (${tech.category}).

Skill name: ${candidate.skillName}
Skill description: ${pageData.description}
Weekly installs: ${pageData.weeklyInstalls}
First seen: ${pageData.firstSeen}
Skill URL: ${candidate.url}

Consider:
- Does the description specifically address ${tech.name}?
- Is it a generic/catch-all skill or specific to this tech?
- Is the install count reasonable (not 0)?
- Is the author reputable?
- Does it overlap with another tech (e.g. "react-native" vs "react")?`
})

// c) If confidence < 0.8, do web search verification
if (validation.output.confidence < 0.8 && validation.output.isMatch) {
  const webCheck = await generateText({
    model: "openai/gpt-4.1",
    tools: { web_search: openai.tools.webSearch() },
    stopWhen: stepCountIs(2),
    prompt: `Verify this skills.sh skill: ${candidate.url}
      Check the GitHub repo: is it maintained? Does it have real content?
      Does it genuinely help with ${tech.name} development?`
  })
  // Factor web results into final decision
}
```

### Step 3: Install or generate
```ts
if (bestCandidate && bestCandidate.confidence >= 0.7) {
  // Install from skills.sh
  await Bun.spawn(["npx", "skills", "add",
    `${candidate.owner}/${candidate.repo}`,
    "--skill", candidate.skillName,
    "--agent", "claude-code",
    "-y",
  ], { cwd: targetDir })
  return { source: "skills.sh", skill: candidate.skillName }
} else {
  // Fallback: generate custom skill via opensrc + AI
  return await generateCustomSkill(tech, targetDir)
}
```

### Step 4: Custom skill fallback (lib/generator.ts)
```ts
async function generateCustomSkill(tech: Technology, targetDir: string) {
  // a) Fetch tech source/docs via opensrc
  await Bun.spawn(["bunx", "--bun", "opensrc", tech.repoUrl || tech.name],
    { cwd: targetDir })

  // b) Read fetched docs/source for context
  // c) AI generates 5-file skill structure using web search for current docs
  // d) Write files to targetDir/.claude/skills/{name}/
  return { source: "custom", skill: tech.name }
}
```

---

## File Structure

```
src/
  index.tsx              # createCliRenderer + createRoot + render <App />
  App.tsx                # AppContext provider + screen router
  types.ts               # Technology, Screen, AppState, SkillResult

  screens/
    WelcomeScreen.tsx
    ModeSelectScreen.tsx
    TopicInputScreen.tsx
    RepoInputScreen.tsx
    ResearchScreen.tsx
    AnalysisScreen.tsx
    CurationScreen.tsx
    ConfigScreen.tsx
    GeneratingScreen.tsx
    DoneScreen.tsx

  components/
    Header.tsx           # "BStack" small + screen title
    StatusBar.tsx         # Bottom bar with keybinding hints
    Spinner.tsx          # Braille spinner animation

  lib/
    ai.ts                # AI research: streamText + webSearch + Output.array
    skills.ts            # skills.sh search, validation, install pipeline
    repo.ts              # opensrc fetch + source analysis
    generator.ts         # CLAUDE.md generation + custom skill fallback
```

---

## State Management

```ts
type Screen = "welcome" | "mode-select" | "topic-input" | "repo-input"
  | "research" | "analysis" | "curation" | "config" | "generating" | "done"

type Technology = {
  name: string
  category: "language" | "framework" | "library" | "tool" | "platform" | "database" | "other"
  description: string
  reasoning: string
  docsUrl: string
  repoUrl?: string
  selected: boolean
}

type SkillResult = {
  techName: string
  source: "skills.sh" | "custom"
  skillName: string
  status: "pending" | "searching" | "validating" | "installing" | "generating" | "done" | "error"
  log: string[]  // status messages for the log panel
}

type AppState = {
  screen: Screen
  mode: "topic" | "repo" | null
  topic: string
  repoUrls: string[]
  technologies: Technology[]
  targetDir: string
  skillResults: SkillResult[]
  claudeMdGenerated: boolean
}
```

React Context + `useReducer`.

---

## AI Integration (lib/ai.ts)

**Dep**: `bun add @ai-sdk/openai zod`

**Before writing code**: fetch current model IDs:
```bash
curl -s https://ai-gateway.vercel.sh/v1/models | jq -r '[.data[] | select(.id | startswith("openai/")) | .id] | reverse | .[]'
```

### Topic Research — two-pass streaming
```ts
// Pass 1: web research with webSearch tool
const research = await generateText({
  model: openai("gpt-4.1"),
  tools: { web_search: openai.tools.webSearch() },
  stopWhen: stepCountIs(5),
  system: "Research the best technologies for building the described project.",
  prompt: `Research best tech stack for: ${topic}`,
})

// Pass 2: stream structured Technology[]
const { elementStream } = streamText({
  model: openai("gpt-4.1"),
  output: Output.array({ element: TechSchema }),
  prompt: `Extract 8-15 recommended technologies:\n\n${research.text}`,
})
for await (const tech of elementStream) { onTech({ ...tech, selected: true }) }
```

### Skill validation — structured output
```ts
const { output } = await generateText({
  model: openai("gpt-4.1"),
  output: Output.object({ schema: SkillValidationSchema }),
  prompt: `Validate if skill matches tech...`,
})
```

### Custom skill generation — web search + opensrc context
```ts
const result = await generateText({
  model: openai("gpt-4.1"),
  tools: { web_search: openai.tools.webSearch() },
  stopWhen: stepCountIs(3),
  system: "Generate a Claude Code skill. Include critical rules, doc links, patterns, gotchas.",
  prompt: `Create skill for ${tech.name}. Context from source:\n${opensrcContext}`,
})
```

---

## Repo Exploration via opensrc (lib/repo.ts)

```ts
export async function fetchSource(slug: string): Promise<void> {
  // opensrc supports: owner/repo, npm packages, pypi:pkg, crates:pkg
  await Bun.spawn(["bunx", "--bun", "opensrc", slug], { stdout: "pipe", stderr: "pipe" })
}

export async function analyzeSource(slug: string): Promise<string> {
  // Read key files from fetched source: package.json, config files, etc.
  // Return concatenated dependency info for AI analysis
}
```

---

## Config Generation (lib/generator.ts)

### CLAUDE.md
AI-generated with: Project, Commands, Architecture, Conventions, Workflow Rules, Pre-Implementation Rules.

Key rule: "Before implementing with any technology, load its skill first. If no skill exists, research the technology's documentation before writing code."

### Custom Skill Fallback — 5-file structure
```
{name}/
  SKILL.md              # YAML frontmatter + critical rules + "do not trust internal knowledge"
  references/
    REFERENCE.md        # Overview, reading order, quick start
    api.md              # API surface, key functions
    patterns.md         # Common patterns, best practices
    gotchas.md          # Pitfalls, debugging tips
```

---

## Dependencies

```
bun add @ai-sdk/openai zod
```

---

## Implementation Order (end-to-end)

1. **Foundation**: `types.ts` + `App.tsx` (context/reducer/router) + refactor `index.tsx`
2. **Welcome + Mode Select**: screens + `Header`, `StatusBar`, `Spinner` components
3. **Topic flow**: `lib/ai.ts` (install deps, verify model IDs) + `TopicInputScreen` + `ResearchScreen`
4. **Curation**: `CurationScreen` (two-panel, toggle, keyboard shortcuts)
5. **Skill sourcing**: `lib/skills.ts` (search + validate + install pipeline)
6. **Generation**: `lib/generator.ts` (CLAUDE.md + custom skill fallback) + `ConfigScreen` + `GeneratingScreen` + `DoneScreen`
7. **Repo flow**: `lib/repo.ts` (opensrc) + `RepoInputScreen` + `AnalysisScreen`

---

## Verification

1. `bun dev` → welcome renders with ASCII banner
2. Navigate all screens with keyboard
3. Topic mode: type topic → streaming tech discovery → curate → generate
4. Generating screen: skills.sh search visible in log, validation reasoning shown
5. Check installed skills: `npx skills list` in target dir
6. Check custom skills: 5-file structure with real content
7. Check CLAUDE.md: proper sections, references skills
8. Repo mode: opensrc fetches repos → analysis → same curation/generation flow

---

## Key References

- OpenTUI React: `.claude/skills/opentui/references/react/patterns.md`
- OpenTUI inputs: `.claude/skills/opentui/references/components/inputs.md`
- OpenTUI containers: `.claude/skills/opentui/references/components/containers.md`
- OpenTUI keyboard: `.claude/skills/opentui/references/keyboard/REFERENCE.md`
- AI SDK errors: `.claude/skills/ai-sdk/references/common-errors.md`
- AI SDK gateway: `.claude/skills/ai-sdk/references/ai-gateway.md`
- skills.sh CLI: `npx skills --help` (find, add, list commands)
- opensrc CLI: `bunx --bun opensrc --help`
