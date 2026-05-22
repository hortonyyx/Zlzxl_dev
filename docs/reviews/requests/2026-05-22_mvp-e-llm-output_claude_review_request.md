# 2026-05-22 MVP 阶段 E LLM 课堂输出接入审阅请求

## 元信息

- 日期：2026-05-22
- 审阅对象：`advanceClass` 云函数 LLM 总结 / 测验生成接入
- 期望审阅方：Claude / Opus 家族
- 请求方：Codex
- 审阅立场：代码审阅，优先找 bug、云函数运行风险、状态机问题、幂等问题、密钥边界和 JSON 解析风险

## 背景

上一轮腾讯云 ASR 已跑通到：

`recordingFileId -> cloud.getTempFileURL -> 腾讯云 CreateRecTask -> DescribeTaskStatus -> transcript`

ASR 审阅阻塞项已经处置：失败显式重试、创建 ASR task 前抢占 session、
ASR 成功后进入 `transcribed`。本轮继续阶段 E，把已保存的 transcript
接到 LLM，生成课堂总结和 3 道问答测验。

小程序 service 当前仍默认走 mock，本轮真实链路主要通过云开发控制台验证。

## 请先读

- `docs/ai/START_HERE.md`
- `docs/ai/NEXT_WINDOW.md`
- `docs/specs/mvp-implementation/design.md`
- `docs/specs/mvp-implementation/tasks.md`
- `docs/reviews/results/2026-05-21_mvp-e-tencent-asr_claude_review.md`
- `cloudfunctions/README.md`
- `cloudfunctions/advanceClass/index.js`

## 本轮已改

- `advanceClass`
  - 在 `transcribed` / `summarizing` / `generating-quiz` 状态下推进 LLM 生成。
  - LLM 未配置时继续返回 `transcribed`，不伪装成失败。
  - 读取 `LLM_PROVIDER`、`LLM_API_KEY`、`LLM_API_BASE_URL` / `LLM_BASE_URL`、`LLM_MODEL`。
  - 使用 OpenAI-compatible `/chat/completions` 生成 JSON。
  - 解析并归一化 `summary.full`、`summary.keyPoints`、`summary.coreQuestions` 和 3 道 `quiz`。
  - 将课堂节点写入 `learningNodes` 集合，包含 `sourceSessionId`、`libraryId`、`type=class`、`classIndex`、`recordingFileId`、`transcript`、`summary`、`quiz`。
  - 用 `sourceSessionId` 查询已有节点，降低重复轮询造成重复课堂节点的风险。
  - LLM 失败后，如果 session 已有 transcript，`retry: true` 会回到 `transcribed` 继续重试 LLM，不重新跑 ASR。
- 文档同步：
  - `cloudfunctions/README.md`
  - `docs/specs/mvp-implementation/tasks.md`
  - `docs/ai/session-notes.md`
  - `docs/ai/NEXT_WINDOW.md`
  - `docs/reviews/README.md`

## 已验证

- `node --check cloudfunctions/advanceClass/index.js`
- `node --check cloudfunctions/submitClass/index.js`
- `corepack pnpm run check`

## 未验证

- 云端重新部署后的真实运行。
- 配置 LLM 环境变量后，用有声 10-30 秒录音得到 transcript、summary 和 3 道 quiz。
- LLM 返回非 JSON / 超时 / API key 错误时，session 是否进入可理解失败态。
- `retry: true` 是否能从已有 transcript 重试 LLM，且不重新创建腾讯云 ASR task。
- 同一个 `sessionId` 快速重复调用 `advanceClass` 是否只创建一个 `learningNodes` 节点。
- 小程序真实 cloud 模式尚未接入 `getLearningNode` / `listClassNodes` 等读取云函数。

## 请重点审阅

- LLM 配置检测是否会误伤 ASR 阶段，或在未配置时造成错误状态。
- `summarizing` 锁与 `sourceSessionId` 幂等是否足以避免重复生成 / 重复节点。
- `retry: true` 对 ASR 失败和 LLM 失败的分流是否合理。
- OpenAI-compatible 请求实现是否有超时、错误解析、密钥泄漏或不兼容风险。
- LLM JSON 提取和 fallback 是否会掩盖严重格式错误。
- `learningNodes` 集合字段是否和小程序类型 / 后续读取函数兼容。
- 空 transcript、有声 transcript、LLM 返回空内容等边界是否处理合理。

## 期望输出

请将审阅结果归档到：

`docs/reviews/results/2026-05-22_mvp-e-llm-output_claude_review.md`

结果文件请包含 Findings、Open Questions、Test Gaps、Verdict 和处置摘要，并同步更新 `docs/reviews/README.md`。
