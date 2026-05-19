# Vibe Coding System

This project uses a spec-first, module-by-module AI development workflow.

## Core Idea

Do not start from code. Start from intent, constraints, and a small executable plan.

The default flow is:

1. Discuss product intent with a strong reasoning model.
2. Produce a spec package with Kiro or another planning agent.
3. Review and revise the spec package manually.
4. Hand the approved spec package to the coding agent.
5. Implement one module at a time.
6. Test before moving to the next module.
7. Run a separate review agent after each module.
8. Distill useful decisions into docs, specs, or skills.
9. Reset context when the conversation becomes noisy.

## Spec Package

Every non-trivial feature should have three files:

- `requirements.md`: user goals, scope, non-goals, acceptance criteria.
- `design.md`: architecture, data flow, UI states, API contracts, risks.
- `tasks.md`: ordered implementation steps with verification gates.

Recommended location:

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

## Module Gate

A module is complete only when:

- The targeted behavior works.
- TypeScript/lint/build checks pass when available.
- WeChat DevTools can open the changed flow.
- Manual simulator or real-device checks are listed.
- A review agent has checked the diff for bugs and scope creep.
- Important decisions are recorded in `docs/ai/session-notes.md`.

## Context Reset Rule

Reset context when:

- The agent starts forgetting constraints.
- The chat is mostly historical noise.
- A major module is complete.
- A bug hunt has changed direction multiple times.

Before reset, produce a compact handoff using `docs/ai/context-reset.md`.
