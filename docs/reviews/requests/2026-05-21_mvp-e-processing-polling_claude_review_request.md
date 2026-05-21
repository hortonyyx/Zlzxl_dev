# 2026-05-21 MVP 阶段 E 处理页轮询审阅请求

## 元信息

- 日期：2026-05-21
- 审阅对象：阶段 E 中 `class-processing` 轮询、失败重试和返回入口
- 期望审阅方：Claude / Opus 家族
- 请求方：Codex
- 审阅立场：代码审阅，优先找 bug、回归风险、范围漂移和缺失验证

## 背景

当前 MVP 已完成录音、上传、mock 课堂总结和测验主路径。阶段 E 前置云函数骨架已经存在，但真实 ASR / LLM 服务商和密钥尚未配置。

本轮只推进不依赖密钥的页面机制：处理页可以持续推进课堂处理状态，失败后可重试或返回课程记录。真实 ASR / LLM 接入、云函数持久化和 provider SDK 不在本轮范围。

## 请先读

- `docs/ai/START_HERE.md`
- `docs/ai/NEXT_WINDOW.md`
- `docs/specs/mvp-implementation/tasks.md`
- `docs/specs/mvp-implementation/design.md`
- `Zlzl_miniprogram/pages/class-processing/index.ts`
- `Zlzl_miniprogram/pages/class-processing/index.wxml`
- `Zlzl_miniprogram/pages/class-processing/index.wxss`
- `Zlzl_miniprogram/services/class-session.ts`

## 本轮已改

- `class-processing` 从单次调用 `advanceClass` 改为未完成时 1.5 秒后继续轮询。
- 页面卸载时清理轮询 timer。
- 缺少 `sessionId` 时进入失败态。
- `advanceClass` 返回 `failed` 或抛错时显示错误文案。
- 失败态提供“重试处理”和“返回课程记录”。
- 查看总结前检查 `nodeId`，避免跳转空总结页。
- 同步更新：
  - `docs/specs/mvp-implementation/tasks.md`
  - `docs/ai/session-notes.md`
  - `docs/ai/NEXT_WINDOW.md`
  - `docs/reviews/README.md`

## 已验证

- `corepack pnpm run check` 通过。

## 未验证

- 微信开发者工具中 mock 主路径：录音 / 文本 fallback → 处理页 → 总结页。
- 真实云函数失败态和重试路径。
- 真实 ASR / LLM 完成态；服务商和环境变量尚未配置。

## 请重点审阅

- 轮询 timer 是否可能泄漏、重入或在离开页面后继续触发。
- mock 下立即 done 是否仍能正常进入总结页。
- 失败态重试是否会留下 stale `done` / `nodeId` 状态。
- 返回课程记录的路由参数是否正确。
- 本轮是否过度声称完成了真实阶段 E。

## 期望输出

请将审阅结果归档到：

`docs/reviews/results/2026-05-21_mvp-e-processing-polling_claude_review.md`

结果文件请包含 Findings、Open Questions、Test Gaps、Verdict 和处置摘要，并同步更新 `docs/reviews/README.md`。
