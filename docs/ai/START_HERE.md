# AI Context Entry

Load this file first when starting a new model window.

## Current Workflow

The project uses a centralized-context, plan-first, cross-review workflow.

1. Start a fresh window.
2. Load this entry file and the linked management docs below.
3. Discuss requirements with GPT-5.5 or Opus until the goal and boundaries are clear.
4. Produce a plan and split it into execution modules.
5. Execute one module at a time in Codex, Claude Code, or another coding agent.
6. After each module, run cross-review with the other frontier model family.
7. After a major milestone, ask GPT-5.5 and Opus to review independently.
8. Record decisions, review outcomes, and reusable lessons in the management docs.
9. Start a new clean context when the current thread becomes noisy.

## Management Docs To Load

Always load:

- `AGENTS.md`: shared repository rules for coding agents.
- `CLAUDE.md`: Claude Code-specific rules.
- `docs/ai/vibe-coding-system.md`: full workflow.
- `docs/ai/context-map.md`: where project knowledge lives.
- `docs/ai/agent-protocol.md`: handoff and cross-agent rules.
- `docs/ai/model-roles.md`: model responsibilities.
- `docs/ai/review-checklist.md`: module and milestone review checklist.

Load when relevant:

- `docs/product/brief.md`: product direction.
- `docs/product/backlog.md`: prioritized work.
- `docs/specs/<feature>/`: active feature plan and module tasks.
- `docs/ai/session-notes.md`: decisions and discoveries.
- `docs/skills/README.md`: distilled project-specific skills.

## Non-Negotiables

- WeChat Mini Program MVP first.
- Native WeChat Mini Program patterns, TypeScript, pnpm.
- No Taro, uni-app, React, or Vue before MVP validation.
- Implement one module at a time.
- Cross-review before moving from one module to the next.
- Independent dual-model review at major milestones.
- Keep management docs centralized and easy to load into any model.
