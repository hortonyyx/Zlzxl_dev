# 上下文地图

改代码前先看这个文件。新模型窗口从 `docs/ai/START_HERE.md` 开始。

## 集中 AI 管理文档

- `docs/ai/START_HERE.md`：任何新模型窗口第一个加载的文件。
- `docs/ai/vibe-coding-system.md`：从计划到模块执行再到审阅的完整流程。
- `docs/ai/model-roles.md`：模型职责和交叉审阅策略。
- `docs/ai/agent-protocol.md`：交接和冲突处理规则。
- `docs/ai/review-checklist.md`：模块和里程碑审阅标准。
- `docs/ai/context-reset.md`：干净上下文交接模板。
- `docs/ai/session-notes.md`：决策、发现和经验。

## 产品文档

- `docs/product/brief.md`：MVP 产品简报。
- `docs/product/backlog.md`：优先级队列。

## 执行包

- `docs/specs/<feature>/requirements.md`：范围和验收标准。
- `docs/specs/<feature>/design.md`：技术和体验设计。
- `docs/specs/<feature>/tasks.md`：分模块执行计划。

## 开发文档

- `docs/development/setup.md`：Windows/macOS 环境配置。
- `docs/development/workflow.md`：日常开发流程。

## 小程序代码

- `Zlzl_miniprogram/pages`：页面入口。
- `Zlzl_miniprogram/components`：可复用组件。
- `Zlzl_miniprogram/services`：API 和业务流程。
- `Zlzl_miniprogram/stores`：共享状态。
- `Zlzl_miniprogram/utils`：平台封装和通用工具。
- `Zlzl_miniprogram/types`：共享 TypeScript 类型。
- `Zlzl_miniprogram/constants`：稳定配置和路由常量。

## 编辑前检查

1. 找到当前执行模块。
2. 只读取相关页面、service、store、component 文件。
3. 直接调用 `wx.*` API 前，先检查是否已有封装。
4. 保持模型上下文干净、聚焦。
