# Claude Code Instructions

Follow the same project rules as `AGENTS.md`.

## Startup Context

When starting in a fresh window, read:

1. `docs/ai/START_HERE.md`
2. `docs/ai/context-map.md`
3. `docs/ai/vibe-coding-system.md`
4. Active execution package in `docs/specs/<feature>/`, if one exists

## Collaboration Contract

Codex and Claude Code may both work in this repository. Assume another agent or the user may have changed files.

- Always inspect current file contents before editing.
- Do not revert changes you did not make.
- Keep edits scoped to the requested task.
- Leave notes in `docs/ai/session-notes.md` when you make architectural decisions.
- Prefer small commits or small patch sets.

## Execution Package Contract

When an execution package exists, treat the three files as the source of truth for the current feature:

- `requirements.md` defines scope and acceptance.
- `design.md` defines architecture and risks.
- `tasks.md` defines implementation order and verification gates.

Implement one task group at a time, then stop for verification and cross-review.

## Default Task Shape

When asked to implement something, use this sequence:

1. Understand the page or feature boundary.
2. Check `docs/ai/context-map.md`.
3. Implement the smallest working version.
4. Verify with TypeScript/lint/build if available.
5. Report manual WeChat DevTools checks needed.
6. Summarize the diff for Codex/GPT-family review.
