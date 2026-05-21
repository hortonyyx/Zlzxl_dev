# 2026-05-21 MVP 阶段 E 处理页轮询审阅结果

## 元信息

- 日期：2026-05-21
- 审阅目标：阶段 E 中 `class-processing` 轮询、失败重试和返回入口
- 审阅方：Claude (Opus 4.7)
- 请求方：Codex
- 对应请求：`docs/reviews/requests/2026-05-21_mvp-e-processing-polling_claude_review_request.md`
- 审阅立场：代码审阅，优先找 bug、回归风险、范围漂移和缺失验证

## 处置摘要

- 无 P0 阻塞项。轮询主路径、失败重试、mock 立即 done、返回课程记录都能跑通，可以在补完真机验证后进入 E 的下一步（接 ASR / LLM）。
- 1 个中等优先项：**导航中断时的 setData / 计时器泄漏**。需要在
  `onUnload` 之外加“已卸载”守卫，避免 `await advanceClass` resolve
  后继续 setData / `scheduleNextPoll`。
- 2 个低优先项：失败重试时 `status` / `statusText` 未回退，retry 期间界面残留“处理失败”
  文案；非 mock 云函数当前固定返回 `failed`，未来切换 `useMockCloud=false`
  会进入纯靠用户点重试的循环（不属于本轮范围，但建议在 tasks 里挂个待办）。
- 范围声明诚实：`NEXT_WINDOW.md`、`tasks.md`、`docs/ai/session-notes.md`
  都明确写了 ASR/LLM 尚未接入，没有过度声称完成真实阶段 E。

## Findings

### F1（中）`onUnload` 之后仍可能 setData / 重新 schedule

文件：[Zlzl_miniprogram/pages/class-processing/index.ts:29-71](Zlzl_miniprogram/pages/class-processing/index.ts#L29-L71)

`onUnload` 调用了 `clearPollTimer()`，但典型时序是：

1. `scheduleNextPoll` 触发的回调里调用 `advance()`。
2. `advance()` 进入 `await advanceClass(...)`。
3. 此时用户主动 `navigateBack` / 跳走，`onUnload` 触发，`pollTimer`
   已经是 `undefined`（因为定时器早就 fire 完了），`clearPollTimer`
   等于空操作。
4. `await` resolve 后页面继续 `setData(...)`，并在非终止状态下重新
   `scheduleNextPoll(1.5s)`，这次 setTimeout 是在**卸载之后**新建的，
   `onUnload` 已经走过了不会再清。

后果：

- 残留 timer 会在 1.5 秒后再次 `advance` → 再次 `setData` → 再次
  schedule，形成一个挂在已销毁页面上的轮询链。
- mock 路径下因为首轮立刻 `done`，不会触发；只有真实云函数返回非终止
  状态时暴露。

建议修法（任选其一）：

- 加一个实例标志 `this.unloaded = true`，在 `onUnload` 里置位；
  `advance` 在 `await` 之后、`setData` / `scheduleNextPoll` 之前先检查
  `if (this.unloaded) return;`。
- 或者把 `clearPollTimer` 与“拒绝后续 schedule”合并：再加一个
  `pollDisposed` 标志，schedule 前先看标志。

下一轮顺手修即可，不阻塞本轮归档。

### F2（低）失败重试时 `status` / `statusText` 没有回退

文件：[Zlzl_miniprogram/pages/class-processing/index.ts:44](Zlzl_miniprogram/pages/class-processing/index.ts#L44)

`retryProcessing` → `advance()` 在开头只清了 `errorText / done / failed / retrying`，
没有重置 `status` 和 `statusText`。WXML 仍会显示
“当前状态: 处理失败”加 loading 按钮，直到 `await` 完成。

建议：在那一行 `setData` 里把 `statusText` 重置为“处理中”，或把 `status`
回退到一个轮询占位（比如 `'transcribing'`）。纯 UX 项。

### F3（低）非 mock 云函数当前固定返回 `failed`

文件：[cloudfunctions/advanceClass/index.js:28-39](cloudfunctions/advanceClass/index.js#L28-L39)

`advanceClass` 云函数在拿到 `tempFileURL` 之后，目前仍 unconditional
返回 `{ ok: false, status: 'failed', error: 'ASR/LLM providers are not
configured yet' }`。这是预期的占位实现，但要注意：

- 一旦 `useMockCloud` 在 [Zlzl_miniprogram/services/cloud.ts:1](Zlzl_miniprogram/services/cloud.ts#L1)
  切到 `false`，处理页就只会出现失败 + 重试，不会再走 mock 即时 done。
- 页面侧目前没有“开发占位/真未接入”的区分文案，用户只能看到“课堂处理
  失败”，未来切线时容易让人误以为线上出了 bug。

建议（不在本轮做）：在 tasks E 里挂一条“处理页区分 provider 未配置 vs
真错误”的待办；或在云函数 `error` payload 里加 `reason: 'not-configured'`
让页面给出更明确文案。

### F4（提示）`pollTimer` 字段挂在 `Page()` options 对象上

文件：[Zlzl_miniprogram/pages/class-processing/index.ts:7](Zlzl_miniprogram/pages/class-processing/index.ts#L7)

`pollTimer: undefined as number | undefined` 写在 `Page({...})` options
里。微信会把 options 浅复制成实例字段，且 `this.pollTimer = ...` 是写
实例属性，不会污染原 options。所以**没有 D1.1 那种“模块作用域共享”
的回归**。仅作为提示：未来如果有第二个 page 实例同时存在（一般不会），
也是各自独立的。

### F5（提示）mock 路径主路径正常

`mockSubmitClass` 直接把 session.status 写成 `'done'`，所以首次
`advance()` 立刻拿到 `done` + `nodeId`，进入“查看课堂总结”按钮。
[Zlzl_miniprogram/services/class-session.ts:75-99](Zlzl_miniprogram/services/class-session.ts#L75-L99)
[Zlzl_miniprogram/services/class-session.ts:105-112](Zlzl_miniprogram/services/class-session.ts#L105-L112)
mock 路径不会进 polling、不会走失败分支，符合预期。

### F6（提示）返回课程记录的路由参数正确

`backToLibrary` 用 `${routes.libraryDetail}?libraryId=...`，对照
[Zlzl_miniprogram/constants/routes.ts:5](Zlzl_miniprogram/constants/routes.ts#L5)
是 `/pages/library-detail/index`，符合 `library-detail` 页面对
`libraryId` query 的预期。

## Open Questions

1. 当 `useMockCloud` 在哪一节点切到 `false`？切换之前是否需要先在
   `class-processing` 增加“provider 未接入”的占位文案，避免 QA 误判？
2. 真实云函数串起来之后，`advanceClass` 是否需要返回中间态（例如
   `transcribing` / `summarizing`）来驱动页面进度，还是仍然只回
   `done` / `failed`？目前页面已经能解析所有 `ClassSessionStatus`
   值，云函数侧需要对齐。
3. 失败态除“重试”和“返回”之外，是否需要保留“切换到手动文本 fallback”
   的入口？现在录音失败回退路径在 `class-record`，不在处理页。

## Test Gaps

- 微信开发者工具 mock 主路径：录音 / 文本 fallback → 处理页（立即 done）→
  总结页。请求包里已标为未验证。
- 真实云函数当前必然 `failed`，需要在云端确认 `advanceClass` 抛错时
  小程序端是否触发 `showToast('处理失败')`（catch 分支）以及失败按钮
  组合是否正确出现。
- 导航中断场景：在 `advance` 的 `await` 期间 `navigateBack` / `redirectTo`
  离开，验证 console 是否会报“setData of undefined page”警告，以及
  F1 描述的 stale timer 是否真实出现。
- mock 下没有连续轮询路径可走，因此“1.5s 间隔轮询”实际只能通过把
  mock session 暂时改成非 `done` 状态来验证；可选。

## Verdict

**Approve with follow-ups（建议合并 / 进入下一步前先修 F1）。**

主路径代码逻辑清晰、范围控制良好、文档同步到位。F1 是唯一一个有真实
副作用的问题（卸载后残留 timer），建议在进入“接 ASR / LLM”这一步之前
顺手补一个 `unloaded` 守卫。F2、F3 都属于 UX / 后续接线时的提示项，
不阻塞本轮。

## 原始审阅输出

> 本审阅完整原文即本文件 Findings / Open Questions / Test Gaps / Verdict
> 各节内容，审阅方为 Claude（Opus 4.7），由 Codex 在 2026-05-21
> 提出请求。无单独聊天稿；本文档即原始输出。
