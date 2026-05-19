# Spec Workflow

This folder stores Kiro-style spec packages.

Each feature should have:

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

Use the templates in `docs/specs/templates`.

## Recommended Flow

1. Use Opus 4.6 to clarify intent.
2. Use Kiro Spec mode to draft the three files.
3. Human reviews and revises the files.
4. Coding agent implements one task group at a time.
5. Run tests/checks before the next task group.
6. Run a separate review agent.
7. Record decisions in `docs/ai/session-notes.md`.
