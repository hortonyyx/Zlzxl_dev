# 2026-05-20 Claude 审阅请求 · 上课模式最小闭环

## 元信息

- 日期：2026-05-20
- 审阅对象：MVP 范围调整后的执行包与已执行阶段 A/B/C/C.5/D1
- 期望审阅方：Claude / Opus 家族
- 请求方：Codex
- 审阅立场：代码审阅 + 执行包审阅，优先找 bug、范围漂移、架构边界问题和遗漏验证项

## 背景

MVP 已从旧的“学习脉络 + 今日学习 + 长期复习闭环”调整为“上课模式最小闭环”。

当前目标链路：

```text
创建课程学习库 → 开始上课 → 录音(先 10 分钟) → 上传录音 →
ASR 转写 → LLM 生成课堂输出 → 生成课后测验 →
用户文字 / 语音答题 → LLM 点评 / 判分
```

暂不做：

- 学习脉络重写、今日学习、到期复习、跨课记忆、状态色。
- 闪卡、学习节点编排、脉络更新结果页。
- 资料上传、45 分钟长录音、复杂分段续录。

## 请先读

执行包：

- `docs/specs/mvp-implementation/requirements.md`
- `docs/specs/mvp-implementation/design.md`
- `docs/specs/mvp-implementation/tasks.md`

当前上下文：

- `docs/ai/NEXT_WINDOW.md`
- `docs/ai/session-notes.md` 末尾最近 checkpoint
- `docs/reviews/2026-05-20_mvp-scope-deepseek_review.md`

关键代码：

- `Zlzl_miniprogram/types/learning.ts`
- `Zlzl_miniprogram/services/class-session.ts`
- `Zlzl_miniprogram/services/module.ts`
- `Zlzl_miniprogram/services/node.ts`
- `Zlzl_miniprogram/pages/library-detail/`
- `Zlzl_miniprogram/pages/class-record/`
- `Zlzl_miniprogram/pages/node-summary/`
- `Zlzl_miniprogram/pages/quiz-run/`
- `Zlzl_miniprogram/pages/study-node/`
- `Zlzl_miniprogram/pages/flashcard-run/`
- `Zlzl_miniprogram/pages/node-result/`
- `Zlzl_miniprogram/utils/recorder.ts`

## 已执行阶段

### 阶段 A · MVP 口径调整

- `mvp-implementation` 执行包已改为上课模式最小闭环。
- `NEXT_WINDOW.md`、`session-notes.md` 已同步。

### 阶段 B · 数据模型与服务契约收敛

- `LearningNode` 可携带 `title`、`recordingFileId`、`quiz`、`quizState`。
- `ClassSessionStatus` 增加 `recording-uploaded`、`generating-quiz`。
- 新增 `QuizAnswer`、`QuizGradingResult` 等测验答题类型。
- `submitClass` 支持 `recordingFileId` 和 `transcriptFallback`。
- mock 课堂节点现在自带 summary、transcript、quiz。
- 新增 `getClassQuizQuestions`、`gradeQuizAnswer`、`getQuizAnswers`。
- 新增 `listClassNodes`。

### 阶段 C · 页面主路径调整

- `library-create`：资料上传改为暂不开放提示。
- `library-detail`：改成课程记录列表 + 开始上课。
- `station-detail`：改成单节课详情。
- `node-summary`：开始测验直接进入本节课 quiz，不再调用 `planStudy`。
- `quiz-run`：按 `nodeId` 获取本节课问答题，文字提交后展示 mock 点评。

### 阶段 C.5 · 旧学习模式入口封存

- `study-node`、`flashcard-run`、`node-result` 进入后提示暂不开放并返回库主页。
- 三个旧页面的静态标题 / WXML 已改成暂不开放。

### 阶段 D1 · 10 分钟录音基础

- 新增 `utils/recorder.ts`，集中封装 `wx.getRecorderManager`。
- `class-record` 支持录音授权、开始、计时、停止、10 分钟自动停止。
- 录音结束后展示本地临时文件路径、时长、大小。
- “用录音进入 mock 处理”使用 `transcriptFallback` 进入现有 mock 总结 / 测验流程。
- 手动文本 fallback 保留。
- `app.json` 增加 `scope.record` 权限说明。
- `sitemap.json` 修复为包含 `rules` 字段，解决真机调试 `Invalid SiteMap`。

## 当前验证

- 用户已在微信开发者工具走通阶段 A/B/C mock 主路径。
- `corepack pnpm run check` 通过。
- `app.json` JSON 格式校验通过。
- 录音相关 `wx.*` API 搜索结果只出现在 `utils/recorder.ts` 和 `app.json`。

## 请重点审阅

1. 执行包是否和当前代码一致，阶段 D1/D2/D3 拆分是否足够清楚。
2. 页面是否仍残留旧“今日学习 / 学习脉络 / 闪卡”主路径语义。
3. `utils/recorder.ts` 是否符合微信小程序录音 API 使用方式，是否有生命周期 / 竞态风险。
4. `class-record` 的 D1 行为是否合理：本地录音 → mock 处理，手动文本 fallback。
5. `transcriptFallback` 是否足够清楚地限定为开发 / 失败兜底，而非资料上传。
6. 下一步 D2 云存储上传前还有哪些必须补的前置约束。

## 期望输出格式

请按代码审阅格式输出：

1. Findings：按严重程度排序，带文件路径和行号。
2. Open Questions：需要用户 / 产品确认的问题。
3. Test Gaps：还缺哪些微信开发者工具或真机验证。
4. Verdict：是否可以进入 D2。
