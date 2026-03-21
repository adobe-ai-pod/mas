# Meta-Agent Skill Upgrade

## Goal

Upgrade the meta-agent from a 65-line agent definition to a full skill with supporting files, incorporating patterns from the orchestrator project's reference implementation and leveraging our local Claude Code subagent documentation.

## Current State

- **Agent**: `.claude/agents/meta-agent.md` — 65 lines, 4-step workflow, hardcoded `tools` and `model: opus`, inline template
- **Local docs**: `.claude/docs/sub-agents.md` — full Claude Code subagent documentation (frontmatter reference, examples, patterns)
- **Reference**: `orchestrator-agent-with-adws/apps/orchestrator_3_stream/.claude/skills/meta-agent/` — mature skill with SKILL.md (236 lines, 13-step workflow), template, and 9 examples

## Key Differences: Ours vs Reference vs Docs

| Aspect | Ours (Agent) | Reference (Skill) | Local Docs |
|---|---|---|---|
| Format | Single agent file | Skill + template + examples | Official docs |
| Workflow | 4 steps | 13 steps | N/A |
| Template | Inline output format | Separate `templates/` file | Shows frontmatter spec |
| Examples | None | 9 walkthroughs | 4 example agents |
| Tool strategy | Always restricts | Defaults to omit (inherit all) | Documents both approaches |
| Model selection | Hardcoded `opus` | haiku/sonnet/opus guidelines | alias, full ID, or `inherit` |
| Frontmatter fields | name, description, tools, color, model | Same 5 fields | **13 fields** (adds disallowedTools, permissionMode, maxTurns, skills, mcpServers, hooks, memory, background, effort, isolation) |
| Doc fetching | None | WebFetch from docs.claude.com | Already local |

## Design Decisions

### 1. Bundle local docs instead of fetching

The reference skill's Step 1 fetches docs from `docs.claude.com` on every invocation — fragile, slow, token-expensive. We already have `.claude/docs/sub-agents.md` locally. The skill will reference this directly:
- Faster (file read vs web fetch)
- Offline-capable
- Always current (we control the file)
- Removes dependency on `WebFetch` and `mcp__firecrawl` tools

### 2. Full frontmatter coverage

The reference skill only knows 5 frontmatter fields. Our local docs document 13. The upgraded skill will support all of them:

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique identifier, lowercase + hyphens |
| `description` | Yes | When Claude should delegate to this agent |
| `tools` | No | Allowlist. Inherits all if omitted |
| `disallowedTools` | No | Denylist, removed from inherited/specified list |
| `model` | No | `sonnet`, `opus`, `haiku`, full model ID, or `inherit`. Default: `inherit` |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | Maximum agentic turns before stop |
| `skills` | No | Skills to preload into subagent context |
| `mcpServers` | No | MCP servers scoped to this subagent |
| `hooks` | No | Lifecycle hooks scoped to this subagent |
| `memory` | No | Persistent memory scope: `user`, `project`, `local` |
| `background` | No | Always run as background task |
| `effort` | No | `low`, `medium`, `high`, `max` |
| `isolation` | No | `worktree` for git worktree isolation |

### 3. Default to tool inheritance

Omit `tools:` field by default so agents inherit all parent tools. Only restrict when user explicitly asks. This matches both the reference skill's philosophy and the official docs.

### 4. Default model is `inherit` (not `sonnet`)

The official docs say model defaults to `inherit` when omitted. The skill should follow this. Guidelines for explicit model choice:
- `haiku` — fast/lightweight (user says "quick", "fast")
- `sonnet` — balanced performance
- `opus` — complex reasoning, creative, planning
- `inherit` — match parent conversation (recommended default)

### 5. Agent name stays `meta-agentic-agent`

The existing agent at `.claude/agents/meta-agent.md` uses `name: meta-agentic-agent`. Keep this for backward compatibility. The skill name is `meta-agent` (matching the skill directory).

### 6. Two-layer guard

Always write agents to `.claude/agents/<name>.md` — never inside `apps/`. This enforces the two-layer architecture.

---

## File Structure

```
.claude/skills/meta-agent/
  SKILL.md                          # Main skill definition (~250 lines)
  templates/
    subagent-template.md            # Agent output template with all frontmatter fields
  examples.md                       # Use-case walkthroughs (basic + advanced)

.claude/agents/meta-agent.md        # Updated: thin wrapper delegating to skill
.claude/docs/sub-agents.md          # Existing: bundled reference (no changes)
```

---

## Phase 1: Create the Skill (no breaking changes)

### File 1: `templates/subagent-template.md`

Template with placeholder syntax. Includes ALL frontmatter fields as optional:

```markdown
---
name: {{AGENT_NAME}}
description: {{DESCRIPTION}}
tools: {{TOOLS}}                    # OPTIONAL: Omit to inherit all parent tools
disallowedTools: {{DISALLOWED}}     # OPTIONAL: Denylist approach
model: {{MODEL}}                    # OPTIONAL: Defaults to inherit
color: {{COLOR}}                    # OPTIONAL: Visual indicator
permissionMode: {{PERM_MODE}}      # OPTIONAL: default|acceptEdits|dontAsk|bypassPermissions|plan
maxTurns: {{MAX_TURNS}}            # OPTIONAL: Limit agentic turns
skills: {{SKILLS}}                  # OPTIONAL: Preload skills into context
mcpServers: {{MCP_SERVERS}}        # OPTIONAL: Scope MCP servers
hooks: {{HOOKS}}                    # OPTIONAL: Lifecycle hooks
memory: {{MEMORY}}                  # OPTIONAL: user|project|local
background: {{BACKGROUND}}         # OPTIONAL: true for always-background
effort: {{EFFORT}}                  # OPTIONAL: low|medium|high|max
isolation: {{ISOLATION}}            # OPTIONAL: worktree
---

# {{AGENT_TITLE}}

## Purpose

You are {{PURPOSE_DEFINITION}}.

## Instructions

{{INSTRUCTIONS}}

## Workflow

When invoked, you must follow these steps:

{{WORKFLOW_STEPS}}

## Report

{{REPORT_FORMAT}}
```

**Key rule**: Only include frontmatter fields that are relevant. Omit optional fields entirely when not needed (don't leave them as empty placeholders).

### File 2: `examples.md`

Three tiers of examples:

**Basic Examples (adopt from reference, 4 examples):**
1. Code reviewer — inherit all tools, cyan, default model
2. Debugging specialist — inherit all tools, red
3. Read-only code analyzer — restricted tools (`Read, Grep, Glob`)
4. SQL analyst — haiku model for speed

**Advanced Examples (new, leveraging local docs, 4 examples):**
5. Memory-enabled reviewer — `memory: project` for cross-session learning
6. Hook-guarded DB agent — `hooks: PreToolUse` for SQL write validation
7. MCP-scoped browser tester — `mcpServers` with inline Playwright definition
8. Skill-preloaded API developer — `skills: [api-conventions]` for domain knowledge

**Project-specific Example (new, 1 example):**
9. App-layer scout — read-only agent scoped to `apps/{APP}/` with two-layer isolation guard

Each example walks through the full decision process: requirements analysis, name/color/model/tools selection, template fill-in, file write.

### File 3: `SKILL.md`

**Frontmatter:**
```yaml
---
name: meta-agent
description: Generates new Claude Code subagent configuration files from user descriptions. Use proactively when the user asks to create a new subagent or agent. Keywords include create subagent, new agent, build agent, agent architecture.
---
```

**Body structure (~250 lines):**

1. **Title + purpose paragraph**

2. **Instructions / Prerequisites**
   - Understanding of the task or domain
   - Bundled reference at `.claude/docs/sub-agents.md`
   - Target: `.claude/agents/` directory

3. **Workflow (13 steps, adapted from reference + local docs)**

   1. **Read bundled documentation**: Read `.claude/docs/sub-agents.md` for current frontmatter reference, tool options, and patterns. *(Replaces reference's "fetch from web" step — faster, offline, no tool dependency)*
   2. **Analyze user requirements**: Purpose, tasks, domain, tools, advanced needs (memory? hooks? MCP?)
   3. **Generate agent name**: kebab-case, descriptive, concise, lowercase + hyphens only
   4. **Select color**: Use color semantics guide (cyan=code, blue=architecture, green=testing, yellow=docs, red=debug, purple=research, orange=devops, pink=creative)
   5. **Write delegation description**: Action-oriented, state WHEN to use, include trigger phrases, under 200 chars. Include "Use proactively" if appropriate
   6. **Determine tool strategy**:
      - Default: OMIT `tools:` field (inherit all)
      - If user wants restrictions: use `tools:` allowlist
      - If user wants to exclude specific tools: use `disallowedTools:` denylist
      - For agent-spawning control: use `Agent(type)` syntax
   7. **Select model**: Default to omitting (inherits). Only set explicitly if user specifies speed/capability needs
   8. **Evaluate advanced fields**: Check if the agent needs any of: `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`
   9. **Construct system prompt**: Read template at `templates/subagent-template.md`, fill placeholders, OMIT unused optional fields
   10. **Write Instructions section**: Bullet-point constraints, best practices, edge cases, domain-specific guidance
   11. **Write Workflow steps**: Numbered, specific, include examples, consider error handling
   12. **Write the file**: Save to `.claude/agents/<agent-name>.md`. Never inside `apps/`
   13. **Confirm creation**: Show path, explain usage (automatic delegation vs explicit invocation vs `--agent` session mode), suggest testing

4. **Frontmatter Reference** — Full table of all 13+ supported fields with types and descriptions (sourced from local docs)

5. **Available Tools Reference** — Categorized list:
   - File Operations: Read, Write, Edit, Glob, Grep
   - Execution: Bash
   - Web: WebFetch, WebSearch
   - Specialized: NotebookRead, NotebookEdit, TodoWrite, Agent, SlashCommand, Skill
   - Note: MCP tools available via `mcpServers` frontmatter

6. **Color Guide** — 8 colors mapped to domains

7. **Model Selection Strategy** — inherit (default), haiku, sonnet, opus, full model ID

8. **Tool Restriction Patterns** — allowlist vs denylist vs Agent(type) with examples

9. **Examples** — Link to `examples.md`

10. **Tips** — Single responsibility, default to inheriting, test immediately, version control, iterate, two-layer guard

---

## Phase 2: Update Existing Agent

Transform `.claude/agents/meta-agent.md` from self-contained to thin skill-delegating wrapper:

```yaml
---
name: meta-agentic-agent
description: Generates a new, complete Claude Code sub-agent configuration file from a user's description. Use this to create new agents. Use this Proactively when the user asks you to create a new sub agent.
color: cyan
model: opus
---
```

Body becomes minimal:
- Read the skill at `.claude/skills/meta-agent/SKILL.md`
- Follow its workflow exactly
- Write generated agents to `.claude/agents/<name>.md`

**Changes from current:**
- Remove `tools:` field (inherit all — no longer needs WebFetch/firecrawl since docs are local)
- Body shrinks from 50+ lines to ~10 lines
- All logic lives in the skill

---

## Phase 3: One-Shot Agent Pattern

Add a "One-Shot Agents" section to SKILL.md documenting the `tmp-` prefix convention:
- If user asks for an ephemeral/one-shot agent, prefix name with `tmp-` (e.g., `tmp-analyze-logs`)
- Remind user to delete `.claude/agents/tmp-*.md` after use
- Simpler than a separate command; avoids orchestration complexity

---

## Phase 4: Validation

1. Trigger test: prompt "create a new agent that..." — verify skill activates
2. Agent spawn test: verify `.claude/agents/meta-agent.md` still spawns correctly
3. Output test: generated agent has valid frontmatter (not in code block), correct 4 sections
4. Tool inheritance test: generated agent without `tools:` field inherits correctly
5. Advanced field test: generate an agent with `memory: project` — verify valid output
6. Two-layer test: verify skill refuses to write agents inside `apps/`

---

## Critical Files

| File | Role |
|---|---|
| `.claude/agents/meta-agent.md` | Current agent → becomes thin wrapper (Phase 2) |
| `.claude/docs/sub-agents.md` | Bundled reference docs (no changes, consumed by skill) |
| `.claude/skills/meta-skill/SKILL.md` | Existing skill creation conventions (pattern to follow) |
| `.claude/skills/frontend-design/SKILL.md` | Mature multi-file skill example (pattern to follow) |
| Orchestrator `skills/meta-agent/` | Reference implementation to adapt from |

## Risks

1. **Skill vs Agent naming**: Skill named `meta-agent`, agent named `meta-agentic-agent`. Both trigger on "create agent" — acceptable since the agent delegates to the skill
2. **SKILL.md size**: ~250 lines is larger than CLI-first skills (~30 lines) but appropriate for a workflow skill (comparable to `meta-experts` at 140 lines)
3. **Frontmatter complexity**: 13 fields is a lot. Mitigated by "omit unused fields" rule — most agents only need name + description
4. **Local docs staleness**: `.claude/docs/sub-agents.md` could drift from upstream. Mitigated by periodic updates (this is already a managed doc)
