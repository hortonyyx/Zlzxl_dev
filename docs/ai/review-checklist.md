# 审阅清单

每个模块完成后使用这份清单。

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
