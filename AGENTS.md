# Agent 使用说明

这是一个微信小程序 MVP 项目。当前优先级是先把微信端跑通并完成验证；多平台产品支持等 MVP 成功后再评估。

## 新窗口启动上下文

每次在新窗口开始工作，优先读取：

1. `docs/ai/START_HERE.md`
2. `docs/ai/context-map.md`
3. `docs/ai/vibe-coding-system.md`
4. 当前功能的执行包：`docs/specs/<feature>/`，如果存在

## 技术方向

- 使用微信原生小程序模式。
- 使用 TypeScript。
- 需要包管理时，通过 Corepack 使用 pnpm。
- 保持 Windows 和 macOS 都能开发。
- 改动要小、可审阅、容易回滚。

## 架构边界

- 页面只负责渲染、用户交互和页面生命周期。
- `Zlzl_miniprogram/services` 负责 API 请求和业务流程。
- `Zlzl_miniprogram/stores` 负责共享客户端状态。
- `Zlzl_miniprogram/utils` 负责通用工具和平台 API 封装。
- `Zlzl_miniprogram/types` 存放共享 TypeScript 类型。
- `Zlzl_miniprogram/constants` 存放路由、配置名和稳定常量。
- `docs` 存放决策、流程和 AI 协作上下文。

## 硬规则

- 页面里不要直接调用 `wx.request`，统一使用 `Zlzl_miniprogram/services/request.ts`。
- 页面里不要散落 `wx.getStorageSync` 或 `wx.setStorageSync`，统一使用 `Zlzl_miniprogram/utils/storage.ts`。
- MVP 验证前不要引入 Taro、uni-app、React、Vue 或其他跨端框架。
- 除非任务明确要求，不要修改 `project.config.json`。
- 不要提交本机配置、密钥、构建产物或 `node_modules`。
- API 边界尽量写明确类型。
- MVP 阶段优先简单可靠，不要过度抽象。

## 先计划后执行

非平凡功能不要直接开写。需要先有执行包或用户明确认可的计划：

- `docs/specs/<feature>/requirements.md`
- `docs/specs/<feature>/design.md`
- `docs/specs/<feature>/tasks.md`

实现时按照 `tasks.md` 或已批准计划，一次只推进一个模块。不要一口气实现整个应用。

## AI 改代码流程

编码前：

1. 读取 `docs/ai/START_HERE.md` 和 `docs/ai/context-map.md`。
2. 明确当前模块，以及本次最小需要修改的文件。
3. 简短说明准备怎么改。

编码中：

1. 只修改和任务相关的文件。
2. 保留用户和其他 Agent 的已有改动。
3. 行为、流程或架构变化时同步更新文档。

编码后：

1. 运行最窄范围的可用检查。
2. 汇总修改文件和验证结果。
3. 说明还需要哪些微信开发者工具或真机检查。
4. 默认等待另一个模型家族交叉审阅后再推进下一模块。
