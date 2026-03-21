# Meta-Agent Skill

An agent that creates other agents. Describe what you need, get a ready-to-use subagent definition.

## How It Works

```
You: "Create an agent that reviews PRs for security issues"
          │
          ▼
┌─────────────────────┐
│  meta-agent (skill) │  ← 13-step workflow
│                     │
│  1. Read docs       │  reads .claude/docs/sub-agents.md
│  2. Analyze needs   │  purpose, tools, model, advanced fields
│  3. Fill template   │  templates/subagent-template.md
│  4. Write file      │  .claude/agents/<name>.md
└─────────────────────┘
          │
          ▼
  .claude/agents/security-reviewer.md  ← ready to use
```

## Quick Start

Just ask Claude in natural language:

```
"Create a new agent that debugs test failures"
"Build me a read-only code analyzer agent"
"I need an agent for SQL query optimization, make it fast"
```

The skill triggers automatically on keywords like "create agent", "new subagent", "build agent".

## What Gets Generated

A markdown file in `.claude/agents/` with YAML frontmatter + 4 body sections:

```yaml
---
name: debugger              # kebab-case identifier
description: ...            # WHEN to delegate (for auto-routing)
tools: Read, Edit, Bash     # optional — omit to inherit all
model: sonnet               # optional — omit to inherit parent's
color: red                  # optional — visual hint
memory: project             # optional — cross-session learning
# ... up to 15 fields supported
---

# Debugger

## Purpose       ← what this agent does
## Instructions  ← guiding principles
## Workflow      ← step-by-step process
## Report        ← how results come back
```

## Key Defaults

| Setting | Default | Override when... |
|---|---|---|
| Tools | Inherit all (omit field) | User wants read-only or restricted access |
| Model | Inherit parent (omit field) | User says "fast" → haiku, "complex" → opus |
| Color | None | Always set — helps identify agents visually |

## File Structure

```
.claude/skills/meta-agent/
├── SKILL.md                         # The skill logic (13-step workflow)
├── README.md                        # This file
├── examples.md                      # 9 walkthrough examples
└── templates/
    └── subagent-template.md         # Output template with placeholders

.claude/agents/meta-agent.md        # Thin agent wrapper (delegates to skill)
.claude/docs/sub-agents.md          # Bundled Claude Code docs (read, not fetched)
```

## Architecture

Two pieces work together:

1. **The Agent** (`.claude/agents/meta-agent.md`) — a thin 17-line wrapper. It exists so Claude knows *when* to delegate. It reads the skill and follows it.

2. **The Skill** (`.claude/skills/meta-agent/SKILL.md`) — the actual logic. 13-step workflow covering name generation, tool selection, model choice, template fill-in, and file writing.

Why split? The agent is always loaded into context (~58 tokens). The skill is only loaded when triggered (~3k tokens). This keeps idle cost near zero.

## Supported Frontmatter Fields

The skill knows all 15 frontmatter fields from the Claude Code docs:

| Field | What it controls |
|---|---|
| `name` | Unique identifier (required) |
| `description` | When to auto-delegate (required) |
| `tools` | Allowlist of tools |
| `disallowedTools` | Denylist of tools |
| `model` | haiku / sonnet / opus / inherit / full ID |
| `color` | cyan, blue, green, yellow, red, purple, orange, pink |
| `permissionMode` | default, acceptEdits, dontAsk, bypassPermissions, plan |
| `maxTurns` | Cap on agentic turns |
| `skills` | Preload skills into agent context |
| `mcpServers` | Scope MCP servers to agent |
| `hooks` | Lifecycle hooks (PreToolUse, PostToolUse, Stop) |
| `memory` | Persistent memory (user / project / local) |
| `background` | Always run as background task |
| `effort` | low / medium / high / max |
| `isolation` | worktree for git isolation |

Most agents only need `name` + `description`. The rest are opt-in.

## Examples at a Glance

The `examples.md` file has 9 detailed walkthroughs across three tiers:

**Basic** — covers the common cases:
1. Code reviewer (inherit all tools)
2. Debugger (inherit all tools, red color)
3. Read-only analyzer (restricted tools)
4. SQL analyst (haiku for speed)

**Advanced** — shows advanced frontmatter:
5. Memory-enabled reviewer (`memory: project`)
6. Hook-guarded DB agent (`hooks` for SQL validation)
7. MCP-scoped browser tester (`mcpServers` with Playwright)
8. Skill-preloaded API developer (`skills` injection)

**Project-specific** — enforces repo conventions:
9. App-layer scout (two-layer isolation guard)

## One-Shot Agents

For throwaway agents, use the `tmp-` prefix:

```
"Create a one-shot agent to analyze this log file"
→ generates .claude/agents/tmp-log-analyzer.md
```

Delete `tmp-*` agents when done. They're designed to be ephemeral.

## Color Guide

Colors hint at the agent's domain:

| Color | Domain |
|---|---|
| `cyan` | Technical, code-focused |
| `blue` | Architecture, planning |
| `green` | Testing, validation |
| `yellow` | Docs, analysis, research |
| `red` | Debugging, critical fixes |
| `purple` | Data, research |
| `orange` | Build, deploy, DevOps |
| `pink` | UI/UX, creative |
