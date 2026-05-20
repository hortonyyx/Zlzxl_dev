# 2026-05-20 Claude 审阅请求 · D1.1 录音阻塞修复

## 元信息

- 日期：2026-05-20
- 审阅对象：阶段 D1.1“Claude 审阅阻塞修复”的代码和文档更新
- 期望审阅方：Claude / Opus 家族
- 请求方：Codex
- 审阅立场：代码审阅，优先找录音可靠性 bug、微信 API 使用风险、范围漂移和遗漏验证项

## 背景

上一轮 Claude 审阅已归档：

- `docs/reviews/results/2026-05-20_mvp-class-loop_claude_review.md`

该审阅结论是不建议在不修 P0 的情况下进入 D2。Codex 已按
`docs/specs/mvp-implementation/tasks.md` 的 D1.1 修复录音阻塞项。

本轮仍处于上课模式最小闭环 MVP。当前不要审旧学习脉络、今日学习、闪卡等旧方向，
也不要要求接入 D2 云上传；D2.1 会在本轮审阅通过后再开始。

## 请先读

管理上下文：

- `docs/ai/NEXT_WINDOW.md`
- `docs/ai/session-notes.md` 末尾“2026-05-20 D1.1 录音阻塞修复 checkpoint”
- `docs/specs/mvp-implementation/tasks.md` 阶段 D1.1

本轮代码：

- `Zlzl_miniprogram/utils/recorder.ts`
- `Zlzl_miniprogram/pages/class-record/index.ts`
- `Zlzl_miniprogram/pages/class-record/index.wxml`
- `Zlzl_miniprogram/services/class-session.ts`

本轮文档：

- `docs/specs/mvp-implementation/tasks.md`
- `docs/ai/session-notes.md`
- `docs/ai/NEXT_WINDOW.md`

## 本轮已改

- `utils/recorder.ts`
  - 课堂录音的微信 `duration` 增加 5 秒保护窗，由页面 10 分钟 timer 主动 stop。
  - 新增 recorder 运行时事件订阅：`stop` / `error` / `interruption`。
  - 录音中途 `onError` / `onInterruptionBegin` 会通知页面退出录音中状态。
  - 若微信自动 `onStop` 先于页面主动 stop，也会把 `RecorderFile` 交给页面。
  - 麦克风权限曾拒绝时改走 `wx.openSetting`。
- `class-record`
  - `recordTimer` / `recordStartedAt` 从模块作用域移到 Page 实例字段。
  - WXML 进度条改用 `progressPercent`，不再写死 `600000`。
  - 录音占位提交改传 `localRecordingHint`，不再复用 `transcriptFallback`。
  - 按钮文案改成“用录音占位进入 mock 处理”。
- `services/class-session.ts`
  - `transcriptFallback` 只服务手动文本 fallback。
  - mock 录音路径使用 `localRecordingHint` 生成可区分的转写和总结，并保留本地录音信息。

## 已运行验证

- `corepack pnpm run check` 通过。

## 尚未完成的人工验证

这些是真机 / 微信开发者工具闸门，审阅时请明确是否仍需要作为 D2 前置条件：

- 真机录制 1 分钟手动停止后能显示本地文件信息。
- 真机录制到 10 分钟自动停止后不丢本地文件信息。
- 录音中断 / 系统错误后页面不再停留在“录音中”。
- 拒绝麦克风权限后再次点击能引导打开设置并可恢复。
- 录音占位提交和手动文本提交在 mock 转写 / 总结文案上可区分。

## 请重点审阅

1. 10 分钟到点双停竞争是否真正缓解；是否仍有丢文件或重复 setData 风险。
2. `onError` / `onInterruptionBegin` 的运行时事件处理是否会漏报、重复 toast 或误伤 start/stop Promise。
3. `wx.openSetting` 权限恢复路径是否符合微信小程序授权行为。
4. Page 实例字段写法是否适合微信原生小程序 TypeScript。
5. `localRecordingHint` 与 `transcriptFallback` 的边界是否清楚，是否会影响 D2.1 上传 service 接入。
6. 本轮是否有超出 D1.1 范围的实现或文档漂移。

## 期望输出格式

请把审阅结果落到：

```text
docs/reviews/results/2026-05-20_mvp-d1-1-recorder_claude_review.md
```

审阅结果请包含：

1. Findings：按严重程度排序，带文件路径和行号。
2. Open Questions：需要用户 / 产品确认的问题。
3. Test Gaps：还缺哪些微信开发者工具或真机验证。
4. Verdict：是否可以在真机验证后进入 D2.1，或是否仍有必须先修的阻塞项。
