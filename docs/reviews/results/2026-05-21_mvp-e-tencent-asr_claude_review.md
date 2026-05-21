# 2026-05-21 MVP 阶段 E 腾讯云 ASR 接入审阅结果

## 元信息

- 日期：2026-05-21
- 审阅目标：`submitClass` / `advanceClass` 云函数腾讯云 ASR 接入
- 审阅方：Claude (Opus 4.7)
- 请求方：Codex
- 对应请求：`docs/reviews/requests/2026-05-21_mvp-e-tencent-asr_claude_review_request.md`
- 审阅立场：代码审阅，优先找 bug、云函数运行风险、签名错误、状态机问题和密钥边界问题

## 处置摘要

- 无密钥泄漏路径,密钥只从 `process.env` 读取,不进日志 / 返回值 / 文档。
- TC3-HMAC-SHA256 签名实现整体符合腾讯云 API 3.0 规范(canonical headers
  / signed headers / credential scope / kDate→kService→kSigning 派生
  顺序都对),`X-TC-Action` / `X-TC-Version` / `X-TC-Region` / `Content-Type`
  与签名一致。**真机部署前建议先用一次任意 dry-run 请求确认签名通过**
  (这种 API 签名 bug 只能在真请求里暴露)。
- **1 个 P1 阻塞项 (F1):重试在状态机里是死的**。`advanceClass` 进入
  `failed` 后短路返回,小程序端那个“重试处理”按钮目前等价于“再读一次
  失败结果”,不会重新触发 ASR。这条不修,真机里只要 ASR 报错一次,
  整条 session 就报废。
- **1 个 P1 阻塞项 (F2):并发轮询会重复创建 ASR 任务**。状态写入
  `transcribing` 与 `createAsrTask` 之间没有锁,小程序端 1.5s 轮询
  在弱网下完全可能在第一次 update 落库前发起第二次 advance,触发
  两次 CreateRecTask。
- 1 个语义中等项 (F3):ASR 成功 + LLM 未配置时 session 写成
  `status='failed'`,跟真正的 ASR 失败混在一起,小程序端无法区分。
- 若干低优 / 提示项见下。

整体结论:**Request changes**。F1、F2 在接真机之前必须修;签名建议先
做一次真请求烟雾测试再正式跑长录音。

## Findings

### F1(P1)`advanceClass` 进入 failed 后不可恢复,与小程序端“重试”按钮语义冲突

文件:[cloudfunctions/advanceClass/index.js:27-35](cloudfunctions/advanceClass/index.js#L27-L35)

```js
if (session.status === 'done' || session.status === 'failed') {
  return { ok: session.status === 'done', status: session.status, ... };
}
```

任意失败都把 session 永久钉在 `failed`:

- 临时 URL 解析失败 → `markFailed` → 永久 failed。
- `CreateRecTask` 网络抖动 → catch → `markFailed` → 永久 failed。
- ASR 任务报错(`ErrorMsg`) → `markFailed` → 永久 failed。
- ASR 成功但 LLM 未配置 → 主动写 `failed` → 永久 failed。

小程序端 `class-processing` 的“重试处理”按钮调用 `advance()`→
`advanceClass(sessionId)`,这条路径在云函数侧只会读到缓存的 failed
状态立即返回,根本不会重新打 ASR。用户看到的“重试”是假的。

ASR 成功 + LLM 未配置那条尤其要紧:本轮上线后所有 session 都会落到
这条分支,但页面只能反复重试同一个无效状态。

建议(任选,需要至少做其中一项):

1. 加显式重试入参:`advanceClass({ sessionId, retry: true })` 时,
   先清掉 `asrTaskId / error / status`(或仅在 status===failed 时
   允许),再走一遍流水线。小程序端的“重试处理”要带这个参数。
2. ASR 成功但 LLM 未配置的分支单独用一个新状态值(例如
   `transcribed-pending-llm`),不要复用 `failed`,这样既不会被本
   if 短路,也能跟真失败区分。配合 F3。
3. 至少在文档 / NEXT_WINDOW 写明“当前重试入口失效,需要重新走录音
   上传 → submitClass 才能产生新 session”,避免误导真机测试。

(1) + (2) 组合最干净。

### F2(P1)并发轮询会重复触发 `CreateRecTask`

文件:[cloudfunctions/advanceClass/index.js:43-76](cloudfunctions/advanceClass/index.js#L43-L76)

进入函数时 session.asrTaskId 为空 → 解析 tempURL → 调用 ASR
→ 才把 `asrTaskId / status='transcribing'` update 回 session。
这之间没有任何锁。

小程序端处理页固定 1.5s 间隔轮询,在网络抖动 / 云函数冷启动下,第二
次 advance 完全可能在第一次 update 落库之前触发。两次都会走
`session.asrTaskId` 为空分支,各自调用 `CreateRecTask`,生成两个
任务 ID,后写入的 update 覆盖前者,导致:

- 计费多扣一次。
- 第二个 taskId 实际跑完没人轮询。
- 第一个 taskId 被覆盖丢失,无法 DescribeTaskStatus。

建议:

- 进入函数后先用 `db.collection(...).where({ _id: sessionId,
  status: 'recording-uploaded' }).update({ status: 'transcribing-claiming',
  claimedAt: now })` 做乐观锁,只有真正抢到的那一次才去调
  `CreateRecTask`。
- 或者在调用 `CreateRecTask` 之前先把 `status` 改成 `transcribing`
  + 一个临时 `lockedUntil`,失败时回滚。`ClassSession` 类型里已经
  预留了 `lockedUntil` 字段。
- 退而求其次:小程序端把轮询间隔放大到 ASR 第一阶段稳定后,但这
  只是降低概率,不解决根因。

### F3(中)ASR 成功但 LLM 未配置时复用 `failed` 状态,语义混淆

文件:[cloudfunctions/advanceClass/index.js:164-202](cloudfunctions/advanceClass/index.js#L164-L202)

ASR 成功本身是一个里程碑,但代码把它写成
`status: 'failed', error: 'ASR finished; LLM providers are not configured yet'`,
和真正的失败完全长一样。后果:

- 小程序端处理页只会显示通用 “处理失败,可以重试一次” 文案
  (上一轮审阅 F3 已经标过),用户分不清是 ASR 挂了还是只差 LLM。
- 也跟 F1 的死状态绑定:就算后面接好了 LLM,这些早期 session 也
  无法续推。
- 也跟现有类型不太一致:`ClassSessionStatus` 已经定义了
  `summarizing` / `generating-quiz`,这条分支理论上应该停在
  `summarizing-pending` 之类的“等待下游”状态。

建议:新增一个明确的中间状态(例如 `transcribed`),配合 F1 让重试
能从这一点继续往下推。

### F4(中)`submitClass` 没有幂等保护

文件:[cloudfunctions/submitClass/index.js:21-46](cloudfunctions/submitClass/index.js#L21-L46)

每次调用都新增一行 `classSessions`,不查 `recordingFileId` 是否已经
有 in-flight session。当前小程序端流程是“上传成功后调一次”,概率
低;但如果用户在处理页失败后回到录音页再次提交,或者上传 SDK 自带
重试逻辑,会出现:

- 同一录音对应多条 session。
- 每条 session 都会被 `advanceClass` 各自起一个 ASR 任务 → 多扣费 +
  课堂记录列表里出现重复节点(后续 LLM 接通时尤其明显)。

建议:`submitClass` 在 add 之前先 `where({ libraryId, recordingFileId,
status: db.command.nin(['done', 'failed']) }).get()`,有命中就直接复用
现有 sessionId。

### F5(低)`appId` 读环境变量但从未使用

文件:[cloudfunctions/advanceClass/index.js:117-126](cloudfunctions/advanceClass/index.js#L117-L126)

`TENCENT_APP_ID` 被读出来、被校验非空、放进 config 对象,然后
`createAsrTask` / `pollAsrTask` / `callTencentAsr` 都没引用它。
腾讯云 ASR `CreateRecTask` 的鉴权来自 SecretId/SecretKey,确实
不需要 AppId,所以这是个死字段。

建议:要么删掉环境变量与校验(同时改 `cloudfunctions/README.md`
环境变量清单),要么如果未来确实要往 payload 里塞 AppId 就写个
TODO 标记。当前状态会让运维以为 AppId 必填且生效。

### F6(低)步骤数组每次 update 都被整段覆盖,历史丢失

文件:[cloudfunctions/advanceClass/index.js:52-74](cloudfunctions/advanceClass/index.js#L52-L74)
和 [cloudfunctions/advanceClass/index.js:166-194](cloudfunctions/advanceClass/index.js#L166-L194)

`update({ data: { steps: [...] } })` 直接整段替换。`attempts` 永远是
1,无法看到真实重试次数;失败后想从步骤数组反推走到哪一步也只能看
最后一次写入。

`ClassSession.steps` 类型设计的本意应该是步骤累加 + attempts 自增。
当前实现把它当成 UI 状态用,失去了诊断价值。

建议:用 `db.command.push` / 单独维护 step 状态,或者至少给每个步骤
带准确的 attempts 自增计数。也可以在 F1 修完之后顺手补上,本轮单独
不阻塞。

### F7(低)`https.request` 没有显式超时

文件:[cloudfunctions/advanceClass/index.js:210-261](cloudfunctions/advanceClass/index.js#L210-L261)

只挂了 `req.on('error')`,没有 `req.setTimeout(...)`。云函数自己有
3 秒(默认)/ 最长 60 秒超时兜底,所以不会真挂死,但失败信息会比较
模糊(整个云函数超时 vs 单次 ASR 调用超时)。

建议:`req.setTimeout(10_000, () => req.destroy(new Error('Tencent
ASR request timeout')))`。

### F8(提示)`tempFileURL` 的生效时间窗

`cloud.getTempFileURL` 默认 TTL 短(微信文档说约 2 小时)。
`CreateRecTask` 是异步排队,腾讯 ASR 实际拉 URL 的时间不确定。
本轮短录音(10 分钟以内)风险很小,但如果未来跑长录音排队 1-2 小时
以上,ASR 拉文件时 URL 可能已经过期。

建议:留个 TODO,后续可在调用 `getTempFileURL` 时显式拉长 TTL
(`maxAge`),或者把这个限制写到 `tasks.md` E 阶段。

### F9(提示)签名与请求体的耦合点

`callTencentAsr` 用 `JSON.stringify(payload)` 算 hashedPayload,然后
`req.write(body)` 写同一个 body。✓ 没问题。但要注意以后**不要**在
中间插任何 transform / pretty print —— 这是 TC3 签名最常见的 bug
源头(签的体和发的体不一致)。建议在 body 行上加一行 `// must match
hashedPayload` 防止后续误改。

### F10(提示)`X-TC-Token` 未发送

如果未来切到 STS 临时凭据,要补 `X-TC-Token` 头(也要进 signed
headers 列表)。当前用永久 SecretId/SecretKey,无需。仅做提示。

## Open Questions

1. ASR 成功之后,小程序端处理页需不需要立刻把 transcript 拉到客户端
   存起来(便于 LLM 接通前先让用户看一段文字)?还是要等 LLM 总结
   出来才让用户进 `node-summary`?这决定了 F3 应该用哪个中间状态名。
2. F4 的幂等策略,是希望“同一 recordingFileId 只会有一个 session”
   还是“允许同录音多次重新生成总结”?后者需要在 `submitClass` 入参
   里加一个显式 `forceNew` 才合理。
3. 腾讯云 ASR 的 `EngineModelType` 当前默认 `16k_zh`。课堂录音是
   16kHz 还是 8kHz 由 `utils/recorder.ts` 决定,需要确认录音端配置
   与 ASR 引擎类型对得上;否则识别质量会显著下降。
4. 是否需要在云函数运行时校验 `event` 来自合法 OPENID(避免任意人
   调 `advanceClass` 反复轮询付费 ASR)?微信云函数默认有
   `cloud.getWXContext().OPENID`,可以拿来做最低限度限频。

## Test Gaps

- 真实部署一次 `submitClass` + `advanceClass`,确认 TC3 签名通过、
  `CreateRecTask` 拿到 TaskId。签名错误只会在真请求里报
  `AuthFailure.SignatureFailure`。
- 真实 ASR 短录音(30s)端到端:上传 → submitClass → 轮询 →
  ASR 成功 → session.transcript 写回。
- 并发场景:同一 sessionId 在 100ms 内调两次 advanceClass,验证
  F2 是否真的会产生两个 TaskId(可以在 `CreateRecTask` 调用前后
  插 sleep 复现)。
- 失败重试:真机里点“重试处理”按钮一次,确认 F1 描述的“失败状态
  无法被重试推动”行为(并据此排是否阻塞)。
- 长录音(10 分钟)从 CreateRecTask 排队到 DescribeTaskStatus 拿到
  success 的链路,确认 `pollAsrTask` 的状态机不会过早判 failed。
- 故意把 `TENCENT_SECRET_KEY` 改错,确认 `markFailed` 写入的错误信息
  里没有任何凭据回显。

## Verdict

**Request changes(F1、F2 是阻塞项,F3 是接 LLM 前必须解决)。**

- TC3 签名实现是干净的,密钥边界守得住,小程序端 mock 主路径不受
  影响,所以 `corepack pnpm run check` 全绿的结论可信。
- 但状态机这一块有两个真机里跑一次就会暴露的问题(F1 永久 failed、
  F2 重复 ASR 任务),建议在“云端重新部署 + 真机跑通”之前就修掉,
  不然真机测试拿到的结论会全是噪声,且每次 ASR 都在花钱。
- F3 不修也能跑通一次性的真机演示,但只要 LLM 接通就要立刻回头
  改,所以放在本轮一起处理收益更大。

## 原始审阅输出

> 本审阅完整原文即本文件 Findings / Open Questions / Test Gaps /
> Verdict 各节内容,审阅方为 Claude(Opus 4.7),由 Codex 在
> 2026-05-21 提出请求。无单独聊天稿;本文档即原始输出。
