# 审阅记录

这里存放交叉审阅与里程碑审阅的完整存档，便于跨模型 / 跨人协作追溯。

## 目录

- `requests/`：审阅请求包。开发 Agent 完成一个小节点、需要另一个模型家族交叉审阅时，先在这里落请求文档。
- `results/`：审阅结果归档。审阅 Agent 完成审阅后，把原始审阅意见和处置摘要落在这里。

## 硬规则

- 所有审阅请求必须以文档形式落在 `docs/reviews/requests/`，不能只留在聊天里。
- 所有审阅结果必须以文档形式落在 `docs/reviews/results/`，不能只保留聊天输出。
- 未归档为 `docs/reviews/results/*.md` 的审阅，不算通过交叉审阅闸门。
- 如果审阅方只在聊天里输出，由当前执行 Agent 负责整理成结果文件。
- 每个审阅结果文件必须保留原始审阅意见，并写明处置摘要。
- 本 README 的“审阅请求”和“审阅结果”列表必须同步更新。
- 审阅完成后由审阅 Agent 提交一次 commit，视为完成一个审阅节点。
- 审阅节点 commit 只包含审阅结果归档、处置摘要、索引和必要交接文档更新。
- 审阅提出的修订项进入下一轮开发，不混入审阅 commit。

推荐文件名：

```text
requests/YYYY-MM-DD_<目标>_<期望审阅方>_review_request.md
results/YYYY-MM-DD_<目标>_<审阅方>_review.md
```

审阅请求建议包含：

1. 元信息：日期、审阅对象、期望审阅方、请求方、审阅立场。
2. 背景：为什么请求审阅、上一轮结论、当前范围和不审什么。
3. 请先读：管理文档、执行包、关键代码、相关历史审阅。
4. 本轮已改：开发 Agent 的改动摘要。
5. 验证：已跑检查和仍需人工验证项。
6. 请重点审阅：希望审阅 Agent 重点看的风险。
7. 期望输出：结果文件路径和输出格式。

审阅结果建议包含：

1. 元信息：日期、审阅目标、审阅方、请求方、对应请求。
2. 处置摘要：哪些已采纳合并、哪些待办、哪些不采纳及理由。
3. 原始审阅输出：审阅方的完整原文，不要只留摘要。

## 审阅请求

- `requests/2026-05-20_mvp-class-loop_claude_review_request.md` — 上课模式最小闭环 A/B/C/C.5/D1，Claude 审阅请求包。
- `requests/2026-05-20_mvp-d1-1-recorder_claude_review_request.md` — D1.1 录音阻塞修复，Claude 审阅请求包。
- `requests/2026-05-21_mvp-e-processing-polling_claude_review_request.md` — 阶段 E 处理页轮询与失败重试，Claude 审阅请求包。

## 审阅结果

- `results/2026-05-19_concept_deepseek_review.md` — 产品概念，DeepSeek 审阅。
- `results/2026-05-19_class-mode_codex_review.md` — 上课模式 MVP 执行包，Codex 审阅。
- `results/2026-05-19_mvp-stage0-1_opus_review.md` — MVP 阶段 0/1 实现，Opus 审阅。
- `results/2026-05-20_mvp-stage2_opus_review.md` — MVP 阶段 2 mock UI 主路径，Opus 审阅。
- `results/2026-05-20_mvp-scope-deepseek_review.md` — MVP 范围调整与阶段 D 前置条件，DeepSeek 审阅。
- `results/2026-05-20_mvp-class-loop_claude_review.md` — 上课模式最小闭环 A/B/C/C.5/D1，Claude 审阅。
- `results/2026-05-20_mvp-d1-1-recorder_claude_review.md` — D1.1 录音阻塞修复，Claude 审阅。
- `results/2026-05-21_mvp-e-processing-polling_claude_review.md` — 阶段 E 处理页轮询与失败重试，Claude 审阅。
