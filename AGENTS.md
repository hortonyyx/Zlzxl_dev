# Agent Instructions

This is a WeChat Mini Program MVP. The current priority is shipping and validating the WeChat version first. Multi-platform product support can be revisited after the MVP succeeds.

## Tech Direction

- Use native WeChat Mini Program patterns.
- Use TypeScript.
- Use pnpm for dependencies.
- Keep the project compatible with Windows and macOS.
- Keep changes small, reviewable, and easy to revert.

## Architecture Boundaries

- Pages handle rendering, user interaction, and page lifecycle.
- `miniprogram/services` handles API calls and business workflows.
- `miniprogram/stores` handles shared client state.
- `miniprogram/utils` handles generic helpers.
- `miniprogram/types` holds shared TypeScript types.
- `miniprogram/constants` holds routes, config names, and stable constants.
- `docs` holds decisions, workflows, and AI collaboration context.

## Rules

- Do not call `wx.request` directly inside pages. Use `miniprogram/services/request.ts`.
- Do not scatter `wx.getStorageSync` or `wx.setStorageSync` through pages. Use `miniprogram/utils/storage.ts`.
- Do not introduce Taro, uni-app, React, Vue, or other cross-platform frameworks yet.
- Do not edit `project.config.json` unless the task explicitly requires it.
- Do not commit local machine files, secrets, build outputs, or `node_modules`.
- Prefer explicit types for API boundaries.
- Prefer simple code over clever abstractions during MVP.

## Workflow For AI Changes

Before coding:

1. Read `docs/ai/context-map.md`.
2. Identify the smallest files needed for the task.
3. State the intended change briefly.

While coding:

1. Modify only files relevant to the task.
2. Preserve user changes.
3. Add or update docs when behavior or workflow changes.

After coding:

1. Run the narrowest available check.
2. Summarize changed files and verification.
3. Mention any manual WeChat DevTools or real-device checks still needed.


## Spec-First Vibe Coding Workflow

For any non-trivial feature, do not start coding until a spec package exists:

- `docs/specs/<feature>/requirements.md`
- `docs/specs/<feature>/design.md`
- `docs/specs/<feature>/tasks.md`

Follow `docs/ai/vibe-coding-system.md` for the full workflow.

Use `docs/ai/model-roles.md` for agent/model division of labor.
Use `docs/ai/review-checklist.md` after each module.
Use `docs/ai/context-reset.md` before resetting or handing off context.

Implementation should proceed one module at a time according to `tasks.md`. Do not implement the whole app in one pass.
