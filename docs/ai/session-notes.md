# 决策记录

这里记录 AI 辅助开发过程中的重要决策、发现和经验。

## 2026-05-19

- 项目初始化为微信原生小程序 MVP。
- 当前优先级：先验证微信小程序 MVP，跨平台产品框架等验证后再评估。
- 增加 Codex 和 Claude Code 的跨 Agent 协作文档。

## 2026-05-19 工作流更新

- 默认工作流改为集中上下文入口：`docs/ai/START_HERE.md`。
- 规划由 GPT-5.5 或 Opus 对话完成，再拆成执行模块。
- Codex 和 Claude Code 可分别执行模块，每个模块结束后由另一个模型家族交叉审阅。
- 大节点完成后，需要 GPT-5.5 和 Opus 分别独立评审。
- 管理文档集中在 `docs/ai`，方便切换模型。

## 2026-05-19 命名和语言约定

- 面向用户和模型交互的管理文档统一使用中文。
- 小程序源码目录改为 `Zlzl_miniprogram`，避免通用目录名在多项目协作中混淆。

## 2026-05-19 产品概念对齐

与 Opus 完成产品概念梳理，关键决策：

- 产品定位：语音优先的长周期 AI 学伴，对标陪伴关系而非工具调用。
- 信息架构「双视图」：节点流 = 写入日志（append-only，作历史）；
  学习脉络 = 读取/导航视图（AI 维护、逐课迭代）。节点是生产单元，不是导航单元。
- 学习脉络呈现：三层（生长路径 / 单站详情 / 完整文档），靠 delta 体现成长。
- 模块统一模型：输入知识目标 → 交互 → 产出 → 回写脉络掌握信号。
  模块既可 AI 驱动也可用户驱动，信号统一记录，与驱动方无关。
- 学习管理分层：算法层（间隔重复/遗忘曲线）管“记没记住”，
  AI 层管“懂没懂”与路径编排。AI 不做记忆调度。
- eager vs lazy：记录类产物（总结/要点/核心问题/脉络）课后立即固化；
  练习类产物（测验/闪卡/抽背）按需生成，只固化信号。
- MVP 锁定上课模式一条主线：多模态输入 → 课堂总结（完整总结+要点提炼+核心问题）
  → 课后测验 → 脉络迭代。SRS 算法、其他模式与模块、用户主动触发入口均为 v2。
- 下一步：为 MVP 建执行包 `docs/specs/<feature>/`，
  并对本轮产品概念做一次跨模型家族交叉审阅。

## 2026-05-19 上课模式 MVP 技术决策

- 已建执行包 `docs/specs/class-mode/`（requirements / design / tasks）。
- 后端方案：微信云开发（云函数 + 云数据库 + 云存储），不自建后端；
  LLM / ASR 密钥仅存云函数；登录用 openid，不做账号体系。
- 转写时机：MVP 用课后转写。录音页保持极简，不在课中推送转写流——
  上课应专注课程内容，不让用户分心。实时转写 + 课中 AI 旁注为后续增强，
  呈现形式待商榷（功能要做，形式再定）。
- `prototype.html` 录音页（屏 ④）据此改为极简版。
- 交叉审阅：DeepSeek 审阅结论已纳入 `concept.md` 第 13 节；
  GPT-5.5 复审由用户在 Codex 客户端人工进行（codex MCP 太慢，不再调用）。

## 2026-05-19 双模式扩展与两轮审阅吸收

- DeepSeek、Codex 两轮交叉审阅完成，原文与处置存档于 `docs/reviews/`。
- **MVP 范围扩展**：从"仅上课模式"扩为"**上课模式 + 学习模式**"。理由：
  护城河（复利留存）= 学习模式里的复习循环，上课模式单独验证不了。
  规划模式仍为 v2。
- **知识体系 / 状态体系二分**纳入 `concept.md`：知识体系（WHAT，输入喂养 +
  AI 组织）与状态体系（WHEN/WHETHER，复习回写驱动）；学习脉络是二者的
  读取视图，不是第三个体系。
- **双链方向**：知识点采用图结构。MVP 仅轻量 `relatedIds`；带类型链接 +
  图感知编排为 v2。链接由 AI 维护，不给用户编辑（守"少选择"）。
- **长期规划机制**写入 `concept.md` §7.3：算法把"状态"变"到期" → AI 把
  "到期清单"编排成"学习节点"。
- **目标用户收窄**：首批锁定概念密集、叙述型、考试重理解论述的大学课程；
  数学 / 编程 / 物理等强练习课不进首批。
- **验证策略**：`tasks.md` 阶段 0 改为"mock 工程跑通体验闭环"，含
  GO/NO-GO 闸门；先验证体验价值，再硬化录音 / ASR / 云流水线。
- Codex 6 条技术 + 7 条产品意见已吸收进执行包；轻量合规（录音前提示、
  删除入口）记录在 `concept.md` §13.2，MVP 暂不做。
- `prototype.html` 扩为双模式 11 屏；`prototype.md` 收为结构索引，
  移除 ASCII 线框，消除与 .html 的口径漂移。

## 2026-05-19 原型迭代（双模式选择 + 12 屏）

- 课堂总结节点增加「完整转写稿」入口。
- 测验模块**纳入语音作答**（逆转此前"首版仅文字"——产品语音优先）；
  仍保留文字作答。
- `库` 在新建时分**课程学习 / 自主学习**两类；新建库页加模式选择。
  MVP 专注课程学习；自主学习占位，其交互待重新设计。
- 新增「空白库页」（课程学习冷启动）：新建库后首屏，用淡化预览传达
  "脉络会长大"。
- **标记待办**：纯自主学习模式"学习节点完全由 AI 安排"的交互，对自学
  场景未必合适，需单独重新设计——后续讨论。
- `prototype.html` 扩为 12 屏；新增 `docs/product/structure.html`
  产品结构总览（给团队讲产品用）。

## 2026-05-19 第一版 MVP 落地总控包

- 新增 `docs/specs/mvp-implementation/`，作为 Codex / Claude 后续协作的
  第一版 MVP 总控执行包。
- 该包不替代 `docs/specs/class-mode/`；`class-mode` 保留详细功能设计，
  `mvp-implementation` 负责阶段顺序、协作边界、GO / NO-GO 闸门和验收。
- 落地策略明确为：先真实 UI + mock 服务跑通体验闭环，再接微信云开发、
  真录音、ASR 和 LLM 流水线。

## 2026-05-19 MVP 阶段 0/1 实现 checkpoint

- 阶段 0 已完成：新增 11 个 MVP 页面占位目录，`app.json` 注册路由；
  `constants/routes.ts` 定义稳定路由常量；`index` 保留为首页并可进入课程
  学习库主路径。
- 阶段 1 已完成：新增 `types/learning.ts` 领域类型；新增 `services/cloud.ts`
  mock 开关；新增 library / mailuo / class-session / study-session / module /
  knowledge service mock 实现，并用 `mock-store.ts` 共享 demo 数据。
- mock 数据当前支持 demo 库、空库创建、两次课堂输入复用旧知识点 ID、今日
  学习编排、测验 / 闪卡信号回写，以及知识点 / station 状态刷新。
- 状态规则落在 `services/knowledge.ts`：未解决疑问优先黄；失败晚于通过则黄；
  有通过且无更晚问题为绿；无信号为灰。station 按黄 > 灰 > 绿汇总。
- 已通过 `corepack pnpm run check`。还未做微信开发者工具走查；阶段 2 UI
  前需要另一个模型家族重点审阅 service mock 数据是否足够支撑原型体验。

## 2026-05-20 MVP 阶段 2 mock UI path checkpoint

- 已按 Opus 审阅意见先修阶段 1 地基：demo station 1 只挂绿色知识点，避免
  `getMailuo` 重算后一片黄；自建库课堂 mock 由“永远复用第一个点”改为
  主线点 + 桥接点 + 本节新点；读操作统一经 `callCloud` mock 入口。
- 阶段 2 已完成最薄 UI 主路径：库列表、库创建、库主页、站点详情、手动课堂
  输入、处理页、课堂总结、今日学习、测验、闪卡、结果页均接入 mock service。
- 当前可走的体验闭环：新建课程学习库 → 手动输入课堂内容 → mock 生成总结和
  脉络 delta → 今日学习 → 学习节点 → 测验 / 闪卡 → 掌握信号回写 →
  回库主页看状态和脉络变化。
- 本轮明确停在阶段 2.5 GO / NO-GO 产品闸门前；未接微信云开发、真录音、
  ASR 或 LLM，未修改 `project.config.json`。
- 已通过 `corepack pnpm run check`。仍需在微信开发者工具中手动走查两条路径：
  demo 库 → 今日学习 → 测验 / 闪卡 → 结果 → 脉络更新；新建库 → 空库 →
  手动输入课堂内容 → 总结 → 测验 → 结果。

## 2026-05-20 MVP 阶段 2 GO / NO-GO 前打磨

- 已处理 Opus 阶段 2 审阅 C1-C4：
  - 测验页不再直接展示 `expectedAnswer`，改为用户输入后提交；
  - 闪卡页改为逐张翻卡并自评“记得 / 还不稳”；
  - 站点详情改为按当前 station 的 `knowledgePointIds` 精确展示知识点；
  - `gradeModule` 回写信号后同步更新 `mailuo.latestUpdateNote` 和学伴便签，
    让复习后的 delta 能在库主页被看到。
- 顺手加了 `library-detail` 的 `mailuo` 空值守卫。仍未处理 D 类非阻塞问题：
  固定色条、路由栈重复、node-summary 测验语义、视觉与 prototype 差距。
- 已通过 `corepack pnpm run check`。当前仍应停在 GO / NO-GO 闸门前，下一步
  是微信开发者工具走查和产品判断，不进入阶段 3。

## 2026-05-20 微信开发者工具 TS 编译插件修复

走查时点"进入课程学习库"按钮没反应，控制台报
`Component "pages/index/index" does not have a method "goToMainPath"`。

根因：`project.config.json` 的 `useCompilerPlugins` 之前是 `false`，微信
开发者工具不会把 `.ts` 编成 `.js`；它发现页面只有 `.ts` 时，会**自动
生成一个空白 `Page({})` 模板 `.js`**，运行时加载这个空白模板，所以找不到
任何业务方法。

修复：

- 删除 12 个自动生成的空白 `Zlzl_miniprogram/pages/*/index.js`。
- `project.config.json` 改为 `"useCompilerPlugins": ["typescript"]`，
  工具会自动编译 .ts。

约束补充：AGENTS.md 写"不要修改 project.config.json，除非任务明确要求"
——此项目本来就需要 TS 编译，这是基建必要项，记录于此供后续模型不再
踩坑。后续若需引入 sass / less 等可在 `useCompilerPlugins` 数组里扩展。

## 2026-05-20 第一轮 MVP 收工总览

**本轮做了什么**(按 commit 时间顺序):

- 阶段 0:scaffold 路由 + 11 个页面占位 + index 路由常量。
- 阶段 1:`types/learning.ts` + 6 个 service mock 实现 + `cloud.ts` mock 开关 +
  `mock-store` demo 数据(`feat: add mvp mock service foundation`)。
- 地基修复(Opus 审阅 Q3/Q2/读操作/Node 别名):demo station 1 只挂绿点;
  `upsertClassKnowledgePoints` 改成 main + bridge + new 三点结构;读操作
  统一经 `callCloud`;`Node` 别名移除(`fix: harden mvp mock foundation`)。
- 阶段 2 mock UI 主路径:12 页全部接通 service,体验闭环可走
  (`feat: add mvp mock ui path`)。
- C1–C4 GO/NO-GO 前打磨(Opus 阶段 2 审阅意见):
  - 测验改文本作答提交,移除 expectedAnswer 展示;
  - 闪卡改逐张翻卡 + 自评;
  - station-detail 按 mailuo.station.knowledgePointIds 精确过滤;
  - `mockGradeModule` 后同步更新 `mailuo.latestUpdateNote` 和便签,
    复习后回库能看见 delta(`fix: polish mvp mock modules`)。
- 产品文档梳理:concept / brief / backlog / architecture / prototype.html /
  structure.html 全部产出并对齐;DeepSeek、Codex、Opus(×2)四轮交叉审阅
  归档到 `docs/reviews/`。
- 收工规范:新增 `docs/ai/wrap-up.md` + README 升级到产品先行版本。
- 基建修复:`project.config.json` 启用 TypeScript 编译插件,
  清除 12 个工具自动生成的空白 `.js` 模板,小程序运行时正常加载 `.ts` 编译产物。

**GO / NO-GO 闸门**:**通过**。用户在微信开发者工具中走完 demo 库与
自建库两条主路径,体验闭环成立——可以进入阶段 3(接微信云开发、真录音、
ASR、LLM)。

**留下了什么**(进阶段 3 前要回来看):

- D 类非阻塞项(见 `docs/reviews/2026-05-20_mvp-stage2_opus_review.md`):
  - library-list 卡片"掌握分布微条"是 3 段固定色块,不反映实际比例。
  - 路由栈出现重复 `library-detail`,系统返回键会回到 stale 页。
  - node-summary 的"开始课后测验"复用了 `planStudy`,语义被并入今日学习,
    未拆分为本节课针对性测验。
  - 视觉与 `prototype.html` 差距大(panel + 文字,无脉络渲染等)。
- mock 限制:
  - `class-processing` 在 mock 下瞬态闪过,流水线无可视化。
  - `quiz-run` 评分用"输入 ≥8 字判通过"的 mock 规则。
  - `node-summary` 完整转写稿 / 纠错入口为占位文字。
  - `updateMailuoAfterModule` 在 `answers.map` 内多次触发,最后一条 answer
    决定文案口径;observations 被整体覆写会盖掉 demo 原文案。

**审阅状态**:全部归档,见 `docs/reviews/README.md`。
**验证状态**:`corepack pnpm run check` 通过 + 微信开发者工具真人走查通过。
**分支**:`feat/mvp-stage0-1`,已 push,**未 merge 到 main**——是否合并由
用户决定;若合并建议走 PR(链接见仓库提示)。

**下一步建议**:开阶段 3 执行 brief 前,先就以下三点对齐:
1. 接哪家 ASR / LLM(MVP 一直挂着的两个待确认)。
2. 长录音降级的具体分段参数(前台连续 + 中断续录)。
3. D 类项是否要在阶段 3 之前顺手清掉。
