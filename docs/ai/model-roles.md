# Model Roles

Use models according to task type, review independence, and token cost.

## Planning And Requirements

Primary:

- GPT-5.5
- Opus

Use for:

- Requirement clarification.
- Product tradeoffs.
- Architecture decisions.
- Module decomposition.
- Plan critique before implementation.
- Difficult bug diagnosis.

## Main Implementation

Primary:

- Codex
- Claude Code

Use for:

- Feature implementation.
- Refactors with clear scope.
- Test creation.
- Documentation updates tied to implementation.

## Cross-Review

After each module:

- Claude/Opus-family implementation should be reviewed by GPT-5.5/Codex-family model.
- GPT-5.5/Codex-family implementation should be reviewed by Claude/Opus-family model.

Review priority:

1. Bugs and regressions.
2. Missing edge cases.
3. Broken architecture boundaries.
4. Missing verification.
5. Overbuilt or speculative code.

## Milestone Review

After a major node, get independent reviews from both:

- GPT-5.5
- Opus

Do not ask one model to merely react to the other's review first. Independent reviews catch more issues.

## Backup And Utility Models

Backup implementation:

- GLM 5.1

Use when:

- The task is clear and bounded.
- Primary token budget is exhausted.
- Output can be checked quickly.

Runner / research / summarizer:

- Gemini Flash 3.1
- Haiku-class models

Use for:

- Searching files.
- Summarizing docs.
- Collecting logs.
- Dependency and environment checks.
- Drafting non-authoritative notes.
