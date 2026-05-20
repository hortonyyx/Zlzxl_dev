# 审阅存档 · MVP 阶段 2 Mock UI 主路径 · Opus

## 元信息

- 日期:2026-05-20
- 审阅目标:分支 `feat/mvp-stage0-1` 上的阶段 2(commits `9a8ba29` 修地基 +
  `0a69fa7` mock UI 主路径)
- 审阅方:Opus / Claude 家族
- 撰写方:Opus
- 触发:Codex 完成阶段 2,按工作流交另一模型家族做 GO / NO-GO 前的复审

## 处置摘要

- **GO/NO-GO 之前应先修(否则会误导体验判断)**:
  1. quiz-run 页直接展示 `expectedAnswer`——"测验"等于直接看答案,没有作答感。
  2. flashcard-run 页没有翻卡、没有按卡自评,只一个"全部记得"按钮。
  3. station-detail 过滤逻辑错误,会显示不属于该站点的知识点。
  4. "本次更新"文案在复习/测验之后**不更新**,最显眼的陪伴语句感知不到 delta。
- **不阻塞 GO/NO-GO,但建议下一轮一起修**:
  5. library-list 卡片"掌握分布微条"是 3 段固定色块,不反映实际比例。
  6. 路由栈出现重复 `library-detail`,返回键会落到 stale 页。
  7. node-summary 的"开始课后测验"复用了 `planStudy`,语义被并入"今日学习",
     不再是"本节核心问题的测验"。
  8. 视觉极简(panel + 文字)与 `prototype.html` 视觉差距大,会影响"脉络是否
     让人喜欢"的主观判断。
- **承认是 mock 局限,记录即可**:processing 页瞬态闪过、quiz 评分硬编码
  "最后一题错"、转写稿/纠错入口为占位文字、研学节点重复创建堆积。
- **地基修复回执**:上一轮提出的 Q3 demo 数据、Q2 复用退化、读操作走
  `callCloud`、`Node` 别名,**全部已修**。

## 原始审阅输出

### A. 体验链路 —— 跑得通

技术上整条主路径可走:

- Demo 路径:库列表 → 设计史 Demo → 库主页(脉络 + 学伴便签)→ 开始今日学习
  → study-node(plan rationale + 两个模块)→ 测验 → 节点结果 → 回库主页
  (站点颜色已更新)。
- 空库路径:库列表 → 新建 → 空库引导 → 手动输入课堂 → processing → 课堂总结
  → 开始测验 → 节点结果 → 回库(脉络出现第 1 站)。

跨页路由参数完整传递(`libraryId` / `nodeId` / `studyNodeId` / `moduleType`),
所有跳转都走 `constants/routes.ts`。WXML 没有明显的 runtime 报错隐患(几处
`mailuo.*` 在 null 时会有空读,小程序会容忍不崩,可加 `mailuo &&` 守卫)。

`corepack pnpm run check` 通过(已由实现方运行)。

### B. 业务是否落在 services —— 符合约束

页面只做 `setData` / 事件 / 路由;业务流(归一化、状态计算、信号回写、
脉络重写)都在 services。少量 view-model 构造(`library-list` 的
`statusText`、`study-node` 的 `ModuleView`)留在 page,合理,不算"页面过重"。

### C. 应在 GO/NO-GO 之前先修的 4 处

#### C1 · quiz-run 直接显示参考答案,没有作答感

[`pages/quiz-run/index.wxml:7`](Zlzl_miniprogram/pages/quiz-run/index.wxml#L7)
渲染了 `expectedAnswer`——用户打开测验就看到了答案。模块的"测验感"完全
没有。这一点会让走查的人立刻得出"测验体验不成立"的错误结论。

最薄修法:把 `expectedAnswer` 藏起来(改成"提交后展示");按钮文案改成
"我答对了 / 不会"二选一,把 pass 由用户点定。不需要真输入框,先把"作答—
得到反馈"的节奏跑出来即可。

#### C2 · flashcard-run 没有翻卡、没有按卡自评

[`pages/flashcard-run/index.wxml`](Zlzl_miniprogram/pages/flashcard-run/index.wxml)
把 `front` 和 `back` 同屏显示,然后一个"全部记得"按钮一锅端。完全没有
prototype 里"翻卡 → 自评 记得/没记住"的核心交互。

最薄修法:每张卡先只显示 `front`,点击或"翻面"按钮显示 `back`,然后两个
按钮"记得 / 没记住";收集每卡的自评再提交。

#### C3 · station-detail 过滤逻辑错

[`pages/station-detail/index.ts:22`](Zlzl_miniprogram/pages/station-detail/index.ts#L22):

```ts
const stationPoints = node
  ? points.filter((point) => point.firstSeenNodeId === node._id || point.relatedIds.length > 0)
  : [];
```

`relatedIds.length > 0` 会放进所有带链接的知识点——demo 库里几乎所有点都
有链接,这个站点会显示一堆不属于它的知识点。

正确做法:用 `getMailuo(libraryId)` 拿到 mailuo,从 `mailuo.stations` 里找
本 station 的 `knowledgePointIds`,再用这个 id 集合从所有 points 里过滤。
或者在 onLoad 时同时拿 mailuo,直接查 station.

#### C4 · "本次更新"复习后不变,削弱记忆证据

`updateMailuoAfterClass` 会在每节课后更新 `latestUpdateNote`(class-session.ts:169),
但 `mockGradeModule`(module.ts:34)做完信号回写后**不更新** mailuo 的 note。
走查时,用户做完测验回库主页,会看到:站点颜色变了(对),但"本次更新"
文案是上节课的旧内容(错)。最显眼的陪伴语句没有"我看到你刚才……"的回声,
"记忆证据"这一条体验上就站不住。

最薄修法:`mockGradeModule` 完成后,调用一个小工具更新当前 library mailuo
的 `latestUpdateNote`(比如"你刚把 X 推到绿,Y 还需要再来一次")和
`updatedAt`,以及 `observations`。

### D. 不阻塞,但建议下一轮一起修

- **D1 · library-list 卡片掌握分布条**(library-list/index.wxml:22–26):
  三段 `.bar-green/.bar-yellow/.bar-gray` 是固定 div,所有卡片长一样,
  不反映实际比例。下面的文字"绿 N · 黄 N · 灰 N"是真数据,但视觉条不是。
  改成 inline style 按比例分宽即可,几行事。

- **D2 · 路由栈重复**:`library-detail` 用 `wx.navigateTo` 进,后续模块
  用 `wx.redirectTo` 回 `library-detail`——栈里出现两次 `library-detail`,
  back 键会回到 stale 的那个。短期可在结果页用 `wx.navigateBack({delta:N})`
  回到第一个 detail,长期看是导航模型问题。

- **D3 · node-summary 的"开始课后测验"**(node-summary/index.ts:33):
  调用了 `planStudy(libraryId)`,等于"今日学习"。但 prototype 的"课后测验"
  是对本节课核心问题的针对性测验,语义不同。mock 阶段可接受,但要在
  session-notes 标记"课后测验语义被并入今日学习,后续要拆"。

- **D4 · 视觉与 prototype 差距大**:WXSS 是基础 panel 样式,与
  `prototype.html` 的卡片 / 学伴气泡 / 状态点 / 路径渲染差异显著。GO/NO-GO
  关注的是"脉络是否让人想用",视觉太朴素会拖累主观判断。这一轮不一定要
  补全,但走查时心里要扣这部分干扰。

### E. 承认是 mock 限制,记录即可

- `mockSubmitManualClass` 把 session 直接置 `done`,processing 页瞬态闪过——
  原本就是这样,不修。
- `quiz-run` 的 grading 是 `pass: index !== questions.length - 1`(硬编码
  "最后一题错"),用来制造状态变化。可接受。
- `node-summary` 完整转写稿 / 纠错入口是占位文字,与设计一致。
- 每次进 `library-detail` 点"今日学习"会创建一个新 study-node,mock 里堆积,
  无功能影响。

### F. 上一轮地基修复回执

上一轮(`2026-05-19_mvp-stage0-1_opus_review.md`)提的全部已修:

- ✅ Q3 demo 数据:station 1 只挂 `kp-bauhaus`(绿),不再被 `kp-modernism`
  拖黄;station 2/3 保留黄,呈现合理进展。
- ✅ Q2 跨课复用:`upsertClassKnowledgePoints` 改成 main + bridge + new 三点
  结构,第二节课复用 main + bridge,relatedIds 互链。退化感弱了。
- ✅ 读操作:`listLibraries` / `getLibrary` / `getMailuo` /
  `listKnowledgePoints` / `listMasterySignals` / `getStudyNode` /
  `getLearningNode` / `getQuizQuestions` / `getFlashcards` /
  `getClassSession` 全部走 `callCloud`,迁移面收敛。
- ✅ `Node` 别名已删除(types/learning.ts)。
- ✅ `module.ts` 新增 `moduleResultsByNode` 给 `node-result` 页读结果——
  合理设计。
- ✅ 新增 `services/node.ts` 单独提供 `getLearningNode`,分层干净。

## 结论

阶段 2 mock UI 主路径**逻辑完整、地基修复到位、12 页都连通服务**,可以进
GO/NO-GO 验收。但**强烈建议先修 C1–C4 再走查**——这 4 条不修,走查的人
会因为"模块根本不像模块"和"本次更新感受不到 delta",对产品概念本身得出
错误结论。这正是 mock-first 策略最怕的失败模式:体验薄到把信号埋掉。

C1–C4 总改动量小(每条几十行内),建议作为"GO/NO-GO 前最后一打磨"半轮
让 Codex 处理。D 类可同轮顺手或延后。

本轮为只读审阅;`corepack pnpm run check` 由实现方运行通过,本次未重跑。

---

## 复审 · C1–C4 修复验证(2026-05-20,commit `dbbbd29`)

| # | 修复 | 验证 |
|---|---|---|
| C1 | quiz-run 移除 `expectedAnswer` 展示,改为 `textarea` 作答 + 提交 | ✅ 输入 ≥8 字判通过,有真实作答节奏 |
| C2 | flashcard-run 改逐张翻卡 + 按卡自评"记得/还不稳" | ✅ 卡片有 `revealed` 状态,每张独立打分,合理 |
| C3 | station-detail 改用 `mailuo.station.knowledgePointIds` 精确过滤 | ✅ 只展示本站点的知识点,bug 消除 |
| C4 | `mockGradeModule` 后调用 `updateMailuoAfterModule` 改写 `latestUpdateNote` + observations | ✅ 复习后回库可以看到"本次更新"刷新 |
| 顺手 | `library-detail.wxml` 加 `mailuo` null 守卫 | ✅ |

非阻塞小观察:

- `updateMailuoAfterModule` 在 `answers.map` 内被**每条信号触发一次**,
  最后一条 answer 的 `pass` 决定 `latestUpdateNote` 里"通过/薄弱"的措辞,
  不是整体汇总。mock 阶段可接受,后续如要更准可改成 map 外汇总一次。
- `observations` 在每次 grade 时被整体覆写,demo 库原有的"你对'风格如何
  变成身份'还不稳定"会丢。`unresolved` 保留了,影响有限。

可进入微信开发者工具走查 / GO–NO-GO 判断。D 类项未处理,不影响判断,
走查时心里扣掉即可。
