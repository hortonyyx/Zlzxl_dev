# Model Roles

Use models according to task cost and difficulty.

## Planning

Primary:

- Opus 4.6

Use for:

- Requirement clarification.
- Product tradeoffs.
- Architecture decisions.
- Difficult bug diagnosis.
- Spec review.

## Main Implementation

Primary:

- Sonnet 4.6

Use for:

- Feature implementation.
- Refactors with clear scope.
- Test creation.
- Documentation updates tied to implementation.

## Backup Implementation

Backup:

- GLM 5.1

Use when:

- Primary token budget is exhausted.
- The task is clear and bounded.
- You can verify the output quickly.

## Runner / Research / Summarizer

Use smaller or cheaper models such as Gemini Flash 3.1 or Haiku 4.5 for:

- Searching files.
- Summarizing docs.
- Installing dependencies.
- Collecting logs.
- Drafting review notes.

## Review Agent

Use a separate agent for review after each module.

Review priority:

1. Bugs and regressions.
2. Missing edge cases.
3. Broken architecture boundaries.
4. Missing verification.
5. Overbuilt or speculative code.
