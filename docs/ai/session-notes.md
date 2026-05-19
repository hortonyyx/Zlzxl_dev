# Session Notes

Record important AI-assisted development decisions here.

## 2026-05-19

- Project initialized for native WeChat Mini Program MVP development.
- Chosen priority: WeChat MVP first; revisit cross-platform product frameworks after validation.
- Added cross-agent workflow docs for Codex and Claude Code.


## 2026-05-19 Workflow Update

- Removed dependency on Kiro-style planning as the default workflow.
- Adopted a centralized new-window context flow using `docs/ai/START_HERE.md`.
- Planning is handled through GPT-5.5 or Opus conversations, then split into execution modules.
- Codex and Claude Code can execute modules independently, with cross-review by the other model family after each module.
- Major milestones require independent GPT-5.5 and Opus reviews before continuing.
- Management docs are centralized under `docs/ai` for easier model switching.
