# 执行包工作流

这个目录存放功能级计划包，用于“先计划后开发”。

每个非平凡功能建议包含：

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

模板在 `docs/specs/templates`。

## 推荐流程

1. 用 GPT-5.5 或 Opus 澄清目标。
2. 产出简洁计划，并拆成模块。
3. 写入或更新三个执行包文件。
4. 人审阅并修正执行包。
5. Codex 或 Claude Code 一次实现一个模块。
6. 进入下一模块前，运行检查并在微信开发者工具中验证。
7. 用另一个模型家族交叉审阅。
8. 决策记录到 `docs/ai/session-notes.md`。

## 命名

使用短功能名：

```text
docs/specs/login/
docs/specs/onboarding/
docs/specs/profile/
```

## 当前执行包

- `mvp-implementation/`：第一版 MVP 总控落地方案，用于 Codex / Claude 分阶段协作。
- `class-mode/`：上课 + 学习双模式详细功能包；目录名沿用早期“上课模式”命名，
  当前实际覆盖完整 MVP 循环。
