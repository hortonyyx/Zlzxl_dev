# Vibe Coding System

This project uses a centralized-context, plan-first, module-by-module AI development workflow.

## Core Idea

Do not start from code. Start from intent, constraints, and an executable plan.

The default flow is:

1. Open a new model window with a clean context.
2. Load `docs/ai/START_HERE.md` and the management docs it links.
3. Clarify requirements with GPT-5.5 or Opus.
4. Turn the discussion into a plan with clear boundaries.
5. Split the plan into execution modules.
6. Execute one module at a time with Codex, Claude Code, or another coding agent.
7. After each module, run cross-review using the other frontier model family.
8. Run available checks and WeChat DevTools validation before continuing.
9. After each major milestone, get independent reviews from GPT-5.5 and Opus.
10. Distill useful decisions into `docs/ai/session-notes.md`, `docs/specs`, or `docs/skills`.
11. Reset context when the conversation becomes noisy.

## Execution Package

Every non-trivial feature should have a small execution package:

- `requirements.md`: user goal, scope, non-goals, acceptance criteria.
- `design.md`: architecture, data flow, UI states, API contracts, risks.
- `tasks.md`: ordered implementation modules with verification gates.

Recommended location:

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

The package can be written by GPT-5.5, Opus, Codex, Claude Code, or manually.

## Module Gate

A module is complete only when:

- The targeted behavior works.
- The implementation stays inside the planned scope.
- TypeScript/lint/build checks pass when available.
- WeChat DevTools checks are listed.
- Manual simulator or real-device checks are listed when relevant.
- A cross-review agent has checked the diff for bugs, regressions, and scope creep.
- Important decisions are recorded in `docs/ai/session-notes.md`.

## Cross-Review Rule

Use model diversity deliberately:

- If Claude/Opus-family model implemented it, ask Codex/GPT-5.5-family model to review.
- If Codex/GPT-family model implemented it, ask Claude/Opus-family model to review.
- For major milestones, ask GPT-5.5 and Opus to review independently before reconciling their findings.

## Context Reset Rule

Reset context when:

- The agent starts forgetting constraints.
- The chat is mostly historical noise.
- A major module is complete.
- A bug hunt has changed direction multiple times.
- You are switching from planning to execution, or from execution to review.

Before reset, produce a compact handoff using `docs/ai/context-reset.md`.

