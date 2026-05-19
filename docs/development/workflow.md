# 开发流程

## 日常流程

1. 拉取最新代码。
2. 如果 lockfile 变了，安装依赖。
3. 为规划或执行打开新的模型窗口。
4. 加载 `docs/ai/START_HERE.md` 和当前执行包。
5. 实现一个模块或一个小修复。
6. 运行可用检查。
7. 打开微信开发者工具测试改动流程。
8. 用另一个模型家族交叉审阅。
9. 提交一个小而可工作的改动。

## 规划流程

用 GPT-5.5 或 Opus 明确：

- 目标。
- 范围。
- 不做什么。
- 风险。
- 验收标准。
- 执行模块。

把结果保存到：

```text
docs/specs/<feature>/requirements.md
docs/specs/<feature>/design.md
docs/specs/<feature>/tasks.md
```

## 执行流程

让 Codex 或 Claude Code 一次实现一个模块。

推荐提示词结构：

```text
加载 docs/ai/START_HERE.md 和 docs/specs/<feature>/tasks.md。
只实现 阶段 1 / 任务 2。保持页面轻量，不要改无关文件。
改完后运行最窄检查，并总结修改文件。
```

## 审阅流程

每个模块完成后：

- 如果 Claude 实现，让 Codex/GPT 家族模型审阅。
- 如果 Codex 实现，让 Claude/Opus 家族模型审阅。

大节点完成后：

- 让 GPT-5.5 独立审阅。
- 让 Opus 独立审阅。
- 手动汇总两边结论后再继续。

## 提交格式

使用简单 conventional commits：

- `feat: add login flow`
- `fix: handle expired session`
- `chore: update project docs`
- `docs: clarify setup`

## 上下文卫生

当模型开始忘记约束、对话太长，或你要从规划切到执行/审阅时，重置上下文。

重置前使用 `docs/ai/context-reset.md`。

