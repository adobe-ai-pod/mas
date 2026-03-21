---
name: {{AGENT_NAME}}
description: {{DESCRIPTION}}
tools: {{TOOLS}}                    # OPTIONAL: Allowlist. Omit entirely to inherit all parent tools (recommended default)
disallowedTools: {{DISALLOWED}}     # OPTIONAL: Denylist — removes specific tools from inherited or specified set
model: {{MODEL}}                    # OPTIONAL: inherit|haiku|sonnet|opus|<full-model-id>. Defaults to inherit when omitted
color: {{COLOR}}                    # OPTIONAL: Visual indicator in Claude Code UI
permissionMode: {{PERM_MODE}}       # OPTIONAL: default|acceptEdits|dontAsk|bypassPermissions|plan
maxTurns: {{MAX_TURNS}}             # OPTIONAL: Maximum agentic turns before stopping
skills: {{SKILLS}}                  # OPTIONAL: List of skill names to preload into this subagent's context
mcpServers: {{MCP_SERVERS}}         # OPTIONAL: MCP server definitions scoped to this subagent
hooks: {{HOOKS}}                    # OPTIONAL: Lifecycle hooks scoped to this subagent
memory: {{MEMORY}}                  # OPTIONAL: Persistent memory scope — user|project|local
background: {{BACKGROUND}}          # OPTIONAL: Set to true to always run as a background task
effort: {{EFFORT}}                  # OPTIONAL: Thinking budget — low|medium|high|max
isolation: {{ISOLATION}}            # OPTIONAL: Set to worktree for git worktree isolation
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
