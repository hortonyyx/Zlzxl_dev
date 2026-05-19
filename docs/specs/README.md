# Execution Package Workflow

This folder stores feature-level planning packages for plan-first development.

Each non-trivial feature should have:

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

Use the templates in `docs/specs/templates`.

## Recommended Flow

1. Use GPT-5.5 or Opus to clarify intent.
2. Produce a concise plan and split it into modules.
3. Write or update the three execution package files.
4. Human reviews and revises the package.
5. Codex or Claude Code implements one module at a time.
6. Run checks and WeChat DevTools verification before the next module.
7. Cross-review with the other frontier model family.
8. Record decisions in `docs/ai/session-notes.md`.

## Naming

Use short feature names:

```text
docs/specs/login/
docs/specs/onboarding/
docs/specs/profile/
```
