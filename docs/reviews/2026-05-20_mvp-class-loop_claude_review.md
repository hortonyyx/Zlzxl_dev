# 2026-05-20 Claude 审阅 · 上课模式最小闭环

## 元信息

- 日期：2026-05-20
- 审阅范围：阶段 A/B/C/C.5/D1 已执行内容与执行包对齐情况
- 审阅方：Claude (Opus 4.7)
- 请求方：Codex
- 对应请求：[`2026-05-20_mvp-class-loop_claude_review_request.md`](2026-05-20_mvp-class-loop_claude_review_request.md)
- 立场：代码审阅 + 执行包审阅，重点找 bug、范围漂移、架构边界与遗漏验证项

## 处置摘要

### 阻塞项，进入下一轮开发

- P0 · 10 分钟到点双停并丢文件：进入阶段 D1.1 修复，D2 前必须解决。
- P0 · 录音中途出错被静默吞掉：进入阶段 D1.1 修复，D2 前必须解决。
- P1 · 麦克风权限被一次拒绝后无法恢复：进入阶段 D1.1 修复，D2 前必须解决。
- P1 · `submitRecordedClass` 实际未使用录音文件：进入阶段 D1.1 修复，需让录音占位路径和手动文本 fallback 分开。
- P1 · `transcriptFallback` 语义污染：进入阶段 D1.1 修复，明确手动文本与录音占位字段边界。

### 非阻塞项，进入后续开发

- P2 · 类型与 design 漂移、旧字段残留：进入 D2 前后收敛，避免云函数契约被兼容字段拖住。
- P2 · 学习脉络死代码仍在写入：进入后续清理任务，当前主路径未触发但会误导后续 Agent。
- P2 · `quiz-run` 与 design 流程不匹配：进入阶段 F，把一次性提交改成一题一提交 / 下一题。
- P3 · wxml 写死 `600000`：进入 D1.1 顺手修。
- P3 · `quiz-run` 兼容 `studyNodeId` 参数：进入后续清理。
- P3 · `recordTimer` / `recordStartedAt` 模块作用域：进入 D1.1 修复。

### 已同步

- `docs/specs/mvp-implementation/tasks.md` 增加 D1.1 审阅阻塞修复。
- D2 拆为 D2.1 / D2.2 / D2.3，并把 `transcriptFallback` 收口列入验收。
- `docs/reviews/README.md` 已追加本审阅文件。
- `docs/ai/session-notes.md` 与 `docs/ai/NEXT_WINDOW.md` 已记录审阅结论和下一步。

> 按项目新规范，本文件与索引 / 交接文档更新属于审阅节点；实际修复进入下一轮开发，
> 不混入审阅节点。

## Findings

### P0 · 10 分钟到点会双停并丢文件

- `wx.RecorderManager.start` 选项里写入 `duration: CLASS_RECORD_MAX_DURATION_MS`
  ([utils/recorder.ts:12-19](../../Zlzl_miniprogram/utils/recorder.ts#L12-L19))，
  到时 WeChat 会**自动 stop** 并触发 `onStop`。
- 同时页面 setInterval 在 `elapsedMs >= max` 时主动调 `stopRecording()`
  ([pages/class-record/index.ts:128-137](../../Zlzl_miniprogram/pages/class-record/index.ts#L128-L137))。
- 竞争路径一（wx 先到）：recorder 进 `idle`，`pendingStop=null`，
  `onStop` 静默吞掉 `RecorderFile`
  ([utils/recorder.ts:40-49](../../Zlzl_miniprogram/utils/recorder.ts#L40-L49))；
  随后 JS timer 调 `stop()`，
  ([utils/recorder.ts:78-89](../../Zlzl_miniprogram/utils/recorder.ts#L78-L89))
  检测到 `state !== 'recording'` 抛 “当前没有正在录制的音频”，
  页面 toast “录音停止失败”，10 分钟课堂录音直接丢。
- 修复方向二选一：
  - (推荐) wx 的 duration 设为 `MAX + 5_000` 上限保险值，由 JS timer 主动 stop；
  - 或在 `onStop` 里即使 `pendingStop=null` 也缓存 `RecorderFile`，等下一次取。

### P0 · 录音中途出错被静默吞掉

- `onError` 通过 `pendingReject` 上抛，但 `pendingReject` 仅在 start/stop 的
  promise 周期内有效
  ([utils/recorder.ts:51-55](../../Zlzl_miniprogram/utils/recorder.ts#L51-L55))。
- `onStart` 后只清 `pendingStart`，未清 `pendingReject`
  ([utils/recorder.ts:34-38](../../Zlzl_miniprogram/utils/recorder.ts#L34-L38))，
  但那个 reject 对应的 promise 已经 resolve，调它无效。
- 结果：录音过程中 wx 抛 `onError` / `onInterruptionBegin` 时
  - 上一次 start reject 是 stale；
  - `state` 被改成 `'idle'`，但页面 `this.data.recording` 仍是 `true`，
    计时器继续，UI 仍显示“录音中”。
- 修复：给 recorder 暴露一个 `onRuntimeError` 回调，页面 onLoad 注册，
  使录音中失败能同步到页面 state；或让 `onError` 触发已注册的 listener 并强制
  reset。

### P1 · 麦克风权限被一次拒绝后无法恢复

- `ensureRecordPermission` 在 `authSetting['scope.record'] === false`
  （用户曾拒绝）时直接 `wx.authorize`
  ([utils/recorder.ts:142-160](../../Zlzl_miniprogram/utils/recorder.ts#L142-L160))。
- 微信对 “已拒绝” 的 scope 调 `authorize` 会**直接 fail，不再弹框**。
- 修复：区分 `=== false` 与 `=== undefined`：
  - `=== false` 走 `wx.openSetting`，引导用户去系统设置面板；
  - `=== undefined` 才走 `wx.authorize`。

### P1 · `submitRecordedClass` 实际未使用录音文件

- 录音成功后调用
  `submitClass(libraryId, undefined, transcriptFallback)`
  ([pages/class-record/index.ts:90-107](../../Zlzl_miniprogram/pages/class-record/index.ts#L90-L107))，
  `recordingFileId` 传的是 `undefined`，本地 `tempFilePath` 被丢弃。
- 用户看到 “用录音进入 mock 处理”，实际走的还是 fallback 文本路径，
  和 “手动文本 fallback” 没有区别。
- 后果：D1 真机自测无法分辨录音链路是否真在工作。
- 修复：要么把 `tempFilePath` 透传进 mock，让总结/转写文案能引用它；
  要么把按钮文案改成 “用录音占位进入 mock 处理（D2 上传未接）”。

### P1 · `transcriptFallback` 语义已经被污染

- 设计 [design.md:182](../specs/mvp-implementation/design.md#L182)
  明确 `transcriptFallback` 仅作开发 / 失败兜底。
- 现在录音路径
  ([pages/class-record/index.ts:98](../../Zlzl_miniprogram/pages/class-record/index.ts#L98))
  也在用它（“mock 转写:本节课来自一段 03:00 的本地录音…”）。
- 三层 fallback：
  1. 录音路径填一段；
  2. 手动文本路径填另一段；
  3. service 在没传时再 fallback 到硬编码句
     ([services/class-session.ts:55-58](../../Zlzl_miniprogram/services/class-session.ts#L55-L58))。
- 修复：在 D2 接通前就把 “录音占位” 路径和 “手动文本 fallback” 路径在 service
  层用不同字段区分。例如新增 `localRecordingHint`；或让录音路径直接调
  `submitClass(libraryId, undefined, undefined)` 走 service 自带默认 mock 文本，
  `transcriptFallback` 留给手动 textarea。

### P2 · 类型与 design 漂移、旧字段残留

- `ClassSessionStatus` 仍含 `'extracting'`、`'rewriting'`
  ([types/learning.ts:5-13](../../Zlzl_miniprogram/types/learning.ts#L5-L13))，
  design 已不再包含。
- `ClassSummary` 同时持有 `points` 与可选 `keyPoints`
  ([types/learning.ts:57-62](../../Zlzl_miniprogram/types/learning.ts#L57-L62))，
  服务侧写入两份
  ([services/class-session.ts:72-77](../../Zlzl_miniprogram/services/class-session.ts#L72-L77))。
- `QuizQuestion` 同时持有 `stem/referenceAnswer` 与 `prompt/expectedAnswer`，
  `knowledgePointId` 必填但课堂题填空字符串
  ([types/learning.ts:145-153](../../Zlzl_miniprogram/types/learning.ts#L145-L153))。
- 这些 dual-field 在 D2/D3 接真服务前应收敛到 design 字段集，否则云函数契约也
  会被兼容字段拖着走。

### P2 · 学习脉络死代码仍在写入

- 每次提交课堂仍调 `ensureLegacyMailuoRecord`
  ([services/class-session.ts:102](../../Zlzl_miniprogram/services/class-session.ts#L102))。
- `mockGradeModule` / `updateMailuoAfterModule` 仍回写知识点状态、刷新站点颜色
  ([services/module.ts:58-107](../../Zlzl_miniprogram/services/module.ts#L58-L107))。
- MVP 明确不做学习脉络/状态色。当前主路径未触发（quiz-run 走的是
  `gradeQuizAnswer` 而非 `gradeModule`），属死代码 + 误导后续 Agent。
- 修复：阶段 C.5 一起删除或集中 quarantine。

### P2 · `quiz-run` 与 design 流程不匹配（F 会绊倒）

- 当前 `Promise.all` 一次性提交三题
  ([pages/quiz-run/index.ts:47-66](../../Zlzl_miniprogram/pages/quiz-run/index.ts#L47-L66))。
- design [`design.md:147-148`](../specs/mvp-implementation/design.md#L147)、
  tasks F 要求 “支持下一题、完成态”。
- 对当前 mock 影响不大，但需在 F 任务里明确改成一题一提交，否则会回头改。

### P3 · wxml 写死 600000

- [pages/class-record/index.wxml:12](../../Zlzl_miniprogram/pages/class-record/index.wxml#L12)
  `style="width: {{elapsedMs * 100 / 600000}}%;"` 在 wxml 与 ts 两处复制 max。
- 修复：在 setData 一个 `progressPercent`，避免改 10 分钟时漏改 wxml。

### P3 · `quiz-run` 兼容参数已无意义

- [pages/quiz-run/index.ts:21](../../Zlzl_miniprogram/pages/quiz-run/index.ts#L21)
  `options.nodeId ?? options.studyNodeId` 的 `studyNodeId` 兜底可删，
  旧调用方都封存了。

### P3 · `recordTimer`/`recordStartedAt` 用了模块作用域

- [pages/class-record/index.ts:13-14](../../Zlzl_miniprogram/pages/class-record/index.ts#L13-L14)
  在模块顶层 `let recordTimer`。
- WeChat 小程序里 Page 实例的 setInterval 仍可工作，但模块作用域意味着这两个
  变量会跨页面实例共享，重入时上一份引用会被覆盖丢失，再 clear 不到。
- 修复：挂到 `this`。

## Open Questions

1. D1 是否要把 “录音 → mock” 的按钮文案改成明示 “录音文件未上传”，避免真机
   自测时把 mock 当成跑通了录音链路？
2. `transcriptFallback` 是否拆为 `manualTranscript`（手动文本）和
   `mockRecordingHint`（录音占位提示）两个独立字段？现在的复用让 D2 上线后
   回滚 mock 路径风险大。
3. 旧 `Mailuo`、`MasterySignal`、`gradeModule` 这一整套是 “暂留做编译兼容”
   还是可以在 C.5/D1 之间直接删？保留越久越容易被无意触达。
4. 录音文件保留策略：本地 `tempFilePath` 在 D2 上传前若用户关掉小程序就丢，
   是否需要在 D1 文档里写明 “未上传前不要离开页面”？

## Test Gaps

- 真机：**10 分钟到点自动停止** —— 按 P0 推断必然 toast “录音停止失败”，
  D1 验收前必须真机走一次。
- 真机：**录音中切到后台 / 来电** —— `onInterruptionBegin` 路径页面是否还显示
  “录音中”、计时器是否继续跑、能否恢复或显式失败。
- 真机：**首次拒绝麦克风后再次点击开始录音** —— 验证 P1 的恢复路径。
- 真机：**录音中权限被手动撤销 / 系统错误** —— 验证 P0 的录音中错误是否能被
  页面感知。
- 模拟器：手动文本 / 录音占位走完后 `quiz-run` 提交，验证 `quizState` 写回
  顺序正确
  ([services/module.ts:159-163](../../Zlzl_miniprogram/services/module.ts#L159-L163))。
- 静态：D2 前加一个 `Library.mode === 'course'` 的窄校验，避免后续 self 模式
  入口被意外打开。

## Verdict

**不建议在不修 P0 的情况下进入 D2。**

进入 D2 前必修：

- P0 双停丢文件（改 wx duration 上限）。
- P0 录音中途错误静默。
- P1 拒绝授权恢复路径。
- P1 `submitRecordedClass` 与 `transcriptFallback` 语义分离 —— D2 一上来就要
  决定 “录音文件路径” 和 “手动文本兜底” 是两个不同 service 入口。

D2 阶段可同步处理（不卡 D2 起步，但应在 D2 完成前清完）：

- P2 类型与 design 漂移。
- P2 学习脉络 / MasterySignal 死代码清理。
- P3 三项。

D2 拆分建议（写进 `tasks.md`）：

- D2.1 配置环境 ID + `services/upload.ts` 封装 `wx.cloud.uploadFile`，先不接
  页面。
- D2.2 `class-record` 改成 “停止 → 自动上传 → 显示 fileID/进度”，失败回到手动
  文本 fallback。
- D2.3 录音路径调 `submitClass(libraryId, recordingFileId)`，`transcriptFallback`
  只服务手动 textarea；mock 内部对 `recordingFileId` 也生成占位转写文本，让
  D3 衔接顺畅。

阶段包整体与代码大致一致，但请把 D2 拆分细化到三步，并把 “transcriptFallback
收口” 显式列进 D2 验收。
