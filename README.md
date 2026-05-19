# WeChat Mini Program MVP

This repository is set up for a WeChat Mini Program MVP with long-term maintenance, Windows/macOS development, and AI-assisted coding.

## Quick Start

1. Install WeChat DevTools.
2. Install Git.
3. Install Node.js 24 LTS.
4. Enable pnpm through Corepack:

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

5. Install dependencies:

```bash
pnpm install
```

6. Open this folder in WeChat DevTools.

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

Start with:

- `AGENTS.md` for Codex and other coding agents.
- `CLAUDE.md` for Claude Code.
- `docs/ai/agent-protocol.md` for cross-agent rules.
- `docs/ai/context-map.md` for where to look before changing code.



## Vibe Coding Workflow

This repository uses a spec-first AI workflow:

1. Clarify requirements with a strong reasoning model.
2. Draft Kiro-style specs in `docs/specs/<feature>`.
3. Review `requirements.md`, `design.md`, and `tasks.md` before coding.
4. Implement one module at a time with Codex or Claude Code.
5. Run checks and WeChat DevTools verification before continuing.
6. Run a separate review agent after each module.
7. Distill useful lessons into `docs/skills` or future specs.
8. Reset context using `docs/ai/context-reset.md` when the chat becomes noisy.

See `docs/ai/vibe-coding-system.md` for the full system.
