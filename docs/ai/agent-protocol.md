# Cross-Agent Protocol

This project is designed for high-intensity AI-assisted development with Codex, Claude Code, GPT-5.5, Opus, and backup/utility models.

## Operating Model

- Human owns product direction and acceptance.
- GPT-5.5 and Opus are primary planning and senior review partners.
- Codex and Claude Code are primary implementation agents.
- Utility models may summarize, search, or collect logs, but they do not define architecture alone.
- Agents should treat each other as collaborators, not sources of truth.

## New Window Startup

When starting a new model window:

1. Load `docs/ai/START_HERE.md`.
2. Load the active execution package in `docs/specs/<feature>/` if one exists.
3. Load only the code files relevant to the current module.
4. Ask the model to restate the goal, constraints, and next action before editing.

## Handoff Format

When handing work from one agent to another, include:

```md
## Goal

What should change?

## Current State

What has already been changed or discovered?

## Active Module

Which `tasks.md` item is in progress?

## Files In Scope

- path/to/file

## Constraints

- Important rules or risks.

## Verification

- What was run?
- What still needs manual testing?

## Review Request

What should the next model focus on?
```

## Conflict Rules

- Never overwrite work without reading it first.
- If two approaches conflict, keep the smaller working approach unless the user chooses otherwise.
- Architectural changes must be noted in `docs/ai/session-notes.md`.
- Large rewrites should be split into modules.
- A review finding is not automatically accepted; reconcile it against project goals and current code.

## Review Checklist

- Does this match the active execution module?
- Does this keep pages thin?
- Are API calls centralized?
- Are storage and toast helpers reused?
- Are types explicit at module boundaries?
- Can Windows and macOS both install and run it?
- Can WeChat DevTools still open the project?
