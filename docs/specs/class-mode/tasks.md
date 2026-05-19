# 任务 · MVP（上课模式 + 学习模式）

> 执行顺序。**一次只推进一个阶段**,完成后跑检查 + 交叉审阅再进下一阶段。
> 需求见 [requirements.md](requirements.md),设计见 [design.md](design.md)。
>
> 排序原则(Codex 审阅):**先用 mock 工程跑通体验闭环、验证产品价值,
> 再硬化录音 / ASR / 云流水线**。阶段 0 是 GO / NO-GO 闸门。

## 阶段 0 · 体验闭环（mock 服务,验证产品价值)

目标:用真实 UI + mock 后端,让真人走通完整循环,判断"脉络和记忆"
是否真的打动人。录音 / ASR 用**手动文本输入**替代,数据走本地 / mock。

- [ ] 服务层接口先行 + `cloud.ts` mock 开关
  - 文件:`services/cloud.ts`、`services/*`(定义接口 + mock 实现)、`types/`
- [ ] 核心页面(接 mock 数据)
  - 文件:`pages/library-list/`、`library-detail/`、`node-summary/`、
    `study-node/`、`quiz-run/`、`flashcard-run/`、`node-result/`、
    `station-detail/`;`手动输入课堂内容` 临时入口;相关 `components/`
- [ ] mock 数据下走通完整闭环:输入课堂内容 → 课堂总结 → 知识点入池 →
      脉络 delta → 今日学习 → 学习节点 → 测验 / 闪卡 → 信号 → 状态 →
      脉络 delta
  - 验证:`corepack pnpm run check` 通过
- [ ] **GO / NO-GO 闸门**:找真人(或自己)走一遍闭环,判断"总结 →
      脉络长大 → 复习 → 跨课记忆"是否有感觉。**不成立就停下改产品,
      不进阶段 1。**

## 阶段 1 · 接入微信云开发

- [ ] 启用云开发环境,六个 collection 初始化,LLM / ASR 密钥入云函数环境变量
  - 文件:`project.config.json`、`cloudfunctions/`
- [ ] `cloud.ts` mock 开关切真;mock 数据结构迁到云数据库
  - 验证:阶段 0 的核心闭环跑在真云数据库上;`pnpm run check` 通过

## 阶段 2 · 真·新建库与上课录音

- [ ] 多模态新建库页(库名 + 上传 / 拍照 / 粘贴文本)
  - 文件:`pages/library-create/`、`components/multimodal-input/`、
    `services/library.ts`
- [ ] 分段录音封装 + 极简录音页
  - 文件:`utils/recorder.ts`、`pages/class-record/`、
    `components/recorder-control/`
  - 验证:前台连续录 ≥45 分钟;切后台 / 锁屏 / 来电后已存分段不丢,
    明确提示续录 / 课后补录

## 阶段 3 · 真·课后处理流水线

- [ ] `submitClass` + `advanceClass` 云函数(转写 / 总结 / 提取归一化 /
      脉络重写),实现幂等 / 执行锁 / 重试契约(见 design.md)
  - 文件:`cloudfunctions/submitClass/`、`advanceClass/`
- [ ] 课后处理进度页(轮询 ClassSession.status)
  - 文件:`pages/class-processing/`、`services/class-session.ts`
- [ ] `planStudy` / `gradeModule` 云函数接真 LLM
  - 文件:`cloudfunctions/planStudy/`、`gradeModule/`、
    `services/study-session.ts`、`module.ts`
  - 验证:一次真录音跑通流水线;重复推进 / 超时不产生重复数据;
    学习编排与评分走真 LLM

## 阶段 4 · 冷启动与收尾

- [ ] `seedDemo` 只读示例库 + 空库"脉络会长大"引导
  - 文件:`cloudfunctions/seedDemo/`、空状态组件
- [ ] 全页空 / 加载 / 错误状态;录音 / 上传 / 转写失败重试
- [ ] 端到端真机走查;开始观察产品验证指标
  - 验证:requirements.md 全部验收(含**记忆证据核心验收**、冷启动验收)通过

## 审阅闸门

每个阶段完成后:

- [ ] 运行 `corepack pnpm run check`。
- [ ] 在微信开发者工具中测试本阶段流程。
- [ ] 列出真机检查项(尤其录音相关阶段)。
- [ ] 由另一个模型家族交叉审阅(Claude 实现 → Codex / GPT 审,反之亦然)。
- [ ] 如决策变化,更新 `docs/ai/session-notes.md`。
