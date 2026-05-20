# 下个窗口启动交接

> 最后同步于 2026-05-20。维护规则见 [wrap-up.md](wrap-up.md) §4。

## 当前状态(一页纸现状)

- 仓库：`https://github.com/hortonyyx/Zlzxl_dev`
- 当前分支：`main`
- `main`、`origin/main`、`feat/mvp-stage0-1` 当前指向同一提交
  `10198bc`
- 旧的 mock 体验闭环已完成并通过 GO / NO-GO：demo 库 + 自建库两条主路径
  已在微信开发者工具里跑通
- **2026-05-20 新决策：MVP 范围调整**
  - 当前最小闭环改为：课程学习模式的一节课真实链路
  - 目标流程：录音(先 10 分钟) → 转写 → 课堂输出(总结等) → 测验
  - 学习脉络、今日学习、长期复习、状态色、闪卡先不作为本轮验收范围
- 当前后端形态：所有 service 仍走 mock；尚未接微信云开发、ASR、LLM
- 当前执行阶段：阶段 A/B/C/C.5/D1 已完成；Claude 审阅已落档；
  下一步先做 D1.1“Claude 审阅阻塞修复”，再进入 D2

## 新窗口先读(按顺序)

**始终加载**：

1. `docs/ai/START_HERE.md`
2. `AGENTS.md`
3. `CLAUDE.md`(Claude Code 时)

**了解本轮做到哪**：

4. `docs/ai/session-notes.md` 末尾“2026-05-20 MVP 范围调整”段
5. `docs/specs/mvp-implementation/requirements.md`
6. `docs/specs/mvp-implementation/design.md`
7. `docs/specs/mvp-implementation/tasks.md`
8. `docs/product/prototype.html`

**旧方向参考(不要当当前主线)**：

9. `docs/specs/class-mode/`
10. `docs/product/brief.md` / `docs/product/concept.md`

**收工规范**：

11. `docs/ai/wrap-up.md`

## 当前 MVP 范围

本轮要实现的页面来自 `docs/product/prototype.html`：

- 1 `library-list`：库列表 / 首页
- 2 `library-create`：新建学习库；先不做资料上传
- 3 `library-detail` 空库态：上第一节课
- 4 `library-detail` 有课态：课程记录列表 + 开始上课；不做今日学习卡
- 5 `station-detail`：改为单节课详情
- 6 `class-record`：10 分钟录音
- 7 `class-processing`：转写 / 总结 / 测验生成进度
- 8 `node-summary`：课堂总结节点
- 10 `quiz-run`：问答测验，支持文字 + 语音答题

暂不做：

- 9 `study-node`
- 11 `flashcard-run`
- 12 `node-result` 的脉络更新语义
- 学习脉络、今日学习、到期复习、跨课记忆、掌握状态色

## 跨窗口必踩的潜规则

- `project.config.json` 的 `useCompilerPlugins` 已设为 `["typescript"]`。
  **不要改回 false**。
- 微信开发者工具**打开项目根目录**(不是 `Zlzl_miniprogram/` 子目录)。
- 页面不要直接调 `wx.request`、`wx.cloud`、storage；统一走 service / utils。
- 当前阶段不要把旧的学习脉络闭环重新加回主路径。
- 密钥只放云函数环境变量，不进小程序代码。
- 审阅必须落成 `docs/reviews/*.md` 并更新 `docs/reviews/README.md`；
  只在聊天里输出不算完成审阅。
- 审阅完成后由审阅 Agent 单独 commit；审阅提出的修订项进入下一轮开发，
  不混进审阅 commit。

## 技术约束(简化版)

- 微信原生小程序 + TypeScript + pnpm；MVP 验证前不引入跨端框架。
- 页面只做渲染 / 交互 / 生命周期；业务流程走 `services/`。
- `storage` / `toast` 走 `utils/` 封装。
- 基础检查：`corepack pnpm run check`。

## 下一步要定 / 要拿到

1. 微信云开发环境 ID，以及是否允许修改云开发相关配置。
2. ASR 服务商与凭据配置方式。
3. LLM 服务商、模型名、API Key / base URL 配置方式。
4. 一段 2-10 分钟真实课堂音频或现场录音测试材料。

## 本轮已完成

- 阶段 A：`docs/specs/mvp-implementation/` 已改为上课模式最小闭环口径。
- 阶段 B：类型和 service mock 已收敛到课堂记录 / 课堂输出 / 本节课测验。
- 阶段 C：主路径页面已改为课程记录列表、单节课详情、课堂总结、本节课问答测验。
- 阶段 C.5：`study-node`、`flashcard-run`、`node-result` 旧入口已封存。
- 阶段 D1：新增 `utils/recorder.ts`；`class-record` 支持 10 分钟本地录音、
  录音授权、计时、停止、本地临时文件展示和手动文本 fallback。
- 真机调试 `Invalid SiteMap, sitemap错误，缺少rules字段` 已修复：
  `Zlzl_miniprogram/sitemap.json` 已补 `rules`。
- 录音页导航标题已从“手动输入课堂”改为“上课录音”。
- Claude 审阅请求包已准备：
  `docs/reviews/2026-05-20_mvp-class-loop_claude_review_request.md`。
- Claude 正式审阅已落档：
  `docs/reviews/2026-05-20_mvp-class-loop_claude_review.md`。
- 审阅结论：不建议在不修 P0 的情况下进入 D2；下一轮先做 D1.1。
- `corepack pnpm run check` 已通过。
- 用户已在微信开发者工具走完主路径，反馈没问题。
- 用户已授权 DeepSeek 审阅；审阅归档于
  `docs/reviews/2026-05-20_mvp-scope-deepseek_review.md`。

## 下一步建议

进入 `docs/specs/mvp-implementation/tasks.md` 阶段 D1.1：

- 修复 10 分钟到点双停丢文件。
- 修复录音中途错误静默。
- 修复麦克风权限拒绝后的恢复路径。
- 分离录音占位提交和手动文本 fallback / `transcriptFallback` 语义。

D1.1 修完并完成验证后，再进入阶段 D2.1：

- 配置微信云开发环境 ID。
- 封装上传 service，不在页面直接散落 `wx.cloud.uploadFile`。
- 录音结束后上传到微信云存储并拿到 fileID。
- 上传失败支持重试或回到手动文本 fallback。

D2 开始前需要微信云开发环境 ID。
