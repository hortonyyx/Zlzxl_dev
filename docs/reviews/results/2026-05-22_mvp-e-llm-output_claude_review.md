# 2026-05-22 MVP 阶段 E LLM 课堂输出接入审阅结果

## 元信息

- 日期：2026-05-22
- 审阅目标：`advanceClass` 云函数 LLM 总结 / 测验生成接入
- 审阅方：Claude (Opus 4.7)
- 请求方：Codex
- 对应请求：`docs/reviews/requests/2026-05-22_mvp-e-llm-output_claude_review_request.md`
- 审阅立场：代码审阅，优先找 bug、云函数运行风险、状态机 / 幂等问题、密钥边界和 JSON 解析风险

## 处置摘要

- **上一轮 ASR 审阅的阻塞项已确认修复**：F1（failed 不可重试）已通过
  `retry: true` + `resetFailedSession` 修；F2（并发重复 CreateRecTask）已通过
  `claimAsrTask` 乐观锁修；F3（ASR 成功复用 failed）已改为停在 `transcribed`；
  F4（`submitClass` 幂等）已加 `recordingFileId` 去重；F7（ASR https 超时）已补
  10s `setTimeout`。LLM 调用也带了 25s 超时。
- **密钥边界守得住**：LLM API key 只从 `process.env` 读、只放进 `Authorization`
  头，不进日志 / 返回值 / `session.error`。无泄漏路径。
- **LLM 配置检测不会误伤 ASR**：`getLlmConfig()` 只在 `transcribed /
  summarizing / generating-quiz` 分支调用，ASR 分支完全不碰，符合要求。
- **核心幂等基本成立但不是强保证**：`claimLlmTask` 乐观锁让同一 session 正常
  情况下只有一个调用生成节点；`createClassNodeFromOutput` 内部再查一次
  `sourceSessionId` 兜底。但在“慢 LLM + 锁过期被抢”这条窄路径上，去重靠
  find-then-add，没有唯一约束，仍有极小概率重复节点（L3）。
- **本轮没有硬阻塞项**，可以进入“重新部署 + 配 LLM 环境变量 + 有声样本端到端
  复测”。但有 3 个中等项（L1 JSON 兜底掩盖坏输出、L2 classIndex 计数竞态、
  L3 残留重复节点窄竞态）建议在复测同批或下一轮修掉。
- 结论：**Approve with follow-ups（可进入真机/云端复测，带 3 中 + 若干低优修订项）**。

## Findings

### L1（中）JSON 兜底会把坏输出洗成“成功”的占位节点

文件：[cloudfunctions/advanceClass/index.js:534-595](cloudfunctions/advanceClass/index.js#L534-L595)

`parseJsonFromLlm` 解析失败时用贪婪正则 `\{[\s\S]*\}` 抓第一个 `{` 到最后一个
`}`。配合 `normalizeLlmOutput` 给每个字段都准备了 fallback / 占位文案，结果是：

- LLM 返回 `{}`、返回结构完全不对、或返回一段含花括号的废话，都不会报错。
- `normalizeLlmOutput` 把 title 填 “课堂总结”、keyPoints 填 “本节课的核心内容已
  整理。”、quiz 用 coreQuestions 或 “请说明本节课的第 N 个关键点。” 补满 3 题。
- session 被 `markDone`，节点写进 `learningNodes`，外部完全无法区分这是真总结
  还是一整页占位文案。

风险：真机复测时如果模型 / base URL / 模型名配错，或模型不肯出 JSON，用户会拿到
一个“看起来成功”的空壳课堂节点，比直接 failed 更难排查。

建议（任选其一，复测前至少做一个心理准备）：

1. 在 `normalizeLlmOutput` 里加一个最低质量闸门：例如 `raw.summary` 不是对象、或
   `quiz` 不是数组、或 `summary.full` 与 keyPoints 全空，就 `throw` 走 failed，而不是
   静默补占位。
2. 请求体加 `response_format: { type: 'json_object' }`（多数 OpenAI-compatible
   服务支持），从源头降低非 JSON 概率，再保留正则兜底（见 L9）。
3. 至少在节点上记一个 `llmDegraded: true` 之类的标记，复测时一眼能看出是否走了
   全兜底分支。

### L2（中）`classIndex` 用 `count()+1`，多 session 并发会撞号

文件：[cloudfunctions/advanceClass/index.js:623-628](cloudfunctions/advanceClass/index.js#L623-L628)

```js
const countResult = await db.collection('learningNodes')
  .where({ libraryId: session.libraryId, type: 'class' }).count();
const classIndex = (countResult.total || 0) + 1;
```

同一个 library 下两节课（两条不同 `recordingFileId` 的 session）几乎同时跑到
`createClassNodeFromOutput`，两边 count 都拿到 N，都写 `classIndex = N+1`，出现重复
课次号 / 课程记录列表序号错乱。

当前是单用户顺序上课，概率低；但“上完一节立刻上下一节、上一节还在云端处理”这种
真实操作就能触发。建议：要么用 session 上已有的稳定序号（提交时定）、要么接受 MVP
后修，但请在 `tasks.md` 标一笔。

### L3（中-低）慢 LLM + 锁过期被抢，残留重复节点窄竞态

文件：[cloudfunctions/advanceClass/index.js:355-424](cloudfunctions/advanceClass/index.js#L355-L424)、
[cloudfunctions/advanceClass/index.js:617-649](cloudfunctions/advanceClass/index.js#L617-L649)

`LLM_CLAIM_TTL_MS = 120s`，LLM HTTP 超时 25s，正常情况锁远大于操作，去重稳。
但若调用 A 抢锁后异常慢（云函数被复用、网络重传等）超过 120s 还没写节点，调用 B
会 `resetStaleLlmClaim` → 重新 `claimLlmTask` → 跑第二次 LLM。此时 A、B 都在
`createClassNodeFromOutput`，靠各自内部的 `findClassNodeIdForSession` 去重；只要两者
在对方 `add` 落库前都查了一次空，就会写出两个节点（`sourceSessionId` 没有唯一约束）。

概率很低（要求两次都接近同时完成），但属于“没有强幂等、只有 best-effort find-then-add”
的已知缺口。建议：要么把 `LLM_CLAIM_TTL_MS` 设得明显大于云函数最大超时（让锁不会在
单次执行内过期），要么在 `learningNodes` 上对 `sourceSessionId` 建唯一索引并捕获重复
写错误。本轮不阻塞。

### L4（低）LLM 环境变量配一半会把 transcribed 的 session 直接打成 failed

文件：[cloudfunctions/advanceClass/index.js:426-451](cloudfunctions/advanceClass/index.js#L426-L451)

`getLlmConfig()` 只要四个变量里有任意一个非空，就要求 `apiKey` 和 `model` 都在，
否则 `throw`。这个 throw 发生在 `main` 的 try 内 → catch → `markFailed`。也就是说
运维只配了 `LLM_PROVIDER` 忘了 KEY，所有 transcribed 的 session 会被打成 failed，
且 `retry: true` 重置回 transcribed 后会立刻再次 failed，形成“重试即失败”循环。

这本质是 fail-fast，不算 bug，但复测时容易误判成代码问题。建议把这种“配置缺失”和
“真实运行失败”区分开：配置不全时像未配置一样停在 `transcribed`（返回提示），而不是
写 failed。

### L5（低）云函数超时必须 ≥ ~30s，否则 25s LLM 超时形同虚设

文件：[cloudfunctions/advanceClass/index.js:525-527](cloudfunctions/advanceClass/index.js#L525-L527)

LLM 请求挂了 25s `setTimeout`，但微信云函数默认超时较短（常见 3s，可配到 60s）。
如果 `advanceClass` 的运行超时小于约 30s，函数会在 LLM 25s 超时触发前先被云端杀掉，
此时 session 停在 `summarizing` 且锁还在，要等 120s 锁过期才能被下一次轮询重置。
建议：在 README / `tasks.md` 写明 `advanceClass` 运行超时需调到 ≥ 30s（建议 60s），
作为复测前的部署前置。

### L6（低）`summary.full` 截断 2000 / `referenceAnswer` 截断 500 可能截断中文句子

文件：[cloudfunctions/advanceClass/index.js:551-595](cloudfunctions/advanceClass/index.js#L551-L595)

`limitText` 直接 `slice`，会在字数上限处硬切，10 分钟课堂的完整总结可能被拦腰截断，
末尾出现半句话。MVP 可接受，但若复测发现总结被切，考虑放宽上限或改为按句截断。

### L7（低）`LearningNode` 类型缺 `sourceSessionId` / `audioDuration` / `updatedAt`

文件：[cloudfunctions/advanceClass/index.js:629-646](cloudfunctions/advanceClass/index.js#L629-L646)、
[Zlzl_miniprogram/types/learning.ts:76-91](Zlzl_miniprogram/types/learning.ts#L76-L91)

云函数写入节点带了 `sourceSessionId`、`audioDuration`、`updatedAt` 三个字段，但
`LearningNode` 接口里没有。DB 不报错，但后续接 `getLearningNode` / `listClassNodes`
读取函数时这几个字段是无类型的，幂等查询又依赖 `sourceSessionId`。建议在做读取云函数
那一轮，把 `sourceSessionId`（至少）补进 `LearningNode` 类型。`ClassSummary` 和
`QuizQuestion` 字段已对齐，无问题。

### L8（低）LLM 返回字面量 `null` 时 `normalizeLlmOutput` 抛 TypeError

文件：[cloudfunctions/advanceClass/index.js:534-552](cloudfunctions/advanceClass/index.js#L534-L552)

`parseJsonFromLlm("null")` 返回 `null`，`normalizeLlmOutput(null)` 读 `raw.title`
会抛 “Cannot read properties of null”。最终被 main catch → markFailed，不会崩函数，
但错误信息不友好。建议在 normalize 入口加 `if (!raw || typeof raw !== 'object')
throw new Error('LLM output is not an object')`，顺带覆盖数组 / 数字 / 字符串的退化情况。

### L9（提示）未使用 `response_format: json_object`

`callLlmChatCompletion` 只靠 system/user prompt 约束“只返回 JSON”。对支持的
OpenAI-compatible 服务，加 `response_format: { type: 'json_object' }` 能显著降低非
JSON 概率（与 L1 配套）。注意部分服务商不支持该参数会报错，可按 `provider` 条件开启。

### L10（提示）几处历史遗留 / 死代码

- `advanceLlm` 开头 `if (session.nodeId)`（[index.js:356](cloudfunctions/advanceClass/index.js#L356)）：
  `nodeId` 只在 `markDone` 与 `status='done'` 一起写，而 done 在 `main` 已短路返回，
  这条分支实际不可达，属无害死代码。
- 上轮 F5（`TENCENT_APP_ID` 读取并校验但从未使用）仍在
  （[index.js:261-269](cloudfunctions/advanceClass/index.js#L261-L269)）。
- 上轮 F6（`steps` 每次整段覆盖、`attempts` 恒为 1）在 LLM 各 update 里同样存在，
  诊断价值仍缺失。
- 三项都不阻塞，建议合到后续清理轮。

## Open Questions

1. L1 的兜底策略，产品上希望“宁可给占位也别 failed”还是“宁可 failed 让用户重试”？
   这决定 L1 选闸门方案还是标记方案。
2. 空 transcript（静音录音，ASR 返回 `""`）当前在 LLM 步直接 throw → failed
   （[index.js:376-379](cloudfunctions/advanceClass/index.js#L376-L379)）。这是预期吗？
   还是想在更早的 ASR 成功阶段就提示用户“没识别到内容”？
3. 是否需要对 `advanceClass` 调用方做 OPENID 限频（防止有人反复轮询付费 ASR/LLM）？
   上轮 Open Question 4 提过，本轮接了付费 LLM 后更值得定。
4. `learningNodes.sourceSessionId` 是否要建唯一索引（配合 L3）？这会把 best-effort
   幂等升级成强幂等。

## Test Gaps

- 配齐 LLM 环境变量后，用有声 10–30s 录音端到端：transcript → summary（full /
  keyPoints / coreQuestions）→ 3 道 quiz → `learningNodes` 写入，确认字段齐全且
  非占位。
- 故意把 `LLM_MODEL` 配成不存在的模型 / `LLM_API_KEY` 配错 / base URL 配错，确认：
  (a) session 进入可理解的 failed；(b) `session.error` 里没有任何 key 回显；
  (c) 不会因为 L1 洗成“成功的占位节点”。
- 让模型返回非 JSON（或被 markdown 包裹的 JSON），确认正则兜底行为，并据 L1 判断是否
  需要质量闸门。
- `retry: true` 从 LLM 失败态恢复：确认回到 `transcribed` 重跑 LLM，且**不**重新创建
  腾讯云 ASR task（验证 `asrTaskId` 未被清、未重新 CreateRecTask）。
- 同一 `sessionId` 100ms 内并发调两次 `advanceClass`，确认只产生一个 `learningNodes`
  节点（可在 `createClassNodeFromOutput` 前插 sleep 复现 L3 窄竞态）。
- 同一 library 下两条不同录音几乎同时处理，确认 `classIndex` 是否撞号（L2）。
- 把 `advanceClass` 运行超时调到 < 30s 跑一次，确认 L5 描述的“函数先于 LLM 超时被杀、
  session 卡 summarizing 等锁过期”行为，据此设置部署超时。

## Verdict

**Approve with follow-ups（可进入云端重新部署 + LLM 环境变量配置 + 有声样本端到端复测）。**

- 上一轮 ASR 的 P1 阻塞项（F1/F2/F3/F4/F7）已确认修复，密钥边界干净，LLM 配置检测
  不误伤 ASR，幂等在正常路径成立，`corepack pnpm run check` / `node --check` 全绿可信。
- 本轮没有“跑一次就必炸”的硬阻塞项，但 L1（坏输出被洗成成功占位）会直接影响复测的
  可观测性，建议复测前就决定质量闸门策略；L2、L3 是并发下的真实缺口，单用户顺序操作
  概率低，可同批或下一轮修。
- L5 是部署前置（云函数超时 ≥ 30s），不是代码改动，但不设会让复测结论变噪声。

## 原始审阅输出

> 本审阅完整原文即本文件 处置摘要 / Findings / Open Questions / Test Gaps /
> Verdict 各节内容，审阅方为 Claude（Opus 4.7），由 Codex 在 2026-05-22 提出请求。
> 无单独聊天稿；本文档即原始输出。
