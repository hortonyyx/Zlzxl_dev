# WeChat Mini Program MVP

This repository is set up for a WeChat Mini Program MVP with long-term maintenance, Windows/macOS development, and AI-assisted coding.

## Quick Start

1. Install WeChat DevTools.
2. Install Git.
3. Install Node.js 24 LTS.
4. Use pnpm through Corepack:

```bash
corepack pnpm install
```

5. Open this folder in WeChat DevTools.

## Development Principles

- Use TypeScript.
- Keep pages thin.
- Put request and business logic in `miniprogram/services`.
- Put reusable UI in `miniprogram/components`.
- Put shared types in `miniprogram/types`.
- Do not call `wx.request` directly from pages.
- Do not introduce cross-platform frameworks before the MVP is validated.
- Commit small, working changes.

## AI Collaboration

Start every fresh model window with:

- `docs/ai/START_HERE.md`
- `AGENTS.md` for Codex and other coding agents.
- `CLAUDE.md` for Claude Code.
- `docs/ai/context-map.md` for where to look before changing code.

## Vibe Coding Workflow

This repository uses a centralized-context, plan-first AI workflow:

1. Clarify requirements with GPT-5.5 or Opus.
2. Turn the discussion into an execution package in `docs/specs/<feature>`.
3. Review `requirements.md`, `design.md`, and `tasks.md` before coding.
4. Implement one module at a time with Codex or Claude Code.
5. Run checks and WeChat DevTools verification before continuing.
6. Cross-review each module with the other model family.
7. Ask GPT-5.5 and Opus for independent milestone reviews.
8. Distill useful lessons into `docs/skills` or future execution packages.
9. Reset context using `docs/ai/context-reset.md` when the chat becomes noisy.

See `docs/ai/vibe-coding-system.md` for the full system.
