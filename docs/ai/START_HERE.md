# AI 上下文入口

每次打开新的模型窗口，**先加载这个文件**(讲规则)、**再加载
[`NEXT_WINDOW.md`](NEXT_WINDOW.md)**(讲现在做到哪、分支 / 阶段 /
踩过的坑)。两份各司其职:本文是**稳定**的工作流与约束,`NEXT_WINDOW` 是
**每轮更新**的现状快照。

## 当前工作流

本项目使用“集中上下文 + 先计划 + 交叉审阅”的工作流。

1. 打开一个干净的新模型窗口。
2. 加载本文件，以及下面列出的管理文档。
3. 和 GPT-5.5 或 Opus 聊清楚需求、目标和边界。
4. 产出计划，并拆成可执行模块。
5. 在 Codex、Claude Code 或其他编码 Agent 中一次执行一个模块。
6. 每个模块完成后，用另一个模型家族交叉审阅。
7. 大节点完成后，让 GPT-5.5 和 Opus 分别独立评审。
8. 把决策、评审结论和可复用经验写回管理文档。
9. 当前对话变脏时，果断开启新上下文。

## 必须加载的管理文档

始终加载：

- `docs/ai/NEXT_WINDOW.md`：**当前现状快照**(分支 / 阶段 / 跨窗口潜规则),
  每轮收工同步。
- `AGENTS.md`：编码 Agent 通用规则。
- `CLAUDE.md`：Claude Code 专用规则。
- `docs/ai/vibe-coding-system.md`：完整工作流。
- `docs/ai/context-map.md`：项目知识位置索引。
- `docs/ai/agent-protocol.md`：跨 Agent 交接和冲突规则。
- `docs/ai/model-roles.md`：模型分工。
- `docs/ai/review-checklist.md`：模块和里程碑审阅清单。
- `docs/ai/wrap-up.md`：一轮工作结束的收工清单。

按需加载：

- `docs/product/concept.md`：产品概念与设计说明（详细，含决策理由）。
- `docs/product/brief.md`：产品方向（摘要）。
- `docs/product/backlog.md`：优先级队列。
- `docs/specs/<feature>/`：当前功能的执行包。
- `docs/ai/session-notes.md`：决策和重要发现。
- `docs/skills/README.md`：沉淀下来的项目技能。

## 不可破坏的约束

- 微信小程序 MVP 优先。
- 使用微信原生小程序模式、TypeScript、pnpm。
- MVP 验证前不要引入 Taro、uni-app、React、Vue 或其他跨端框架。
- 一次只实现一个模块。
- 每个模块完成后先交叉审阅，再推进下一步。
- 大节点必须让 GPT-5.5 和 Opus 分别独立评审。
- 管理文档集中在 `docs/ai`，方便切模型时快速加载。
