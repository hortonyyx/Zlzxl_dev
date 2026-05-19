# Development Workflow

## Daily Flow

1. Pull latest code.
2. Install dependencies if lockfile changed.
3. Open a fresh model window for planning or execution.
4. Load `docs/ai/START_HERE.md` and the active execution package.
5. Implement one module or one small fix.
6. Run available checks.
7. Open WeChat DevTools and test the changed flow.
8. Cross-review with the other model family.
9. Commit a small working change.

## Planning Flow

Use GPT-5.5 or Opus to clarify:

- Goal.
- Scope.
- Non-goals.
- Risks.
- Acceptance criteria.
- Execution modules.

Save the result under:

```text
docs/specs/<feature>/requirements.md
docs/specs/<feature>/design.md
docs/specs/<feature>/tasks.md
```

## Execution Flow

Ask Codex or Claude Code to implement one module at a time.

Good prompt shape:

```text
Load docs/ai/START_HERE.md and docs/specs/<feature>/tasks.md.
Implement only Phase 1 / Task 2. Keep pages thin. Do not touch unrelated files.
After the change, run the narrowest check and summarize files changed.
```

## Review Flow

After each module:

- If Claude implemented it, ask Codex/GPT-family model to review.
- If Codex implemented it, ask Claude/Opus-family model to review.

After a major milestone:

- Ask GPT-5.5 for an independent review.
- Ask Opus for an independent review.
- Reconcile findings manually before continuing.

## Commit Style

Use simple conventional commits:

- `feat: add login flow`
- `fix: handle expired session`
- `chore: update project docs`
- `docs: clarify setup`

## Context Hygiene

Reset context when the model starts forgetting constraints, the chat becomes too long, or you switch from planning to execution or review.

Use `docs/ai/context-reset.md` before the reset.
