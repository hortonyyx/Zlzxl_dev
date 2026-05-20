# 收工清单

一轮工作（一个执行模块、一次 mock UI 推进、一段重构、一轮文档梳理…）
**结束前**按这份清单收尾。

目的：让下一个模型 / 下一个人接手时，**只读 NEXT_WINDOW + session-notes
最新一段**就能继续，不至于踩重复的坑。

## 1. commit / push 颗粒度

- 小步提交，一个 commit 做一件事；不同类型（feat / fix / docs / chore）
  分开。
- 提交信息按 conventional commits（见
  [workflow.md](../development/workflow.md)），正文写清动机和影响，
  不复述 diff。
- 默认推到当前 feature 分支，**不直接推 `main`**。
- 多 commit 时按"feat → fix → docs"的顺序，便于 cherry-pick / revert。

## 2. PR / merge 时机

下面**全部**满足前不 merge 回 `main`：

- [ ] 当前模块的 `requirements.md` 验收项打勾。
- [ ] `corepack pnpm run check` 通过。
- [ ] 至少一轮**跨模型家族**交叉审阅完成，原文归档到 `docs/reviews/`。
- [ ] 大节点（GO / NO-GO 闸门、阶段切换）需 GPT-5.5 + Opus 双独立审阅。
- [ ] 用户最终验收（必要时：微信开发者工具走查 / 真机）。
- [ ] session-notes checkpoint 写好（见 §3）。
- [ ] 已知 bug / 待办已列入 §5。

未达到任意一条：留在 feature 分支，开 PR 等条件齐全，**不要急着 merge**。

## 3. session-notes checkpoint

在 [session-notes.md](session-notes.md) 末尾追加一段，固定结构：

```md
## YYYY-MM-DD <一轮工作主题>

- 做了什么（动词开头，3–7 条）。
- 留下了什么（已知 bug、跳过项、待审阅项）。
- 验证状态（check / 工具走查 / 真机）。
- 闸门状态（在哪步停下、下一步做什么）。
```

不要写代码细节（看 git）；写**决策和发现**。

## 4. NEXT_WINDOW.md 同步

[NEXT_WINDOW.md](NEXT_WINDOW.md) 是新窗口启动的"一页纸现状"。收工时
检查并更新：

- 当前分支 / 未 push / 未 merge 的状态。
- 当前阶段 / 闸门位置。
- 新窗口先读哪几份文档（按顺序）。
- 任何会让新窗口踩坑的"潜规则"（如 TS 编译插件、路由命名约定、
  mock 数据当前形态）。

## 5. 未完事项

写进 session-notes 当前 checkpoint 的"留下了什么"。至少覆盖：

- 已知 bug（链接到 review 文件或具体 file:line）。
- 故意跳过的项（为什么跳过 + 后续解锁条件）。
- 待审阅项（谁审、什么时候审）。
- 临时 mock / 占位代码（后续要替换的位置）。

## 6. 审阅状态

在 [docs/reviews/](../reviews/) 里检查：

- [ ] 本轮实现已被**另一个模型家族**审过。
- [ ] 审阅不是只留在聊天里，已经落成 `docs/reviews/*.md` 文件。
- [ ] 审阅原文归档为 `YYYY-MM-DD_<目标>_<审阅方>_review.md`。
- [ ] 审阅意见的处置（已合并 / 待办 / 不采纳）写在文件"处置摘要"段。
- [ ] 阻塞项已修；非阻塞项进 §5。
- [ ] [docs/reviews/README.md](../reviews/README.md) "已归档"列表里
      追加一行。
- [ ] 审阅 Agent 已为审阅节点单独 commit；修订 / bugfix 没混入审阅 commit。
- [ ] 审阅提出的修订项已进入下一轮开发计划或 session-notes 待办。

## 收工自检（60 秒过一遍）

- [ ] 跑过 `check`？
- [ ] commit / push 完？
- [ ] session-notes checkpoint 写完？
- [ ] NEXT_WINDOW.md 同步？
- [ ] 审阅归档 + reviews/README.md 列表？
- [ ] 未完事项写清？
- [ ] （大节点）PR 描述准备好？

任意一项答否：先回去补，再说"收工"。

---

跨模型协作时，**让收工的那个模型**走这份清单，不依赖人记。
