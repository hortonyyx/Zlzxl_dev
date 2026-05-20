# 设计 · 上课模式最小闭环 MVP

> 本文是当前实现依据。旧的 `class-mode` 执行包仍可作为产品长期方向参考，
> 但本轮编码以本目录的总控包为准。

## 落地策略

采用“真实上课链路优先，长期学习能力后置”的策略：

- 第一阶段先跑通一节课：录音、转写、课堂输出、测验。
- 学习脉络、今日学习、跨课复习、状态色等能力暂不接入验收。
- 服务层仍保留 mock / cloud 开关，便于在云配置未就绪时继续开发 UI。

## 页面与职责

页面只负责渲染、用户交互和生命周期，不直接调用 `wx.request`、`wx.cloud`、
storage。

| 页面 | 本轮职责 |
|---|---|
| `library-list` | 展示课程学习库，进入库，新建库 |
| `library-create` | 课程学习 + 库名；资料上传暂不做 |
| `library-detail` | 空库态 / 课程记录列表 / 开始上课 |
| `class-record` | 10 分钟录音、结束课、提交处理 |
| `class-processing` | 轮询课堂处理状态 |
| `node-summary` | 展示课堂输出、转写入口、开始测验 |
| `station-detail` | 单节课详情，复用“站点详情”入口语义 |
| `quiz-run` | 问答题；文字答题 + 语音答题 |

暂时保留但不作为本轮主路径：

- `study-node`
- `flashcard-run`
- `node-result`

## 服务层

建议服务边界：

- `services/cloud.ts`：统一 `callCloud`，保留 mock / cloud 开关。
- `services/library.ts`：库列表、新建库、读取库详情。
- `services/class-session.ts`：创建课堂、提交录音、轮询处理状态、读取课堂节点。
- `services/quiz.ts` 或 `services/module.ts`：读取测验、提交文字 / 语音答案。
- `utils/recorder.ts`：课堂录音与短语音答题录音封装。
- `utils/storage.ts` / `utils/toast.ts`：继续承接平台封装。

页面不得直接散落 `wx.getRecorderManager`、`wx.cloud.uploadFile`、storage 等调用；
如确需平台 API，先封装到 `utils/` 或 `services/`。

## 数据模型

类型放在 `Zlzl_miniprogram/types/learning.ts` 或拆出更准确的课堂类型文件。
本轮最小字段如下：

```ts
interface Library {
  _id: string;
  name: string;
  mode: 'course';
  createdAt: number;
  classCount: number;
}

interface ClassSession {
  _id: string;
  libraryId: string;
  status: 'recording-uploaded' | 'transcribing' | 'summarizing' |
    'generating-quiz' | 'done' | 'failed';
  recordingFileId?: string;
  nodeId?: string;
  error?: string;
  updatedAt: number;
}

interface ClassNode {
  _id: string;
  libraryId: string;
  classIndex: number;
  title: string;
  createdAt: number;
  recordingFileId?: string;
  transcript?: string;
  summary?: ClassSummary;
  quiz?: QuizQuestion[];
  quizState: 'not-started' | 'in-progress' | 'done';
}

interface ClassSummary {
  full: string;
  keyPoints: string[];
  coreQuestions: string[];
}

interface QuizQuestion {
  _id: string;
  stem: string;
  referenceAnswer: string;
  gradingRubric?: string;
}

interface QuizAnswer {
  questionId: string;
  mode: 'text' | 'voice';
  text: string;
  voiceFileId?: string;
  passed?: boolean;
  score?: number;
  feedback?: string;
}
```

## 云函数

第一版云函数可以保持少而清楚：

- `submitClass`
  - 输入：`libraryId`、`recordingFileId`。
  - 输出：`sessionId`。
  - 行为：创建 `ClassSession`，准备处理。

- `advanceClass`
  - 输入：`sessionId`。
  - 输出：`status`、完成时返回 `nodeId`。
  - 行为：推进转写、总结、测验生成。
  - 要求：幂等；重复调用不能重复创建课堂节点。
  - E 阶段输入契约：
    1. 从 `ClassSession.recordingFileId` 读取微信云存储 fileID。
    2. 云函数内调用 `cloud.getTempFileURL({ fileList: [recordingFileId] })` 得到临时下载 URL。
    3. 将临时下载 URL 传给 ASR 服务，得到课堂 `transcript`。
    4. 将 `transcript` 传给 LLM，生成 `ClassSummary` 和 3 道 `QuizQuestion`。
    5. 写入 class node，并把 session 状态置为 `done`。
  - 密钥和模型配置只从云函数环境变量读取：`ASR_*`、`LLM_*`。

- `gradeQuizAnswer`
  - 输入：`nodeId`、`questionId`、`answerText`。
  - 输出：`score`、`passed`、`feedback`。
  - 行为：用 LLM 点评 / 判分。

- `transcribeVoiceAnswer`（可选）
  - 输入：短语音 `fileID`。
  - 输出：文字。
  - 若 ASR 封装统一，也可并入 `gradeQuizAnswer` 前的 service 流程。

## 处理流水线

`class-processing` 轮询 `advanceClass` 或轮询 `getClassSession`：

1. 上传录音完成。
2. 转写课堂录音。
3. 生成课堂输出。
4. 生成课后测验。
5. 完成后进入 `node-summary`。

失败时进入错误态，提供“重试处理”和“返回课堂记录”。

## 录音策略

课堂录音：

- 第一版最长 10 分钟。
- 优先前台录音。
- 可先单段录音，不做 45 分钟分段续录。
- 到达 10 分钟自动停止并提示提交。
- 初始格式优先使用微信录音常见配置：`mp3`、约 16 kHz、单声道语音质量；
  若目标 ASR 服务要求不同，以 ASR 兼容格式为准。
- 文件命名建议：`class-recordings/{libraryId}/{sessionId或timestamp}.mp3`。
- `recordingFileId` 指云存储永久文件 ID；本地临时文件只在上传前使用。
- 10 分钟版本先使用微信云存储单文件上传；如真机文件大小或网络失败率不可接受，
  再升级分段 / 断点续传。
- 上传 UI 至少要有：上传中、失败重试、取消返回。
- 真机验证必须覆盖：授权、开始、停止、上传、拒绝授权、录音失败。

语音答题：

- 短录音，建议最长 60 秒。
- 上传后转写为文字。
- 转写失败时允许用户改用文字回答。

## Mock 兜底

在云环境 / ASR / LLM 未配置前，mock 路径应支持：

- 手动输入课堂文本替代录音转写。
- 固定或确定性生成课堂输出。
- 固定或确定性生成 3 道测验题。
- 文字答案用简单规则或 mock 点评返回。

mock 只用于开发兜底，不作为本轮最终验收替代。
`transcriptFallback` 仅表示开发 / 失败兜底的手动课堂文本，不代表课程资料上传。

## 风险

- 微信录音格式与 ASR 服务兼容性需尽早实测。
- 云函数处理长任务可能受时长限制，`advanceClass` 需要可重入。
- 密钥必须只放云函数环境变量。
- 语音答题转写失败不能阻断测验，必须能切回文字。
- 旧页面中学习脉络 / 今日学习入口较多，调整时要避免留下误导主路径。

## 验证

自动：

```bash
corepack pnpm run check
```

微信开发者工具：

- 库列表 → 新建库 → 空库 → 上第一节课。
- 录音 → 上传 → 处理页 → 总结页。
- 总结页 → 开始测验 → 文字答题 → 点评。

真机：

- 10 分钟课堂录音。
- 录音授权拒绝 / 重新授权。
- 语音答题短录音。
- 网络失败或处理失败后的重试体验。
