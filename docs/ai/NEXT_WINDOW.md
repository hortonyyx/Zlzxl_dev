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
- 当前执行阶段：阶段 A/B/C/C.5/D1/D1.1/D2.1/D2.2/D2.3 已完成；
  阶段 E 前置云函数骨架已完成，下一步需要 ASR / LLM 服务商与凭据配置

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
- 开发 Agent 完成小节点后，审阅请求包落到 `docs/reviews/requests/`。
- 审阅结果必须落成 `docs/reviews/results/*.md` 并更新 `docs/reviews/README.md`；
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
  `docs/reviews/requests/2026-05-20_mvp-class-loop_claude_review_request.md`。
- Claude 正式审阅已落档：
  `docs/reviews/results/2026-05-20_mvp-class-loop_claude_review.md`。
- 审阅结论：不建议在不修 P0 的情况下进入 D2；D1.1 代码修复和交叉审阅已完成，
  仍需真机验证。
- 阶段 D1.1：修复录音到点双停竞争、录音中途错误静默、拒绝权限恢复路径、
  录音占位与手动文本 fallback 语义混用、WXML 写死进度常量、页面模块作用域计时器。
- `corepack pnpm run check` 已通过。
- 用户已在微信开发者工具走完主路径，反馈没问题。
- 用户已授权 DeepSeek 审阅；审阅归档于
  `docs/reviews/results/2026-05-20_mvp-scope-deepseek_review.md`。
- D1.1 审阅请求包已准备：
  `docs/reviews/requests/2026-05-20_mvp-d1-1-recorder_claude_review_request.md`。
- D1.1 Claude 审阅已落档：
  `docs/reviews/results/2026-05-20_mvp-d1-1-recorder_claude_review.md`。
  结论：无代码层阻塞项，可在真机验证通过后进入 D2.1；
  提出 1 中（M1 中断后 onStop 重入）+ 5 低优修订项。
- D1.1 审阅后小修已完成：丢弃错误 / 中断后晚到的 `onStop`，增加同步 stop 锁，
  `submitClass` 改为对象入参，导入别名降低同名误读风险，并补充中断不自动恢复说明。
- D1.1 人工验证反馈：
  - 1 分钟手动停止通过。
  - 10 分钟自动停止后文件未丢，但显示时长被微信 `file.duration` 带偏成 3 分多钟；已修为使用页面墙钟时长。
  - 切后台无阻塞，后台继续录音。
  - 麦克风拒绝 / 恢复路径尚未覆盖。
  - 手动文本 fallback 功能正常但入口不显眼；已加“备用入口”标识并优化按钮。
  - `class-processing` 旧“知识点提取 / 脉络重写”文案已改为“转写 → 总结 → 生成测验”。
- D1.1 复测已通过：10 分钟显示 `10:00`，麦克风权限恢复路径通过。
- D2.1 已启动：
  - 新增 `constants/cloud.ts` 集中配置 `CLOUD_ENV_ID`。
  - `app.ts` 在配置环境 ID 后初始化 `wx.cloud`。
  - 新增 `services/upload.ts`，封装 `uploadClassRecording()`，云路径为
    `class-recordings/{libraryId}/{timestamp}.mp3`，返回 `recordingFileId` 和基础元信息。
  - `CLOUD_ENV_ID` 已配置为 `cloud1-d3g0s64t152b5a542`。
- D2.2 代码已完成：
  - 录音完成后自动上传到微信云存储。
  - 上传中显示进度。
  - 上传成功后显示 fileID。
  - 上传失败可重试，手动文本 fallback 仍保留。
- D2.1/D2.2 真机验证已通过：
  - 29 秒录音上传成功。
  - 已拿到云存储 fileID：
    `cloud://cloud1-d3g0s64t152b5a542.636c-cloud1-d3g0s64t152b5a542-1435119207/class-recordings/lib-1779279672591-1/1779279714926.mp3`
  - 上传后可进入 mock 处理页。
- D2.3 代码已完成：
  - 上传成功时用 `recordingFileId` 调 `submitClass`。
  - mock session / class node 保留 `recordingFileId`。
  - 上传失败 / 未上传时仍保留本地录音占位兜底。
  - `transcriptFallback` 继续只服务手动文本 fallback。
- D2.3 真机验证已通过：
  - 录音 → 上传 → mock 课堂总结 → 本节课测验主路径可走通。
  - 当前总结 / 转写 / 测验仍是 mock，不是真 ASR / LLM。
- 阶段 E 前置已完成：
  - `project.config.json` 新增 `cloudfunctionRoot: "cloudfunctions/"`。
  - 新增 `cloudfunctions/submitClass/` 和 `cloudfunctions/advanceClass/` 骨架。
  - `advanceClass` 已定义 `recordingFileId` → 临时下载 URL → ASR → LLM 的入口契约。
  - 真实 ASR / LLM 尚未配置，云函数不会假装生成真实结果。

## 下一步建议

继续阶段 E：

- 确定 ASR 服务商、API key、base URL。
- 确定 LLM 服务商、模型名、API key、base URL。
- 在云函数环境变量配置密钥。
- 把 `advanceClass` 从骨架接成真实 ASR → 总结 → 测验生成。
