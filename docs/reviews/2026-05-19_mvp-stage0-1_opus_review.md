# 审阅存档 · MVP 阶段 0/1 实现 · Opus

## 元信息

- 日期:2026-05-19
- 审阅目标:分支 `feat/mvp-stage0-1`——MVP 阶段 0(路由 / 页面占位)+
  阶段 1(类型 + mock service 基座)
- 审阅方:Opus / Claude 家族
- 撰写方:Opus
- 触发:Codex 实现阶段 0/1,按工作流交另一模型家族交叉审阅

## 处置摘要

- **应先修(阻塞阶段 2 的体验质量)**:demo 库 station 状态一致性——
  `mock-store` station 1 seed 为 `green`,但其知识点 kp-modernism 为
  `yellow`,`getMailuo` 重算后三个 station 全变黄,demo 脉络失去绿→黄进展。
- **建议改,不阻塞**:`upsertClassKnowledgePoints` 跨课复用逻辑退化
  (永远复用 #1 号点);读操作不走 `callCloud`,阶段切云时迁移面大。
- **记录即可**:`correction` 信号不参与状态计算;同毫秒信号无 tie-break;
  `advanceClass` 为 no-op;`Node` 类型别名遮蔽全局。
- 总体结论:质量不错,修掉 demo 一致性问题后可进阶段 2。

## 原始审阅输出

### Q1 · knowledge.ts 状态规则 —— 正确

`calculateKnowledgeStatus`(knowledge.ts:20)完全符合约定规则:
无信号→灰;未解决 mark-question(晚于通过或无通过)→黄;失败晚于通过
(或无通过)→黄;有通过且无更晚问题→绿。`summarizeStationStatus`
按"黄 > 灰 > 绿"汇总,正确。

小问题(不阻塞):

- `correction` 信号类型未参与状态计算——只有 correction 信号的知识点会
  落到灰。语义上 correction 是"内容纠错"而非掌握度,可接受;建议在代码
  注释写明"correction 不影响 status",避免后续误判为遗漏。
- 同 timestamp 信号优先级未定义(用严格 `>` 比较)。`mockGradeModule`
  一次调用内所有 answers 共用同一 `now`,`upsert` 的 mark-question 也用
  `getMockNow()`,极端情况下同毫秒信号顺序不定。mock 阶段可容忍,真实
  数据阶段建议加 tie-break(同毫秒按 type 优先级或插入序)。

### Q2 · class-session.ts 跨课关联 —— 能跑通,但退化

`upsertClassKnowledgePoints`(class-session.ts:91)确实演示了 ID 复用:
每次课"复用库里第一个知识点"作主线点,`relatedIds` 互链,
`latestUpdateNote` 文案也点出跨课关联。

但:

- 复用逻辑是"永远复用 #1 号点",不是真归一化,也不具代表性。每节课只
  产出 2 个知识点(1 复用 + 1 新),用户自建库的脉络会很单薄。
- demo 库(手写的 kp-bauhaus 等)与用户自建库(走 upsert 退化路径)是
  **两套数据形态**。用户验证体验闭环走的是自建库,拿到的是单薄数据。
  建议阶段 2 前:让 upsert 产出略丰富的结构(复用 1–2 个点、命名更真实),
  或确保 thin-loop 演示足够有说服力。
- 每次课都给主线点打 `mark-question` 并强制 `status='yellow'`——主线点
  恒为黄。保证了"总有到期项"利于闭环连续性,但偏人工,记录即可。

### Q3 · mock-store.ts demo 数据 —— 基本够,但有一致性 bug

**应先修**:`mock-store` station 1 seed `status:'green'`,但其
`knowledgePointIds` 含 kp-modernism(seed `yellow`)。`getMailuo` 每次调
`refreshStationStatuses` → `summarizeStationStatus` 按"有黄则黄"重算,
station 1 变 yellow;三个 station 因 kp-modernism / kp-consumer 的黄
**全部算成黄**。demo 脉络会渲染成一片黄,失去 prototype 想要的绿→黄进展。

- 根因:demo 数据没按"station 色 = 知识点聚合"规则设计;承载"未解决
  疑问"叙事的 kp-modernism 被同时挂进 station 1 和 2。
- 建议:重排 demo 数据,让 station 1 的知识点全绿(kp-modernism 只归
  station 2),station 2/3 保留黄,呈现真实的"绿 → 黄 → 黄"进展。

另:demo 库 `isDemo:true`,但 `submitManualClass` 不校验 isDemo——若某
UI 路径允许对 demo 库上课会污染只读 demo。阶段 2 加 UI 或 service 守卫。

### 其他

- **读操作不走 `callCloud`**:`listLibraries` / `getMailuo` /
  `listKnowledgePoints` / `getQuizQuestions` 等读函数直接读 `mockStore`,
  只有 4 个写操作走 `callCloud`。阶段切云开发时读函数要单独改且无 mock
  开关。建议读操作也统一包一层,减少迁移面。
- `advanceClass` 是 no-op(`submitManualClass` 时 session 已置 `done`)。
  class-processing 页在 mock 下无流水线可展示,阶段 2 只能做"瞬间完成"态。
- `module.ts` mock 评分由调用方传 `pass` 决定(非 service 内评)。mock
  阶段 OK,但 quiz-run 页需自己承担 mock 对错判定。
- `types/learning.ts` 导出 `Node` 别名,遮蔽全局 `Node`,建议去掉或改名。

## 结论

阶段 0/1 质量不错,可进阶段 2。进之前**至少修 Q3 的 demo station 一致性**
(否则阶段 2 脉络 UI demo 不好看、会误导验收)。Q2 退化路径与"读不走
callCloud"建议一并改,但不阻塞。

本轮为只读审阅;`corepack pnpm run check` 由实现方运行通过,本次未重跑。
