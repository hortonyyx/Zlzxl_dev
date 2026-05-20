# 2026-05-20 Claude 审阅 · D1.1 录音阻塞修复

## 元信息

- 日期:2026-05-20
- 审阅目标:阶段 D1.1“Claude 审阅阻塞修复”
- 审阅方:Claude (claude-opus-4-7)
- 请求方:Codex
- 对应请求:`docs/reviews/requests/2026-05-20_mvp-d1-1-recorder_claude_review_request.md`
- 审阅立场:代码审阅,优先找录音可靠性 bug、微信 API 使用风险、范围漂移和遗漏验证项

## 处置摘要

- 总体判断:本轮修复方向正确,上一轮 Claude 审阅指出的 P0(双停竞争、错误静默、权限恢复、占位/fallback 语义混用、模块作用域计时器、写死进度常量)在代码层面均已闭环。
- 没有发现必须先修的代码层阻塞项;真机验证是仅剩的闸门。
- 提出 1 个中等(M1:中断后 `onStop` 重入会让“已退出录音中”的页面再次出现录音卡片) + 5 个低优修订项,均建议进入下一轮开发,**不混入审阅 commit**。
- 审阅 commit 只包含本文件、`docs/reviews/README.md` 索引和 `docs/ai/NEXT_WINDOW.md` 同步。

## Findings

按严重程度排序。

### M1 · 中断 / 错误后 wx 仍可能晚到 onStop,触发幽灵 finishRecording

- 位置:[Zlzl_miniprogram/utils/recorder.ts:49-87](../../../Zlzl_miniprogram/utils/recorder.ts#L49-L87)、
  [Zlzl_miniprogram/pages/class-record/index.ts:38-46](../../../Zlzl_miniprogram/pages/class-record/index.ts#L38-L46)
- 场景:`onInterruptionBegin` 或 `onError` 触发后,recorder 把 `state` 改成 `idle` 并通过运行时事件
  让页面退出“录音中”(`recording=false`, toast 错误)。但微信底层可能在中断 / 错误之后**再
  补发一次 `onStop`**(尤其是中断结束、系统判定本段录音应作为短片落地的情况)。
  此时 `pendingStop=null`,代码路径走 [recorder.ts:62](../../../Zlzl_miniprogram/utils/recorder.ts#L62)
  的 `notifyRuntime({type:'stop', file})`,页面 runtime handler 落到
  [index.ts:39-42](../../../Zlzl_miniprogram/pages/class-record/index.ts#L39-L42) 的 `finishRecording`,
  于是用户刚看到“录音被系统中断”的 toast,又突然看到“已完成录音 + 文件卡片”,体验冲突。
- 建议:在 recorder 内部引入“最近一次终态”标记,interruption / error 之后到下一次
  `start()` 之前,丢弃后续 `onStop`;或在页面 runtime handler 里,只有当
  `this.data.recording || this.data.stopping` 时才接受 `stop` 事件,否则忽略。
- 严重度:M(不会丢数据,只会让 UI 自相矛盾,且只在中断场景出现)。

### L1 · 双停竞争下第二次 stop 会弹“当前没有正在录制的音频”错误 toast

- 位置:[Zlzl_miniprogram/pages/class-record/index.ts:81-93,134-143](../../../Zlzl_miniprogram/pages/class-record/index.ts#L81-L143)、
  [Zlzl_miniprogram/utils/recorder.ts:111-122](../../../Zlzl_miniprogram/utils/recorder.ts#L111-L122)
- 场景:用户在第 10 分钟时手动点“结束课”,几乎同时 timer 也命中
  `elapsedMs >= MAX` 触发 `this.stopRecording()`。`setData` 异步,两次调用都可能在看到
  `stopping=false` 时进入,utils 层 `state==='stopping'` 时第二次 stop 立刻 reject,
  页面 catch 后走 `handleRecordingFailure("当前没有正在录制的音频")`,弹一个误导 toast。
- 建议:在页面 `stopRecording` 方法起始处用实例字段(非 data)加一个同步互斥锁,
  或把 utils 的 stop 在 `stopping` 状态下改成 resolve 一个 sentinel(等待已有 stop)。
- 严重度:L(数据不丢,只有错误 toast 噪音)。

### L2 · 录音中 `onError`/`onInterruptionBegin` 与 `stop()` 的 pendingReject 复用边界

- 位置:[Zlzl_miniprogram/utils/recorder.ts:65-87,111-122](../../../Zlzl_miniprogram/utils/recorder.ts#L65-L122)
- 现状:在 `state==='recording'` 期间发生 onError,会进入 `pendingReject` 分支(因为 start 阶段
  设过 reject)还是 notifyRuntime 分支,取决于 onStart 是否清过 `pendingReject`(line 46)。
  目前 onStart 把 `pendingReject` 清成 null,所以录音中 onError 走 notifyRuntime,符合预期。
  但这条不变量靠两段代码隐式维持,没有注释,后续若有人改 onStart 顺序很容易破。
- 建议:加一行注释,说明“onStart 后必须清 pendingReject,否则录音中 onError 会误走 start 阶段路径”;
  或显式拆成 `pendingStartReject` 与 `pendingStopReject` 两个槽位。
- 严重度:L(当前正确,但易破)。

### L3 · 页面方法名与导入名同名,可读性差

- 位置:[Zlzl_miniprogram/pages/class-record/index.ts:5-12,81-93,95-113,115-132](../../../Zlzl_miniprogram/pages/class-record/index.ts)
- 现状:从 utils 导入 `stopRecording`,同时 Page 也定义了一个 `stopRecording` 方法;
  从 service 导入 `submitClass`,Page 也定义了 `submitClass` 方法。
  在方法体里 `await stopRecording()`/`await submitClass(...)` 指的是**导入项**(局部作用域优先),
  `this.stopRecording()`/`this.submitClass()` 指的是 Page 方法。
  目前所有 call site 都用对了,但维护成本高,新人改一行很容易引发自递归。
- 建议:把页面方法改名,例如 `handleStopTap` / `submitWithRecording`,或把导入做命名空间
  `import * as recorder from '../../utils/recorder'`。
- 严重度:L(可读性,不影响功能)。

### L4 · `submitClass` 4 个位置可选参数容易传错

- 位置:[Zlzl_miniprogram/services/class-session.ts:35-42](../../../Zlzl_miniprogram/services/class-session.ts#L35-L42)、
  [Zlzl_miniprogram/pages/class-record/index.ts:105](../../../Zlzl_miniprogram/pages/class-record/index.ts#L105)
- 现状:`submitClass(libraryId, recordingFileId?, transcriptFallback?, localRecordingHint?)`,
  录音路径调用方写了 `submitClass(libraryId, undefined, undefined, hint)`,
  下一步 D2.1 接入云上传时,大概率会变成 `(libraryId, fileId, undefined, hint?)` 这种组合,
  参数顺序错位风险高。
- 建议:在进入 D2.1 之前把这个 service 入参收敛成一个对象 `SubmitClassRequest`。
- 严重度:L(目前两个调用点都对,但 D2.1 之前应该顺手收敛)。

### L5 · `onInterruptionEnd` 没有订阅,中断后无自动恢复说明

- 位置:[Zlzl_miniprogram/utils/recorder.ts:33-87](../../../Zlzl_miniprogram/utils/recorder.ts#L33-L87)
- 现状:MVP 阶段不自动恢复录音是合理选择,但缺一行注释/或一个 no-op handler,
  否则下一个看代码的人会怀疑“是不是漏写了”。
- 建议:加一条注释,或订阅 `onInterruptionEnd` 仅打 console.info,显式表达“MVP 不恢复”。
- 严重度:L(纯文档性)。

## Open Questions

1. 中断结束后,产品是否希望自动尝试续录?如果是,Recorder 需要保留中断前的 `recordStartedAt` 与
   累积时长(目前页面的 `recordStartedAt` 会被下一次 startRecording 重置)。
2. 当真机上 `wx.openSetting` 返回成功但 `scope.record` 仍为 false,目前直接 reject 并 toast。
   产品上是否需要二次引导,例如显式弹一个 modal 说明“去设置-麦克风权限”?
3. `localRecordingHint` 当前嵌入 `临时路径 ${tempFilePath}`,真机 tempFilePath 可能很长且包含
   `wxfile://`/`wxFileSystem` 前缀。如果用户看到 mock 转写 / 总结里出现这种长路径,体验是否可接受?
   或者只把时长 + 大小放进 hint?

## Test Gaps

请求包列出的人工验证仍然必须执行,代码审阅无法替代。重申并细化:

- **真机录制 1 分钟手动停止**:`finishRecording` 是否被 Page 主动 stop 走通,而不是被 runtime
  事件兜底走通(可以通过在 finishRecording 里临时 console.log "via promise" / "via runtime" 区分)。
- **真机录制 10 分钟自动停止**:确认 timer 在第 600s 之前先触发 `this.stopRecording()`,且不会
  出现 M1 描述的“中断后又收到 onStop”这种叠加。
- **真机录制 10 分钟时主动后台 / 切应用**:本轮没有显式覆盖切后台场景,建议至少跑一次
  录到 1 分钟后切到微信聊天再切回来,看 timer / recorder 状态是否一致。
- **录音过程中拔掉耳机 / 接到电话**:走 `onInterruptionBegin` 路径,验证页面是否回到 idle,
  以及验证 M1 是否会真的复现。
- **拒绝麦克风权限两次**:验证第二次走 `wx.openSetting`,以及用户在设置页不操作直接返回时,
  是否得到“需要在设置中开启麦克风权限才能录音”而不是默默无响应。
- **录音占位 vs 手动文本 fallback 两个提交按钮的 mock 输出**:确认 `transcript` 和
  `summary.full` 文案确实不同(对比 [class-session.ts:149-177](../../../Zlzl_miniprogram/services/class-session.ts#L149-L177) 三个分支)。
- **TS 检查 / lint**:请求包提到 `corepack pnpm run check` 已通过,本审阅未重跑,真机验证前
  建议再跑一次确认仓库状态干净。

## Verdict

**可以在真机验证通过后进入 D2.1**,不存在必须在审阅 commit 之前修掉的代码阻塞项。

- M1 建议在进入 D2.1 之前的下一个开发批次顺手修,避免与上传逻辑搅在一起。
- L1-L5 可以排进 D2.1 同批次或之后的小修补,不阻塞 D2.1 启动。
- 真机验证(尤其是 M1 复现路径:中断后是否又收到 onStop)若失败,需要把 M1 升级为 H 并先修。

## 原始审阅输出

本文件即审阅方完整原始输出,无另存的聊天记录需要回收。

