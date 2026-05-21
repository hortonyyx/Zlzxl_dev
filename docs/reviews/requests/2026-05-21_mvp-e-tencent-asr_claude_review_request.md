# 2026-05-21 MVP 阶段 E 腾讯云 ASR 接入审阅请求

## 元信息

- 日期：2026-05-21
- 审阅对象：`submitClass` / `advanceClass` 云函数腾讯云 ASR 接入
- 期望审阅方：Claude / Opus 家族
- 请求方：Codex
- 审阅立场：代码审阅，优先找 bug、云函数运行风险、签名错误、状态机问题和密钥边界问题

## 背景

用户已在 `advanceClass` 云函数环境变量里配置腾讯云 ASR 凭据。本轮目标是先跑通真实 ASR：

`recordingFileId -> cloud.getTempFileURL -> 腾讯云 CreateRecTask -> DescribeTaskStatus -> transcript`

LLM 总结 / 测验生成尚未配置，不在本轮范围。ASR 成功后，当前实现会保存 transcript，并返回 LLM 未配置的失败态，避免假装完成总结和测验。

## 请先读

- `docs/ai/START_HERE.md`
- `docs/ai/NEXT_WINDOW.md`
- `docs/specs/mvp-implementation/design.md`
- `docs/specs/mvp-implementation/tasks.md`
- `cloudfunctions/README.md`
- `cloudfunctions/submitClass/index.js`
- `cloudfunctions/advanceClass/index.js`

## 本轮已改

- `submitClass`
  - 从返回占位 session 改为写入 `classSessions` 集合。
  - 保存 `libraryId`、`recordingFileId`、`status`、`steps`、`createdAt`、`updatedAt`。
- `advanceClass`
  - 按 `sessionId` 读取 `classSessions`。
  - 使用 `cloud.getTempFileURL()` 解析微信云存储 fileID。
  - 使用 Node 内置 `crypto` / `https` 实现腾讯云 API 3.0 TC3 签名和请求。
  - 调用 `CreateRecTask` 创建录音文件识别任务。
  - 后续轮询调用 `DescribeTaskStatus`。
  - ASR 成功后将 `transcript`、`audioDuration` 写回 session。
  - LLM 未配置时明确返回失败态，不生成假总结。
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
- `submitClass` 是否能成功写入 `classSessions` 集合。
- `advanceClass` 是否能用微信云存储临时 URL 创建 ASR 任务。
- 腾讯云 ASR 轮询成功后的 transcript 写回。
- 小程序端仍处于 mock cloud 开关，真实云函数尚未接入主路径。

## 请重点审阅

- TC3 签名实现是否符合腾讯云 API 3.0 要求。
- `Content-Type`、canonical headers、region、service、action/version 是否正确。
- `classSessions` 状态机是否会卡死、重复提交 ASR task 或覆盖重要字段。
- 缺少 session、缺少 fileID、ASR API 错误、临时 URL 失败时的错误处理是否合理。
- ASR 成功但 LLM 未配置时返回 failed 是否会误导后续 UI 或测试。
- 是否有密钥进入代码、日志、返回值或文档。

## 期望输出

请将审阅结果归档到：

`docs/reviews/results/2026-05-21_mvp-e-tencent-asr_claude_review.md`

结果文件请包含 Findings、Open Questions、Test Gaps、Verdict 和处置摘要，并同步更新 `docs/reviews/README.md`。
