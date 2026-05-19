# Development Setup

## Required Tools

Install the same core tools on Windows and macOS:

- WeChat DevTools
- Git
- Node.js 24 LTS
- pnpm 9.15.0
- VS Code, Cursor, Codex, or Claude Code

## Node Version

The project uses `.node-version`:

```text
24
```

Recommended version managers:

- Windows: fnm or nvm-windows
- macOS: fnm or nvm

## Install Dependencies

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
```

## Open In WeChat DevTools

Open the repository root in WeChat DevTools.

Use TypeScript if DevTools asks for a language choice.

Do not commit `project.private.config.json`.


