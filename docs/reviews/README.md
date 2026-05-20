# 审阅记录

这里存放交叉审阅与里程碑审阅的**完整存档**,便于跨模型 / 跨人协作追溯。

## 硬规则

- 所有审阅都必须以文档形式落在本目录，不能只保留聊天输出。
- 未归档为 `docs/reviews/*.md` 的审阅，不算通过交叉审阅闸门。
- 如果审阅方只在聊天里输出，由当前执行 Agent 负责整理成文件。
- 每个审阅文件必须保留原始审阅意见，并写明处置摘要。
- 本 README 的“已归档”列表必须同步更新。
- 审阅完成后由审阅 Agent 提交一次 commit，视为完成一个审阅节点。
- 审阅节点 commit 只包含审阅归档、处置摘要、索引和必要交接文档更新。
- 审阅提出的修订项进入下一轮开发，不混入审阅 commit。

推荐文件名（含审阅方,以区分同一目标的多轮审阅）：

```text
YYYY-MM-DD_<目标>_<审阅方>_review.md
```

每个审阅文件建议包含三块：

1. **元信息**：日期、审阅目标、审阅方（模型 / 人）、撰写方、触发原因。
2. **处置摘要**：哪些已采纳合并、哪些待办、哪些不采纳及理由。
3. **原始审阅输出**：审阅方的完整原文,不要只留摘要。

## 已归档

- `2026-05-19_concept_deepseek_review.md` — 产品概念,DeepSeek 审阅。
- `2026-05-19_class-mode_codex_review.md` — 上课模式 MVP 执行包,Codex 审阅。
- `2026-05-19_mvp-stage0-1_opus_review.md` — MVP 阶段 0/1 实现,Opus 审阅。
- `2026-05-20_mvp-stage2_opus_review.md` — MVP 阶段 2 mock UI 主路径,Opus 审阅。
- `2026-05-20_mvp-scope-deepseek_review.md` — MVP 范围调整与阶段 D 前置条件,DeepSeek 审阅。
- `2026-05-20_mvp-class-loop_claude_review_request.md` — 上课模式最小闭环,Claude 审阅请求包。
- `2026-05-20_mvp-class-loop_claude_review.md` — 上课模式最小闭环 A/B/C/C.5/D1,Claude 审阅。
