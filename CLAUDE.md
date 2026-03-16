# Project Instructions

## Two-Layer Architecture

This repo is **the system that builds the system**.

- **AGENTIC LAYER** (root) — orchestration, Claude commands, skills, hooks, agents, specs, tooling. Changes here affect the build platform itself.
- **APP LAYER** (`apps/{APP}`) — artifacts produced by this harness. Each app is an independent deliverable with its own git repository. Do not conflate tooling changes with app product changes.

When working on `.claude/`, `adws/`, `scripts/`, or `specs/` — you are in the Agentic Layer.
When working on `apps/{APP}/` — you are in the App Layer.

## Tools
You have access to skills in `.claude/skills/`.
When a task matches a skill description, read its SKILL.md first.

## Rules
- Do NOT read script source code directly
- Use `uv run <script> --help` to discover usage on demand
- Prefer structured output (--json) when processing data