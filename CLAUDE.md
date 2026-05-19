# Claude Code 使用说明

遵守 `AGENTS.md` 中的同一套项目规则。

## 新窗口启动上下文

每次在新窗口开始工作，读取：

1. `docs/ai/START_HERE.md`
2. `docs/ai/context-map.md`
3. `docs/ai/vibe-coding-system.md`
4. 当前功能的执行包：`docs/specs/<feature>/`，如果存在

## 协作约定

Codex 和 Claude Code 可能都会在这个仓库里工作。默认认为用户或其他 Agent 可能已经改过文件。

- 编辑前必须先查看当前文件内容。
- 不要回滚你没有做的改动。
- 改动范围要贴合当前任务。
- 做出架构决策时，在 `docs/ai/session-notes.md` 里记录。
- 优先小提交或小补丁。

## 执行包约定

如果当前功能存在执行包，把这三个文件作为当前功能的事实来源：

- `requirements.md` 定义范围和验收标准。
- `design.md` 定义架构和风险。
- `tasks.md` 定义实现顺序和验证闸门。

一次只实现一个任务组，然后停下来等待验证和交叉审阅。

## 默认任务流程

收到实现任务时，按这个顺序做：

1. 理解页面或功能边界。
2. 检查 `docs/ai/context-map.md`。
3. 实现最小可工作的版本。
4. 如可用，运行 TypeScript、lint 或 build 检查。
5. 说明需要在微信开发者工具中手动验证的内容。
6. 总结 diff，方便 Codex/GPT 家族模型审阅。
