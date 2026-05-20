# 下个窗口启动交接

> 最后同步于 2026-05-20。维护规则见 [wrap-up.md](wrap-up.md) §4。

## 当前状态(一页纸现状)

- 仓库:`https://github.com/hortonyyx/Zlzxl_dev`
- 当前分支:`feat/mvp-stage0-1`(已 push)
- `main` 停在 `d72db16`,**未 merge** —— 是否合并待用户决定
- 项目阶段:**MVP 阶段 2 完成,GO / NO-GO 已通过**;下一步是阶段 3
  (接微信云开发、真录音、ASR、LLM),但尚未启动
- 体验闭环:demo 库 + 自建库 两条主路径在微信开发者工具里都跑通了
- 当前后端形态:**所有 service 走 mock**(`services/cloud.ts` 的
  `useMockCloud = true`),无云函数 / ASR / LLM

## 新窗口先读(按顺序)

**始终加载**:

1. `docs/ai/START_HERE.md`(含必读管理文档清单)
2. `AGENTS.md`(Codex / 通用编码 Agent)
3. `CLAUDE.md`(Claude Code 时)

**了解本轮做到哪**:

4. `docs/ai/session-notes.md` 末尾"第一轮 MVP 收工总览"段
5. `docs/product/brief.md` / `docs/product/concept.md`
6. `docs/product/prototype.html`(浏览器开)+ `docs/product/structure.html`
7. `docs/specs/class-mode/`(双模式详细执行包) +
   `docs/specs/mvp-implementation/`(阶段总控)

**收工规范**:

8. `docs/ai/wrap-up.md`(本轮新增,**新窗口收工时必走**)

## 跨窗口必踩的潜规则

- `project.config.json` 的 `useCompilerPlugins` 已设为 `["typescript"]`。
  **不要改回 false**——否则微信开发者工具会自动生成空白 `Page({})` 模板
  覆盖你的 .ts(本轮被这事坑过,session-notes 有记)。
- 微信开发者工具**打开项目根目录**(不是 `Zlzl_miniprogram/` 子目录),
  否则丢配置。
- 所有 mock 数据集中在 `services/mock-store.ts`;读操作 / 写操作都走
  `services/cloud.ts` 的 `callCloud(name, payload, mockHandler)`,
  对接云开发时统一切真。
- 知识点 ID **稳定不变**(归一化机制)——脉络重写只动叙述,不动 ID。
- 库新建时 `mode: 'course' | 'self'`,MVP 仅 `course`;`self` 占位,
  其交互待重新设计。

## 技术约束(简化版)

- 微信原生小程序 + TypeScript + pnpm;MVP 验证前不引入跨端框架。
- 页面只做渲染 / 交互 / 生命周期;业务流程走 `services/`。
- 不直接调 `wx.request` / `wx.cloud`,统一走 `services/cloud.ts`。
- `storage` / `toast` 走 `utils/` 封装。
- 基础检查:`corepack pnpm run check`。

## 进阶段 3 前需要先定的事

1. ASR / LLM 服务商选型(`docs/specs/class-mode/requirements.md` §"待确认问题")。
2. 长录音降级方案细节(前台连续 + 分段保存 + 中断续录)。
3. D 类非阻塞项(见 `docs/reviews/2026-05-20_mvp-stage2_opus_review.md`)
   是否在阶段 3 之前顺手清掉。

## 收工规范

每轮工作结束前按 [wrap-up.md](wrap-up.md) 走一遍;尤其要**在 session-notes
追加一条 checkpoint**、**同步本文件**。
