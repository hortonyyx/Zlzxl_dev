# Development Workflow

## Daily Flow

1. Pull latest code.
2. Install dependencies if lockfile changed.
3. Ask one agent to implement one small feature or fix.
4. Run available checks.
5. Open WeChat DevTools and test the changed flow.
6. Commit a small working change.

## Commit Style

Use simple conventional commits:

- `feat: add login flow`
- `fix: handle expired session`
- `chore: update project docs`
- `docs: clarify setup`

## AI/Vibe Coding Rhythm

Prefer prompts like:

```text
Implement login state persistence. Only touch miniprogram/services/auth.ts,
miniprogram/stores/userStore.ts, and the profile page. Keep pages thin.
```

Avoid prompts like:

```text
Build the whole app.
```

Small prompts make agent output easier to review and recover from.

