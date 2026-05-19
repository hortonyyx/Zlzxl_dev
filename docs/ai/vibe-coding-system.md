# Vibe Coding 工作流

本项目使用“集中上下文 + 先计划 + 分模块执行”的 AI 开发流程。

## 核心思想

不要从代码开始。先明确意图、约束和可执行计划。

默认流程：

1. 打开干净的新模型窗口。
2. 加载 `docs/ai/START_HERE.md` 以及它链接的管理文档。
3. 用 GPT-5.5 或 Opus 梳理需求。
4. 把讨论结果整理成有明确边界的计划。
5. 把计划拆成可执行模块。
6. 用 Codex、Claude Code 或其他编码 Agent 一次执行一个模块。
7. 每个模块完成后，用另一个模型家族做交叉审阅。
8. 继续前先跑可用检查，并在微信开发者工具中验证。
9. 大节点完成后，让 GPT-5.5 和 Opus 分别独立评审。
10. 把有用决策沉淀到 `docs/ai/session-notes.md`、`docs/specs` 或 `docs/skills`。
11. 对话变脏时重置上下文。

## 执行包

非平凡功能都应该有一个小型执行包：

- `requirements.md`：用户目标、范围、不做什么、验收标准。
- `design.md`：架构、数据流、UI 状态、API 契约、风险。
- `tasks.md`：按顺序排列的实现模块和验证闸门。

推荐位置：

```text
docs/specs/<feature-name>/requirements.md
docs/specs/<feature-name>/design.md
docs/specs/<feature-name>/tasks.md
```

执行包可以由 GPT-5.5、Opus、Codex、Claude Code 或你手动整理。

## 模块完成闸门

一个模块只有满足以下条件才算完成：

- 目标行为可用。
- 实现没有超出计划范围。
- 如可用，TypeScript、lint 或 build 检查通过。
- 微信开发者工具检查项已列出。
- 相关时列出模拟器或真机检查项。
- 交叉审阅 Agent 已检查 bug、回归风险和范围漂移。
- 重要决策已记录到 `docs/ai/session-notes.md`。

## 交叉审阅规则

刻意利用模型差异：

- Claude/Opus 家族模型实现的内容，交给 Codex/GPT-5.5 家族模型审阅。
- Codex/GPT 家族模型实现的内容，交给 Claude/Opus 家族模型审阅。
- 大节点让 GPT-5.5 和 Opus 分别独立审阅，再汇总判断。

## 上下文重置规则

以下情况建议重置上下文：

- Agent 开始忘记约束。
- 聊天历史已经主要是噪音。
- 一个大模块已经完成。
- Bug 排查多次转向。
- 从规划切到执行，或从执行切到审阅。

重置前，用 `docs/ai/context-reset.md` 产出简洁交接摘要。
