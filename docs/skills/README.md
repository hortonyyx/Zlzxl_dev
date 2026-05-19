# 沉淀技能

每个里程碑之后，把项目专属经验沉淀在这里。

这个目录用于保存能跨上下文、跨模型复用的项目知识。

## 什么时候新增技能

出现以下情况时，新增或更新技能：

- 某类 bug 反复出现。
- 某个提示词模式特别有效。
- 某个模块形成了稳定项目约定。
- 审阅发现了未来 Agent 应该记住的规则。
- 某个工作流已经足够可靠，值得复用。

## 格式

```md
## Skill: 名称

什么时候使用：

步骤：

坑点：

验证：

示例提示词：
```

## 建议文件

如果内容超过几行，单独建一个 markdown 文件：

```text
docs/skills/wechat-request-wrapper.md
docs/skills/module-cross-review.md
docs/skills/context-reset-handoff.md
```
