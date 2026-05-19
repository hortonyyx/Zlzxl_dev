# Review Checklist

Use this after every module.

## Scope

- Does the change match the approved `tasks.md` item?
- Did it avoid unrelated refactors?
- Did it preserve existing user or agent changes?

## Architecture

- Are pages thin?
- Are API calls in `miniprogram/services`?
- Are storage operations in `miniprogram/utils/storage.ts`?
- Are toasts in `miniprogram/utils/toast.ts`?
- Are shared types in `miniprogram/types`?

## Reliability

- Are loading, empty, error, and success states handled where relevant?
- Are async failures handled?
- Are API response shapes typed?
- Could this break on real device while passing simulator?

## Multi-Device Development

- Are paths case-consistent for macOS/Linux compatibility?
- Are line endings normalized?
- Are local config files ignored?
- Are lockfiles committed when dependencies change?

## Verification

- TypeScript/lint/build command run if available.
- WeChat DevTools manual check listed.
- Real-device check listed for user-facing flows.
