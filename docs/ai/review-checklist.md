# 审阅清单

每个模块完成后使用这份清单。

## 归档硬规则

- 审阅意见**必须落成文档**，不能只停留在聊天输出。
- 审阅文件统一放在 `docs/reviews/`。
- 文件名格式：`YYYY-MM-DD_<目标>_<审阅方>_review.md`。
- 审阅文件至少包含：
  - 元信息：日期、审阅目标、审阅方、触发原因。
  - Findings：按严重程度排序，带文件路径和行号；无问题也要写明。
  - Open Questions：需要用户或产品确认的问题。
  - Test Gaps：缺少的自动 / 微信开发者工具 / 真机验证。
  - Verdict：是否可进入下一阶段。
  - 处置摘要：已修 / 待办 / 不采纳及理由。
- `docs/reviews/README.md` 的“已归档”列表必须同步追加。
- 未归档到 `docs/reviews/` 的审阅，不算完成交叉审阅闸门。
- 审阅完成后，由**审阅 Agent** 提交一次 commit，视为完成一个审阅节点。
- 审阅发现的修订 / bugfix / 设计调整，默认进入下一轮开发任务；不要混进审阅 commit。
- 审阅 commit 只包含审阅归档、处置摘要、索引和必要交接文档更新。

## 范围

- 改动是否匹配已批准的 `tasks.md` 条目？
- 是否避免了无关重构？
- 是否保留了用户或其他 Agent 的已有改动？

## 架构

- 页面是否保持轻量？
- API 调用是否放在 `Zlzl_miniprogram/services`？
- 缓存操作是否放在 `Zlzl_miniprogram/utils/storage.ts`？
- toast 是否使用 `Zlzl_miniprogram/utils/toast.ts`？
- 共享类型是否放在 `Zlzl_miniprogram/types`？

## 可靠性

- 相关场景是否处理 loading、empty、error、success 状态？
- 异步失败是否被处理？
- API 响应结构是否有类型？
- 有没有可能模拟器通过但真机失败？

## 多设备开发

- 路径大小写是否一致，避免 macOS/Linux 问题？
- 换行符是否统一？
- 本机配置是否被忽略？
- 如果依赖变化，lockfile 是否同步提交？

## 验证

- 如可用，已运行 TypeScript、lint 或 build。
- 已列出微信开发者工具手动检查项。
- 面向用户的流程已列出真机检查项。
