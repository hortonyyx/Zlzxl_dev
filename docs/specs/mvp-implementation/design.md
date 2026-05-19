# 设计 · 第一版 MVP 落地执行方案

> 本文描述落地顺序与协作架构。具体产品细节见
> [class-mode/design.md](../class-mode/design.md)。

## 文档层级

本项目执行时按下面优先级读取事实来源:

1. `AGENTS.md` / `CLAUDE.md`:编码硬规则。
2. `docs/ai/START_HERE.md`、`context-map.md`、`vibe-coding-system.md`:
   AI 协作流程。
3. `docs/product/concept.md`、`architecture.md`、`prototype.html`:
   产品与信息架构事实来源。
4. `docs/specs/mvp-implementation/`:第一版 MVP 总控落地方案。
5. `docs/specs/class-mode/`:上课 + 学习双模式的详细功能执行包。

若出现冲突,先暂停并记录,不要靠实现者自行扩大范围。

## 落地策略

采用"先闭环、后硬化"的两层策略:

- **阶段 0/1**:真实 UI + mock 领域服务。重点验证产品体验:脉络、delta、
  便签、跨课关联、复习回写。
- **阶段 2+**:把 mock 服务逐步替换为微信云开发、真录音、ASR、LLM。

这样可以把"产品循环是否有价值"和"复杂工程是否跑通"拆开验证。

## 代码架构边界

页面:

- 只负责渲染、用户交互和生命周期。
- 不直接调用 `wx.request`、`wx.cloud`、storage。
- 通过 service 获取数据和提交动作。

服务:

- `Zlzl_miniprogram/services/cloud.ts`:统一云函数 / mock 调用入口。
- `library.ts`:库列表、新建库、demo / 空库数据。
- `mailuo.ts`:学习脉络读取与 mock 更新。
- `class-session.ts`:上课线会话和处理状态。
- `study-session.ts`:今日学习、学习节点计划。
- `module.ts`:测验 / 闪卡运行与评分。
- `knowledge.ts`:知识点、掌握信号、状态规则。

类型:

- 共享领域类型放 `Zlzl_miniprogram/types/learning.ts`。
- 页面局部展示类型尽量靠近页面,不要提前抽象。

状态:

- 第一版可先用页面 data + service 内 mock store。
- 当多个页面共享当前库 / 当前节点时,再引入 `stores/library-store.ts`、
  `stores/session-store.ts`。

组件:

- 只抽复用且稳定的展示块:库卡片、脉络路径、状态行、总结段落、测验题、
  闪卡。
- 阶段 0 不追求组件体系完整,优先保证闭环能走。

## Mock 服务设计

mock 服务要模拟真实数据形态,而不是写死页面文案:

- 预置 demo 库:至少 3 节课,展示绿 / 黄 / 灰与跨课便签。
- 新建空库:无 station,但有"脉络会长大"空状态。
- 手动课堂输入:提交文本后生成一个 class node、若干知识点、三段式总结、
  Mailuo delta。
- 第二次课堂输入:必须复用至少一个旧 KnowledgePoint ID,并生成跨课关联。
- 今日学习:从黄点和到期绿点生成 plan,每项带 rationale。
- 模块结果:测验 / 闪卡写 MasterySignal,重新计算 status 和 station 颜色。

阶段 0 的 mock 可以确定性生成,不需要真正调用 LLM。重点是验证交互和数据
闭环。

## 页面落地顺序

第一轮页面不需要一次做满 12 屏,但必须覆盖主路径:

1. `library-list`:库列表 + demo 库 + 新建入口。
2. `library-create`:课程学习新建 + 自主学习占位。
3. `library-detail`:空库 / 脉络 / 今日学习 / 开始上课入口。
4. `class-record`:阶段 0 先做"手动输入课堂内容"入口;真录音后续替换。
5. `class-processing`:mock 进度。
6. `node-summary`:三段式课堂总结 + 纠错入口占位 + 开始测验。
7. `study-node`:今日学习编排。
8. `quiz-run` / `flashcard-run`:模块执行。
9. `node-result`:信号回写结果 + 回脉络。
10. `station-detail`:单站详情和完整总结 / 转写入口占位。

## Codex / Claude 协作边界

推荐按文件组分工,同一阶段内避免重叠:

- Codex 优先:类型、service 契约、状态规则、检查修复、审阅 Claude 改动。
- Claude 优先:UI 页面、WXML/WXSS 还原原型、文案与空状态、审阅 Codex 改动。

具体执行时以用户指定为准。无论谁实现,另一个模型家族审阅:

- Claude 实现 → Codex / GPT 家族审阅。
- Codex 实现 → Claude / Opus 家族审阅。

交接必须使用 `docs/ai/agent-protocol.md` 的格式,写清楚当前任务、涉及文件、
验证和审阅重点。

## 风险控制

- **范围膨胀**:阶段 0 不接真 ASR / LLM / 云开发。
- **文档漂移**:涉及范围或架构变化,同步更新本执行包或 `class-mode` 包。
- **页面过重**:业务流程放 services,页面只拼状态和事件。
- **mock 失真**:mock 数据结构必须贴近 design.md 的实体,避免后续迁移重写。
- **模型冲突**:不要两个 Agent 同时改同一页面组;开始前先看 `git status`。
- **录音风险**:真录音阶段单独做,真机验证前不宣称完成。

## 验证方式

自动:

```bash
corepack pnpm run check
```

微信开发者工具:

- 打开仓库根目录,不是 `Zlzl_miniprogram` 子目录。
- 走库列表 → demo 库 → 今日学习 → 模块 → 结果。
- 走新建库 → 空库 → 手动输入课堂内容 → 总结 → 脉络更新。

真机:

- 阶段 0/1 可不要求。
- 真录音阶段必须验证 45 分钟前台录音、切后台 / 锁屏 / 来电中断后的分段不丢。
