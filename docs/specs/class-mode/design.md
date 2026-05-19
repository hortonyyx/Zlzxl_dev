# 设计 · MVP（上课模式 + 学习模式）

> 执行包文件之一。需求见 [requirements.md](requirements.md);
> 产品依据见 [concept.md](../../product/concept.md)、
> [architecture.md](../../product/architecture.md)、
> [prototype.html](../../product/prototype.html)。

## 概览

微信原生小程序 + **微信云开发**。MVP 覆盖两个模式:

- **上课线**:录音(前台连续 + 分段)→ 课后云函数流水线(转写 → 总结 →
  知识点提取归一化 → 脉络重写)→ 课堂总结节点。
- **学习线**:进库 → 算法出"今日到期清单" → AI 编排学习节点(测验 / 闪卡)
  → 复习回写掌握信号 → 状态与脉络更新。

知识点池 / 掌握信号 / 节点 / 脉络存云数据库,录音 / 资料存云存储;
LLM、ASR 密钥仅存云函数环境变量;登录用 openid。

**验证策略(关键)**:先 mock 工程跑通体验闭环。阶段 0 用手动文本输入
替代录音 / ASR、云流水线本地或人工触发,先验证"总结 → 脉络 delta →
测验 → 状态 → 复习 → 跨课记忆"的体验价值;之后再硬化录音 / ASR /
云流水线(见 tasks.md)。因此服务层需在 `cloud.ts` 之上留 mock 开关。

## 用户流程

**上课线**:库列表 → 进库(脉络)→ 开始上课(录音页,极简)→ 结束 →
处理进度页 → 课堂总结节点 → (可选)做课后测验 → 结果 → 回脉络看 delta。

**学习线**:库列表 → 进库(脉络)→ 顶部「今日学习」卡 → 学习节点(展示
AI 编排:排了哪些知识点、为什么)→ 逐个做模块(测验 / 闪卡)→ 结果
(信号回写、状态色更新)→ 回脉络看 delta。

## 架构

### 页面 `pages/`

| 页面 | 屏 | 说明 |
|---|---|---|
| `library-list/` | ① | 库列表 / 首页 |
| `library-create/` | ② | 新建库 · 多模态输入 |
| `library-detail/` | ③ | 库主页 = 脉络 + 今日学习入口 |
| `station-detail/` | ④ | 脉络单站详情 |
| `class-record/` | ⑤ | 上课录音页(极简) |
| `class-processing/` | ⑥ | 课后处理进度 |
| `node-summary/` | ⑦ | 课堂总结节点 |
| `study-node/` | ⑧ | 学习节点 · AI 编排视图 |
| `quiz-run/` | ⑨ | 模块 · 测验(两模式共用) |
| `flashcard-run/` | ⑩ | 模块 · 闪卡 |
| `node-result/` | ⑪ | 节点结果 → 脉络更新(通用) |

页面只负责渲染、交互、生命周期;不直接调 `wx.cloud`。

### 组件 `components/`

- `library-card` · `multimodal-input`(上传 / 拍照 / 文本)
- `mailuo-path`(生长路径)· `station-card` · `update-banner` · `sticky-note`
- `today-study-card`(到期清单入口)· `study-plan-view`(AI 编排展示)
- `recorder-control` · `summary-section` · `quiz-question` · `flashcard`
- `signal-row` · `state-empty` · `state-loading` · `state-error`

### 服务 `services/`

- `cloud.ts` — 云函数调用统一封装,**含 mock 开关**(阶段 0 用)
- `library.ts` — 库 CRUD、多模态资料上传
- `class-session.ts` — 上课会话:录音上传、处理状态轮询
- `study-session.ts` — 到期清单查询、学习节点编排与获取
- `mailuo.ts` — 学习脉络读取
- `knowledge.ts` — 知识点池、掌握信号、状态规则(见下文章节)
- `module.ts` — 测验 / 闪卡题目获取、作答提交、评分
- `correction.ts` — 记录类产物纠错反馈

### 状态 `stores/`

- `library-store` — 当前库、库列表缓存
- `session-store` — 进行中的上课 / 学习会话

### 工具 `utils/`

- `storage.ts`(已有)· `toast.ts`(已有)
- `recorder.ts` — 分段录音、断点续录、本地缓存分段

### 云函数 `cloudfunctions/`

- `submitClass` — 接收录音 fileID,建 ClassSession,提交 ASR 任务
- `advanceClass` — 推进课后流水线一步(转写 / 总结 / 提取归一化 / 脉络重写)
- `planStudy` — 算法出到期清单 + AI 编排成学习节点(modules 序列 + rationale)
- `gradeModule` — 评测验 / 闪卡作答,写 MasterySignal,更新知识点状态
- `submitCorrection` — 记录纠错反馈
- `seedDemo` — 初始化只读 demo 示例库(冷启动)

## 数据模型

云数据库 collection(字段示意,TS):

```ts
interface Library {
  _id: string; _openid: string;
  name: string; createdAt: number;
  mode: 'course' | 'self';     // 课程学习 / 自主学习;MVP 仅 'course'
  classCount: number;
  isDemo?: boolean;            // 只读 demo 库
}

// 知识点 = 一等实体,稳定 _id,掌握信号的锚点
interface KnowledgePoint {
  _id: string; libraryId: string;
  name: string; aliases: string[];     // 归一化收集的同义表达
  relatedIds: string[];                // 轻量双链(MVP 不分类型)
  firstSeenNodeId: string;
  status: 'green' | 'yellow' | 'gray';
  lastReviewedAt: number | null;       // 供到期规则
}

// 掌握信号 = 按知识点 ID 的时间序列
interface MasterySignal {
  _id: string;
  knowledgePointId: string;            // 锚点,稳定
  sourceNodeId: string;                // 来源节点
  sourceModule: 'quiz' | 'flashcard' | 'class-record';
  type: 'quiz-correct' | 'quiz-wrong'
      | 'flashcard-good' | 'flashcard-fail'
      | 'mark-question' | 'correction';
  value: number | null;                // 如评分 0–1;无则 null
  timestamp: number;
}

// 节点 = 一次会话
interface Node {
  _id: string; libraryId: string;
  type: 'class' | 'study';
  createdAt: number;
  // type === 'class'
  classIndex?: number;
  recordingFileIds?: string[];
  transcript?: string;
  summary?: { full: string; points: string[]; coreQuestions: string[] };
  markedQuestions?: { atMs: number; note?: string }[];
  // type === 'study'
  plan?: {
    rationale: string;                 // "为什么排这些"
    modules: { type: 'quiz' | 'flashcard'; knowledgePointIds: string[] }[];
  };
}

// 学习脉络 = 知识点池 + 状态的读取视图,逐课重写叙述
interface Mailuo {
  _id: string; libraryId: string; updatedAt: number;
  latestUpdateNote: string;            // 「本次更新」delta
  stations: {
    nodeId: string; classIndex: number; title: string;
    status: 'green' | 'yellow' | 'gray';
    knowledgePointIds: string[];
  }[];
  stickyNotes: { unresolved: string[]; observations: string[] };
}

// 上课会话 = 课后流水线的状态机,带幂等字段
interface ClassSession {
  _id: string; libraryId: string;
  status: 'transcribing' | 'summarizing' | 'extracting'
        | 'rewriting' | 'done' | 'failed';
  nodeId?: string; error?: string;
  steps: {                             // 每步幂等 / 重试契约
    name: string;
    jobId?: string;                    // 外部任务 ID(如 ASR)
    attempts: number;
    status: 'pending' | 'running' | 'done' | 'failed';
    updatedAt: number;
  }[];
  lockedUntil?: number;                // 执行锁,防并发重复推进
  updatedAt: number;
}
```

> 测验 / 闪卡题目**不落库**(练习类按需生成);落库的是 `MasterySignal`。

## 掌握信号与状态规则

> 由 Codex 审阅要求补充。这是状态体系的落地细节。

**信号产生**:每次模块运行,对涉及的每个知识点写一条 `MasterySignal`;
课中「标记疑问」写 `type: 'mark-question'`;用户纠错写 `type: 'correction'`。

**知识点状态(status)**,按其信号时间序列计算,优先级从高到低:

1. 存在未被后续解决的 `mark-question` → **黄**。
2. 最近一次 `quiz-wrong` / `flashcard-fail` 晚于最近一次"通过"信号 → **黄**。
3. 有"通过"信号(`quiz-correct` / `flashcard-good`)且无上述情况 → **绿**。
4. 无任何信号 → **灰**。

**到期规则(MVP 简单版)**:

- 黄 → 立即到期(需复习 / 需解疑)。
- 绿 → `lastReviewedAt + N 天` 到期(N 为固定常量,如 7)。
- 灰 → 不进到期清单。

**站点(station)状态汇总**:站点颜色 = 其下知识点状态的汇总——
有黄则黄,否则有灰则灰(未测完),全绿才绿。

> 完整 FSRS / 遗忘曲线替换上述"固定 N 天"为 v2。

## 异步流水线契约

> 由 Codex 审阅要求补充。

`advanceClass` 推进 `ClassSession` 一步,须保证幂等与可恢复:

- **幂等**:每步以 `steps[].name` + `ClassSession._id` 为幂等键;已 `done`
  的步骤重复调用直接返回,不重复调 ASR / LLM、不重复写节点 / 知识点 / 信号。
- **执行锁**:推进前检查 `lockedUntil`;持锁期间拒绝并发推进,锁带超时
  自动释放。
- **外部任务**:ASR 等异步任务的 ID 存 `steps[].jobId`,重入时凭 jobId
  查询结果而非重新提交。
- **重试**:失败步 `attempts += 1`,超过上限置 `status: 'failed'` 并记
  `error`;前端可触发重试。
- **驱动**:前端处理进度页轮询;`advanceClass` 由轮询或定时触发器推进下一步。

## API 契约

云函数调用(经 `services/cloud.ts`):

```ts
interface SubmitClassReq { libraryId: string; recordingFileIds: string[]; }
interface SubmitClassRes { sessionId: string; }

interface AdvanceClassReq { sessionId: string; }
interface AdvanceClassRes { status: ClassSession['status']; nodeId?: string; }

// 算法出到期清单 + AI 编排学习节点
interface PlanStudyReq { libraryId: string; }
interface PlanStudyRes { studyNodeId: string; plan: Node['plan']; }

// 评测验 / 闪卡作答
interface GradeModuleReq {
  studyNodeId: string;
  moduleType: 'quiz' | 'flashcard';
  answers: { knowledgePointId: string; payload: unknown }[];
}
interface GradeModuleRes {
  results: { knowledgePointId: string; pass: boolean; comment?: string }[];
}
```

## UI 状态

每个数据页都需覆盖:

- **加载中**:库列表、库主页、处理进度、学习节点编排。
- **空状态**:无库(库列表)、新库无脉络(库主页)、零历史 → demo 库引导、
  学习模式无到期项 → "暂无需复习"的正向空态。
- **错误状态**:录音上传、转写 / LLM 失败或超时、编排失败 → 提示 + 重试。
- **成功状态**:处理完成、模块完成。

## 风险

- **长录音**:小程序录音切后台 / 锁屏会中断 → `recorder.ts` 前台连续录制 +
  分段 + 断点续录 + 本地缓存,任一分段不丢;支持课后补录。
- **课后处理时长**:ASR + 多次 LLM 调用耗时长,云函数有时长上限 →
  异步流水线 + 幂等契约 + 状态轮询。
- **知识点归一化准确性**:LLM 判断可能误并 / 误分 → MVP 用 LLM,
  保留人工纠错;向量匹配为 v2。
- **脉络重写成本**:课次增多后重写 prompt 变长 → 重写只动叙述、不动
  知识点 ID;必要时压缩早期课次。
- **学习编排质量**:AI 编排的学习节点若与到期清单脱节,护城河失效 →
  编排须以算法到期清单为输入边界,AI 只在其内挑选排序。
- **成本**:ASR、LLM、云开发额度 → MVP 个人用途量小,先观测。

## 测试计划

- 单元测试:`recorder.ts` 分段、`knowledge.ts` 状态 / 到期规则、
  `cloud.ts` 封装与 mock 开关。
- 集成测试:课后流水线状态流转与幂等(可 mock 云函数);学习节点编排 →
  评分 → 信号回写闭环。
- 微信开发者工具:全 11 屏走查;mock 输入下的体验闭环。
- 真机:整节课(≥45 分钟)前台录音 + 中断 + 续录;录音上传与转写。
- 自动检查:`corepack pnpm run check`。

## 待确认问题

- ASR 服务商与接入方式;LLM 具体模型。
