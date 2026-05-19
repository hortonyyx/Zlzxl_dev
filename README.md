# 微信小程序 MVP

这个仓库用于开发 `Zlzl` 微信小程序 MVP，重点是长期维护、Windows/macOS 双端开发，以及高强度 AI 辅助开发。

## 快速开始

1. 安装微信开发者工具。
2. 安装 Git。
3. 安装 Node.js 24 LTS。
4. 通过 Corepack 使用 pnpm：

```bash
corepack pnpm install
```

5. 用微信开发者工具打开本项目根目录。

## 开发原则

- 使用 TypeScript。
- 页面保持轻量。
- 请求和业务流程放到 `Zlzl_miniprogram/services`。
- 可复用 UI 放到 `Zlzl_miniprogram/components`。
- 公共类型放到 `Zlzl_miniprogram/types`。
- 页面里不要直接调用 `wx.request`。
- MVP 验证前不要引入跨端框架。
- 小步提交，保证每次提交都尽量可运行。

## AI 协作入口

每次打开新的模型窗口，先加载：

- `docs/ai/START_HERE.md`
- `AGENTS.md`：Codex 和通用编码 Agent 规则
- `CLAUDE.md`：Claude Code 规则
- `docs/ai/context-map.md`：项目上下文索引

## Vibe Coding 工作流

这个项目采用“集中上下文 + 先计划 + 分模块执行 + 交叉审阅”的工作流：

1. 用 GPT-5.5 或 Opus 梳理需求。
2. 把讨论结果整理成 `docs/specs/<feature>` 下的执行包。
3. 编码前审阅 `requirements.md`、`design.md`、`tasks.md`。
4. Codex 或 Claude Code 一次只实现一个模块。
5. 继续前先跑检查，并在微信开发者工具里验证。
6. 每个模块完成后，用另一个模型家族交叉审阅。
7. 大节点完成后，让 GPT-5.5 和 Opus 分别独立评审。
8. 把有用经验沉淀到 `docs/skills` 或后续执行包。
9. 上下文变脏时，用 `docs/ai/context-reset.md` 重置。

完整流程见 `docs/ai/vibe-coding-system.md`。
