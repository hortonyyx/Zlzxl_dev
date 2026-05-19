# Context Map

Use this file before changing code.

## Product

- `docs/product/brief.md`: MVP product brief.
- `docs/product/backlog.md`: prioritized tasks.

## Development

- `docs/development/setup.md`: Windows/macOS setup.
- `docs/development/workflow.md`: daily development flow.

## AI Collaboration

- `AGENTS.md`: default instructions for Codex and other agents.
- `CLAUDE.md`: Claude Code instructions.
- `docs/ai/agent-protocol.md`: cross-agent handoff and conflict rules.
- `docs/ai/session-notes.md`: decisions and important discoveries.

## Mini Program Code

- `miniprogram/pages`: page entry points.
- `miniprogram/components`: reusable components.
- `miniprogram/services`: API and business workflows.
- `miniprogram/stores`: shared state.
- `miniprogram/utils`: platform wrappers and generic helpers.
- `miniprogram/types`: shared TypeScript types.
- `miniprogram/constants`: stable config and route constants.

## Before Editing

1. Locate the feature boundary.
2. Read the nearest page/service/store files.
3. Check whether a wrapper already exists before calling a `wx.*` API directly.

