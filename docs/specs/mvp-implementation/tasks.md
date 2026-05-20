# 任务 · 上课模式最小闭环 MVP

> 一次只推进一个任务组。每组完成后检查 + 微信开发者工具走查 + 交叉审阅。

## 阶段 A · MVP 口径调整

目标：把执行包从“学习脉络 + 学习模式闭环”调整为“真实上课模式闭环”。

- [x] 更新 `requirements.md`。
- [x] 更新 `design.md`。
- [x] 更新 `tasks.md`。
- [x] 同步 `docs/ai/NEXT_WINDOW.md` 和 `docs/ai/session-notes.md`。

验证：

- 文档审阅通过即可；不需要运行代码检查。

## 阶段 B · 数据模型与服务契约收敛

目标：把现有 mock 领域模型收敛到“课堂记录 / 课堂输出 / 测验”。

- [x] 梳理现有 `types/learning.ts`，补齐或调整课堂链路类型。
- [x] 调整 `services/library.ts`：新建库只保留课程学习 + 库名。
- [x] 调整 `services/class-session.ts`：创建课堂、提交录音、轮询处理、读取课堂节点。
- [x] 调整 `services/module.ts` 或新增 `services/quiz.ts`：问答测验读取和提交。
- [x] mock store 支持多节课堂记录，但不要求学习脉络更新。
- [x] 页面主路径不再依赖今日学习 / 到期清单。

验证：

- `corepack pnpm run check`
- mock 下能从库进入一节课详情，并拿到总结与测验数据。

## 阶段 C · 页面主路径调整

目标：按新 MVP 改造现有页面，不新增复杂页面体系。

- [x] `library-list`：保留库列表和新建入口。
- [x] `library-create`：资料上传隐藏或置灰；创建后进入空库。
- [x] `library-detail`：空库态 / 课程记录列表 / 开始上课；移除今日学习主入口。
- [x] `station-detail`：改为单节课详情。
- [x] `node-summary`：展示课堂输出，开始本节课测验。
- [x] `quiz-run`：只保留问答测验；支持文字答题的 UI 状态。
- [x] 暂时弱化或隐藏 `study-node`、`flashcard-run`、脉络结果语义。

验证：

- `corepack pnpm run check`
- 微信开发者工具走通：新建库 → 空库 → mock 课堂输出 → 测验。

## 阶段 C.5 · 旧学习模式入口封存

目标：防止旧的学习模式页面被 URL 直达后显示过期语义。

- [x] `study-node` 进入后提示“学习模式暂不开放”，返回库主页。
- [x] `flashcard-run` 进入后提示“闪卡暂不开放”，返回库主页。
- [x] `node-result` 不再作为脉络更新结果页使用，进入后返回库主页。
- [x] 旧 service API 保留给编译兼容，但不再作为主路径入口。

验证：

- `corepack pnpm run check`
- 手动访问旧页面不会展示今日学习 / 闪卡 / 脉络更新旧流程。

## 阶段 D1 · 10 分钟录音基础

目标：先把课堂录音本地能力跑通，不接云上传。

- [x] 新增或调整 `utils/recorder.ts`，封装课堂录音。
- [x] 明确录音配置：优先 `mp3`、约 16 kHz、语音质量；最终以 ASR 兼容格式为准。
- [x] `class-record` 支持录音授权、开始、计时、停止。
- [x] 录音最长 10 分钟；到时自动停止。
- [x] 录音结束后得到本地临时文件路径。
- [x] 保留手动文本 fallback，便于开发和失败兜底。

验证：

- `corepack pnpm run check`
- 真机录制 1 分钟和 10 分钟各一次。
- 拒绝授权、停止录音、录音失败都有可理解状态。

## 阶段 D1.1 · Claude 审阅阻塞修复

目标：修复 D1 审阅发现的录音可靠性阻塞项，修完后再进入 D2。

- [ ] 修复 10 分钟到点双停竞争：避免 wx 自动 stop 与 JS timer 主动 stop 同时触发导致丢文件。
- [ ] 录音中途 `onError` / `onInterruptionBegin` 能同步到页面状态，停止计时并提示用户。
- [ ] 麦克风权限曾被拒绝时走 `wx.openSetting` 恢复路径。
- [ ] 录音占位提交与手动文本 fallback 分离；`transcriptFallback` 只服务手动文本。
- [ ] 录音占位提交能保留本地录音信息，至少在 mock 总结 / 日志中可见。
- [ ] `class-record` 进度百分比不在 WXML 写死 `600000`。
- [ ] `recordTimer` / `recordStartedAt` 不使用模块作用域共享状态。

验证：

- `corepack pnpm run check`
- 真机 10 分钟自动停止后能保留本地文件信息。
- 录音中断 / 系统错误后页面不再停留在“录音中”。
- 拒绝麦克风权限后再次点击能引导打开设置。
- 录音占位提交和手动文本提交在 mock 文案上可区分。

## 阶段 D2.1 · 云环境与上传 service

目标：先建立云存储上传能力，不改页面主流程。

- [ ] 配置微信云开发环境 ID。
- [ ] 封装上传 service，不在页面直接散落 `wx.cloud.uploadFile`。
- [ ] 文件路径建议：`class-recordings/{libraryId}/{timestamp}.mp3`。
- [ ] 上传 service 返回 `recordingFileId` 和基础元信息。

验证：

- `corepack pnpm run check`
- 使用本地临时录音文件调用上传 service 可得到云存储 fileID。

## 阶段 D2.2 · 录音页上传 UI

目标：把本地录音文件上传到微信云存储，得到 `recordingFileId`。

- [ ] 录音结束后上传到微信云存储。
- [ ] 上传中显示进度或明确 loading。
- [ ] 上传成功后显示 fileID / 上传完成状态。
- [ ] 上传失败支持重试或回到手动文本 fallback。

验证：

- `corepack pnpm run check`
- 真机录制后上传成功，能拿到云存储 fileID。
- 上传失败状态可恢复。

## 阶段 D2.3 · 上传后课堂提交

目标：把 `recordingFileId` 接回课堂 session，仍可先走 mock 处理。

- [ ] `submitClass` 接收 `libraryId` + `recordingFileId`。
- [ ] 本地临时文件上传成功后不再直接作为长期数据使用。
- [ ] `class-processing` 能从上传成功进入处理页。
- [ ] mock 下可用 `recordingFileId` 生成课堂总结和本节课测验。
- [ ] `transcriptFallback` 只服务手动 textarea，录音路径不复用该字段。
- [ ] 记录 ASR 阶段需要的输入契约：`recordingFileId` → 临时下载 URL / ASR 任务。

验证：

- `corepack pnpm run check`
- 录音 → 上传 → mock 课堂总结 → 本节课测验可走通。

## 阶段 E · 云开发处理流水线

目标：把录音变成真实课堂输出。

- [ ] 配置微信云开发环境。
- [ ] 新增 `submitClass` 云函数。
- [ ] 新增 `advanceClass` 云函数，推进 ASR → 总结 → 测验生成。
- [ ] 密钥放云函数环境变量。
- [ ] `class-processing` 轮询处理状态，完成后进入 `node-summary`。
- [ ] 处理失败支持重试。

验证：

- `corepack pnpm run check`
- 一段真实录音能得到转写、总结和 3 道测验题。
- 重复轮询不产生重复课堂节点。

## 阶段 F · 测验文字答题

目标：先跑通最小测验闭环。

- [ ] `quiz-run` 展示本节课生成的问答题。
- [ ] 用户输入文字答案。
- [ ] 调用 `gradeQuizAnswer` 得到点评 / 判分。
- [ ] 支持下一题、完成态、返回本节课详情。

验证：

- `corepack pnpm run check`
- 3 道题完整答完并展示点评。

## 阶段 G · 测验语音答题

目标：实现产品“语音优先”的测验回答方式。

- [ ] 复用 `utils/recorder.ts` 支持短语音答题。
- [ ] 语音答案最长 60 秒。
- [ ] 上传短语音并转写为文字。
- [ ] 转写文本进入 `gradeQuizAnswer`。
- [ ] 转写失败时允许切换文字答题。

验证：

- `corepack pnpm run check`
- 真机语音答题至少完成一题。
- 语音失败后文字 fallback 可用。

## 阶段 H · 收尾与试用闸门

目标：让课程学习模式可以小范围真实试用。

- [ ] 全主路径补 loading、empty、error、success 状态。
- [ ] 整理课堂输出 prompt 与测验 prompt。
- [ ] 根据真实测试音频调整 ASR / LLM 错误处理。
- [ ] 更新 `NEXT_WINDOW.md` 与 `session-notes.md`。
- [ ] 里程碑审阅：GPT-5.5 与 Opus 分别独立审阅。

验证：

- 新建库 → 录音 → 转写 → 总结 → 测验文字 / 语音答题 全链路通过。
- 微信开发者工具 + 真机主路径走查通过。

## 每次交接模板

执行 Agent 完成一个任务组后，按此格式交接：

```md
## 目标

## 当前状态

## 当前模块

## 涉及文件

## 约束

## 验证

## 审阅请求
```
