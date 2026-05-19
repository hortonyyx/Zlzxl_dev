# Context Map

Use this file before changing code. For new model windows, start with `docs/ai/START_HERE.md`.

## Central AI Management

- `docs/ai/START_HERE.md`: first file to load into any new model window.
- `docs/ai/vibe-coding-system.md`: workflow from planning to module execution to review.
- `docs/ai/model-roles.md`: model responsibilities and cross-review policy.
- `docs/ai/agent-protocol.md`: handoff and conflict rules.
- `docs/ai/review-checklist.md`: module and milestone review criteria.
- `docs/ai/context-reset.md`: clean-context handoff template.
- `docs/ai/session-notes.md`: decisions, discoveries, and lessons.

## Product

- `docs/product/brief.md`: MVP product brief.
- `docs/product/backlog.md`: prioritized tasks.

## Execution Packages

- `docs/specs/<feature>/requirements.md`: scope and acceptance criteria.
- `docs/specs/<feature>/design.md`: technical and UX design.
- `docs/specs/<feature>/tasks.md`: module-by-module execution plan.

## Development

- `docs/development/setup.md`: Windows/macOS setup.
- `docs/development/workflow.md`: daily development flow.

## Mini Program Code

- `miniprogram/pages`: page entry points.
- `miniprogram/components`: reusable components.
- `miniprogram/services`: API and business workflows.
- `miniprogram/stores`: shared state.
- `miniprogram/utils`: platform wrappers and generic helpers.
- `miniprogram/types`: shared TypeScript types.
- `miniprogram/constants`: stable config and route constants.

## Before Editing

1. Locate the active execution module.
2. Read only the relevant page/service/store/component files.
3. Check whether a wrapper already exists before calling a `wx.*` API directly.
4. Keep the model context clean and focused.
