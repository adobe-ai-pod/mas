---
name: meta-agent
description: Generates new Claude Code subagent configuration files from user descriptions. Use proactively when the user asks to create a new subagent or agent. Keywords include create subagent, new agent, build agent, agent architecture.
---

# Meta Agent

Creates complete, ready-to-use Claude Code subagent configuration files. This skill acts as an expert agent architect that analyzes requirements and generates properly structured subagent definitions with appropriate frontmatter, tools, system prompts, and workflows.

## Instructions

### Prerequisites

- Understanding of the task or domain the subagent should handle
- Bundled reference documentation at `.claude/docs/sub-agents.md` — covers all frontmatter fields, tool options, permission modes, and patterns
- Target directory: `.claude/agents/` for all generated agents

---

## Workflow

When invoked, follow these 13 steps in order:

### Step 1 — Read bundled documentation

Read `.claude/docs/sub-agents.md` for the current frontmatter reference, tool options, permission modes, and usage patterns.

This replaces the reference implementation's "fetch from web" step. The local file is faster, offline-capable, and always current — no dependency on `WebFetch` or external MCP tools.

### Step 2 — Analyze user requirements

Extract the following from the user's description:

- **Purpose**: What problem does this agent solve?
- **Primary tasks**: What actions will it take repeatedly?
- **Domain**: Code, testing, docs, data, DevOps, research, creative?
- **Tool needs**: Does it need to read files, write files, run commands, search the web?
- **Advanced needs**: Does it need persistent memory? Lifecycle hooks? MCP servers? Isolated worktrees? Preloaded skills?
- **Invocation style**: Should it trigger automatically on delegation, or be called explicitly?

### Step 3 — Generate the agent name

Rules:
- Format: kebab-case only (`code-reviewer`, `db-analyst`)
- Lowercase letters and hyphens only — no underscores, no spaces
- Descriptive but concise — 2–3 words maximum
- Clearly indicates the agent's purpose
- For ephemeral/one-shot agents: prefix with `tmp-` (e.g., `tmp-analyze-logs`) — see One-Shot Agents section below

### Step 4 — Select a color

Use the Color Guide below. Color is a visual indicator in the UI — choose based on the agent's primary domain.

### Step 5 — Write the delegation description

This is the most critical field for automatic delegation. Claude reads this to decide when to invoke the agent.

Rules:
- Start with role or domain (e.g., "Expert code reviewer.")
- State clearly WHEN to use the agent
- Use action-oriented language with trigger phrases
- Add "Use proactively" if the agent should trigger without being explicitly asked
- Under 200 characters
- Examples:
  - `Expert code reviewer. Use proactively after code changes to check quality, security, and maintainability.`
  - `Debugging specialist. Use when errors occur or tests fail to analyze and fix root causes.`
  - `SQL data analyst. Use when the user asks questions about database contents or wants to run queries.`

### Step 6 — Determine tool strategy

Choose one of three approaches:

| Approach | When to use | How |
|---|---|---|
| **Inherit all** (default) | Agent needs general capabilities | Omit `tools:` field entirely |
| **Allowlist** | Restrict to specific tools for focus or safety | Use `tools:` field |
| **Denylist** | Inherit most tools but exclude a few | Use `disallowedTools:` field |

For agents that spawn other subagents (main thread only), use `Agent(type)` syntax:

```yaml
tools: Agent(worker, researcher), Read, Bash
```

**Default rule**: OMIT the `tools:` field unless the user explicitly requests restrictions. Omitting inherits all parent tools including MCP tools.

### Step 7 — Select model

Default: omit the `model:` field (inherits from the parent conversation).

Only set explicitly when the user specifies speed or capability requirements:

| Value | When to use |
|---|---|
| *(omit)* | Default — inherits from parent conversation |
| `haiku` | User says "quick", "fast", "lightweight", "simple tasks" |
| `sonnet` | Balanced performance, most agentic tasks |
| `opus` | Complex reasoning, planning, creative, architectural decisions |
| `inherit` | Explicit inherit (same as omitting) |
| `claude-opus-4-6` | Specific model ID when exact version matters |

### Step 8 — Evaluate advanced fields

For each advanced field, ask: does the user's description or use case require this?

| Field | Evaluate when... |
|---|---|
| `permissionMode` | User wants to auto-accept edits, bypass prompts, or run in plan-only mode |
| `maxTurns` | User wants to limit how many steps the agent takes (cost control, safety) |
| `skills` | Agent needs domain-specific knowledge preloaded (e.g., API conventions, style guides) |
| `mcpServers` | Agent needs tools not in the main conversation (e.g., Playwright, Slack) |
| `hooks` | Agent needs conditional validation before tool execution (e.g., block SQL writes) |
| `memory` | Agent should accumulate knowledge across conversations |
| `background` | Agent should always run as a background task |
| `effort` | Agent needs a specific effort level different from the session default |
| `isolation` | Agent should work in a git worktree to avoid affecting the main working tree |

Most agents need none of these. Include only what the use case requires.

### Step 9 — Construct the system prompt

Read the template at `templates/subagent-template.md`. Fill in the placeholders:

- `{{AGENT_NAME}}`: kebab-case name from Step 3
- `{{DESCRIPTION}}`: delegation description from Step 5
- `{{AGENT_TITLE}}`: title-case display name (e.g., "Code Reviewer")
- `{{PURPOSE_DEFINITION}}`: role definition sentence (e.g., "a senior code reviewer focused on quality and security")
- `{{INSTRUCTIONS}}`: bullet-point constraints and domain guidance from Step 10
- `{{WORKFLOW_STEPS}}`: numbered steps from Step 11
- Optional frontmatter: fill only fields decided in Steps 4–8; OMIT unused optional fields entirely — do not leave empty placeholders in the output

### Step 10 — Write the Instructions section

Include bullet-point guidance that adds context beyond the purpose paragraph:

- Domain-specific constraints (e.g., "Never modify files outside `src/`")
- Best practices for the domain
- Edge cases to watch for
- Things to avoid or escalate
- Preferred approaches or patterns

Example:
```markdown
- Focus on security-critical issues before style issues
- Report findings without making changes unless explicitly asked
- When in doubt about intent, ask for clarification
- Use industry-standard naming conventions
```

### Step 11 — Write the Workflow steps

Provide clear, numbered instructions for the agent to follow at runtime:

- Be specific about what to do at each step
- Include examples and expected inputs/outputs where helpful
- Address error handling and edge cases
- Use sub-bullets for additional context within a step

Example:
```markdown
1. **Identify scope**: Determine which files or directories to review based on the user's request or recent changes.
2. **Analyze code**: Read each relevant file, looking for quality, security, and performance issues.
3. **Categorize findings**: Group issues by severity (critical, warning, suggestion).
4. **Report**: Present findings with file paths, line numbers, and actionable recommendations.
```

### Step 12 — Write the file

Save the generated agent to `.claude/agents/<agent-name>.md`.

**Two-layer guard**: NEVER write agent files inside `apps/`. The `apps/` directory is the App Layer — agent definitions belong in the Agentic Layer at `.claude/agents/`. This is non-negotiable.

Verify the file was written successfully.

### Step 13 — Confirm creation

Report back to the user with:

1. **File path**: The absolute path to the created agent file
2. **Usage modes**:
   - *Automatic delegation*: Claude reads the description and delegates automatically when the task matches
   - *Explicit invocation*: User can say "Use the `<name>` agent to..."
   - *Session mode*: Run `claude --agent <name>` to start a full session as that agent
3. **Testing suggestion**: A sample prompt to verify the agent triggers and behaves correctly

---

## Frontmatter Reference

All fields supported in subagent frontmatter (sourced from `.claude/docs/sub-agents.md`):

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Unique identifier using lowercase letters and hyphens |
| `description` | Yes | When Claude should delegate to this subagent |
| `tools` | No | Allowlist of tools the subagent can use. Inherits all if omitted |
| `disallowedTools` | No | Denylist of tools to remove from the inherited or specified list |
| `model` | No | `sonnet`, `opus`, `haiku`, full model ID, or `inherit`. Defaults to `inherit` |
| `color` | No | Visual indicator color in the UI |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan` |
| `maxTurns` | No | Maximum agentic turns before the subagent stops |
| `skills` | No | Skills to inject into the subagent's context at startup (full content, not on-demand) |
| `mcpServers` | No | MCP servers scoped to this subagent; inline or by reference name |
| `hooks` | No | Lifecycle hooks scoped to this subagent (e.g., `PreToolUse` validators) |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local` |
| `background` | No | Set to `true` to always run this subagent as a background task |
| `effort` | No | `low`, `medium`, `high`, or `max` (Opus 4.6 only). Overrides session effort level |
| `isolation` | No | Set to `worktree` to run in a temporary git worktree; auto-cleaned if no changes |

---

## Available Tools Reference

**File Operations:**
- `Read` — Read file contents
- `Write` — Create new files
- `Edit` — Modify existing files
- `Glob` — Find files by pattern
- `Grep` — Search file contents

**Execution:**
- `Bash` — Run shell commands

**Web:**
- `WebFetch` — Fetch URL content
- `WebSearch` — Search the web

**Specialized:**
- `NotebookRead` — Read Jupyter notebooks
- `NotebookEdit` — Edit Jupyter notebooks
- `TodoWrite` — Manage task lists
- `Agent` — Invoke subagents (main thread only; use `Agent(type)` for allowlist)
- `SlashCommand` — Execute slash commands
- `Skill` — Use other skills

**MCP Tools:** Available via `mcpServers` frontmatter field — not listed here because they vary by project configuration.

**Default**: Omit `tools:` to inherit all parent tools, including MCP tools. Only restrict when the user explicitly requests limitations.

---

## Color Guide

| Color | Domain |
|---|---|
| `cyan` | Technical, code-focused agents |
| `blue` | Architecture, design, planning |
| `green` | Testing, validation, verification |
| `yellow` | Documentation, analysis, research |
| `red` | Debugging, critical fixes, urgent tasks |
| `purple` | Data science, research, investigation |
| `orange` | Build, deployment, DevOps |
| `pink` | UI/UX, design, creative tasks |

---

## Model Selection Strategy

| Scenario | Model |
|---|---|
| User does not specify | Omit field — inherits from parent conversation |
| User says "quick", "fast", "simple" | `haiku` |
| User says "balanced", "general purpose" | `sonnet` |
| User says "complex", "reasoning", "planning", "creative" | `opus` |
| User specifies a version | Full model ID e.g. `claude-opus-4-6` |
| User says "same as current session" | `inherit` (or omit) |

**Default rule**: Omit `model:` field. This is the correct default — it means the subagent uses whatever model the user is currently running, keeping costs and capability consistent with the conversation.

---

## Tool Restriction Patterns

### Allowlist (tools field)

Use when the agent should only ever access a specific set of tools:

```yaml
tools: Read, Grep, Glob
```

The agent gets exactly those tools and nothing else. MCP tools are excluded.

### Denylist (disallowedTools field)

Use when the agent should inherit most tools but exclude a few:

```yaml
disallowedTools: Write, Edit
```

The agent inherits all parent tools except Write and Edit (keeps Bash, MCP tools, etc.).

### Agent spawning control (Agent(type) syntax)

Use when an agent running as main thread should only spawn specific subagents:

```yaml
tools: Agent(worker, researcher), Read, Bash
```

This is an allowlist — only `worker` and `researcher` can be spawned. Applies only when the agent runs as main thread via `claude --agent`.

### Combining both

If both `tools` and `disallowedTools` are set, `disallowedTools` is applied first, then the remaining pool is filtered by `tools`. A tool listed in both is removed.

---

## One-Shot Agents

For ephemeral tasks where the user needs a specialized agent that won't be reused:

- Prefix the name with `tmp-` (e.g., `tmp-analyze-logs`, `tmp-migrate-schema`)
- Keep the system prompt minimal — just enough for the one task
- Remind the user to delete the file after use: `.claude/agents/tmp-*.md`
- Simpler than a separate command; avoids orchestration complexity
- Useful for: one-time data analysis, specific migration tasks, exploratory research on a deadline

---

## Examples

See [examples.md](examples.md) for comprehensive walkthroughs covering:

**Engineering use cases:**
- Code reviewer (inherit all tools, cyan, default model)
- Debugging specialist (inherit all tools, red)
- Read-only code analyzer (restricted tools: `Read, Grep, Glob`)
- SQL data analyst (haiku model for speed)

**Advanced use cases leveraging all frontmatter fields:**
- Memory-enabled reviewer (`memory: project` for cross-session learning)
- Hook-guarded database agent (`hooks: PreToolUse` for SQL write validation)
- MCP-scoped browser tester (`mcpServers` with inline Playwright definition)
- Skill-preloaded API developer (`skills: [api-conventions]` for domain knowledge)

**Project-specific:**
- App-layer scout — read-only agent scoped to `apps/{APP}/` with two-layer isolation guard

---

## Tips

- **Single responsibility**: Each agent should do one thing well. If you find yourself writing "and also...", consider two agents.
- **Default to inheriting tools**: Omit the `tools:` field unless the user explicitly asks for restrictions. Inherited tools are more capable.
- **Default to inheriting model**: Omit the `model:` field unless there is a clear speed/capability reason to override. The user's current model is the right default.
- **Write clear delegation descriptions**: A vague description means Claude won't know when to use the agent. Test by asking: "Would Claude understand when to invoke this from this description alone?"
- **Test immediately**: After creating an agent, suggest a sample prompt to verify it triggers correctly. Automatic delegation only works if the description matches how users phrase requests.
- **Version control**: Commit project agents to git for team sharing. They live in `.claude/agents/` — a first-class part of the project.
- **Two-layer guard**: Agent files always go in `.claude/agents/<name>.md` — never inside `apps/`. The App Layer is for deliverables, not orchestration configuration.
- **Iterate**: Refine descriptions if delegation doesn't trigger. Refine instructions if the agent produces poor output. Small changes to the description can have large effects on when and how the agent is invoked.
