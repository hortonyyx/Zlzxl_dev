# Cross-Agent Protocol

This project is designed for high-intensity AI-assisted development with Codex and Claude Code.

## Operating Model

- Human owns product direction and acceptance.
- Codex is the default implementation and repository maintenance agent.
- Claude Code may be used for alternative implementation, review, debugging, or larger refactors.
- Agents should treat each other as collaborators, not as sources of truth.

## Handoff Format

When handing work from one agent to another, include:

```md
## Goal

What should change?

## Current State

What has already been changed or discovered?

## Files In Scope

- path/to/file

## Constraints

- Important rules or risks.

## Verification

- What was run?
- What still needs manual testing?
```

## Conflict Rules

- Never overwrite work without reading it first.
- If two approaches conflict, keep the smaller working approach unless the user chooses otherwise.
- Architectural changes must be noted in `docs/ai/session-notes.md`.
- Large rewrites should be split into phases.

## Review Checklist

- Does this keep pages thin?
- Are API calls centralized?
- Are storage and toast helpers reused?
- Are types explicit at module boundaries?
- Can Windows and macOS both install and run it?
- Can WeChat DevTools still open the project?

