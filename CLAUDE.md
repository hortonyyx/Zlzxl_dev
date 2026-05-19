# Claude Code Instructions

Follow the same project rules as `AGENTS.md`.

## Collaboration Contract

Codex and Claude Code may both work in this repository. Assume another agent or the user may have changed files.

- Always inspect current file contents before editing.
- Do not revert changes you did not make.
- Keep edits scoped to the requested task.
- Leave notes in `docs/ai/session-notes.md` when you make architectural decisions.
- Prefer small commits or small patch sets.

## Default Task Shape

When asked to implement something, use this sequence:

1. Understand the page or feature boundary.
2. Check `docs/ai/context-map.md`.
3. Implement the smallest working version.
4. Verify with TypeScript/lint/build if available.
5. Report manual WeChat DevTools checks needed.


## Spec Mode Compatibility

When Kiro produces a spec package, treat the three files as the source of truth for the current feature:

- Requirements define scope and acceptance.
- Design defines architecture and risks.
- Tasks define implementation order and verification gates.

Implement one task group at a time, then stop for verification and review.
