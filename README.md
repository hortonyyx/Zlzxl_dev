# Zlzl · 微信小程序 MVP

`Zlzl`（知了知了）是一款**语音优先的长周期 AI 学伴**，
定位陪伴式 AI 辅导老师，区别于工具型 AI 学习产品。
本仓库是其微信小程序 MVP 的开发主线。

- 一页纸定位：[docs/product/brief.md](docs/product/brief.md)
- 详细设计 & 决策理由：[docs/product/concept.md](docs/product/concept.md)

## 看看长什么样

浏览器直接打开（无需构建）：

- 🗺️ **产品结构总览** — [docs/product/structure.html](docs/product/structure.html)
  讲给团队听的一页纸：两大体系（知识 / 状态）、库结构、复习循环引擎、
  MVP 范围。
- 📱 **12 屏 MVP 视觉原型** — [docs/product/prototype.html](docs/product/prototype.html)
  上课模式 + 学习模式的完整体验路径（手机框 + 配色 + 组件）。
- 🧭 **架构图**（Mermaid）— [docs/product/architecture.md](docs/product/architecture.md)

## 快速开始

1. 安装微信开发者工具、Git、Node.js 24 LTS。
2. 通过 Corepack 装 pnpm：

   ```bash
   corepack pnpm install
   ```

3. 用微信开发者工具打开**项目根目录**（不是 `Zlzl_miniprogram/` 子目录）。
4. 当前 mock 阶段无需启用云开发；`project.config.json` 已配
   `"useCompilerPlugins": ["typescript"]`，工具会自动把 `.ts` 编成 `.js`。

类型检查：

```bash
corepack pnpm run check
```

## 开发原则

- TypeScript + 微信原生小程序；**MVP 验证前不引入** Taro / uni-app /
  React / Vue。
- 页面只做渲染、交互、生命周期；请求和业务流程统一放
  `Zlzl_miniprogram/services/`。
- 页面里不直接调 `wx.request` / `wx.cloud`，走 service 封装。
- 小步提交，每次提交尽量可运行。

## AI 协作入口（新窗口先读）

1. [docs/ai/START_HERE.md](docs/ai/START_HERE.md)
2. [AGENTS.md](AGENTS.md)（Codex / 通用编码 Agent）/
   [CLAUDE.md](CLAUDE.md)（Claude Code）
3. [docs/ai/context-map.md](docs/ai/context-map.md) — 项目知识索引
4. 当前功能的执行包（如 [docs/specs/class-mode/](docs/specs/class-mode/)）

## 工作流

"集中上下文 + 先计划 + 分模块执行 + 交叉审阅"，完整说明：
[docs/ai/vibe-coding-system.md](docs/ai/vibe-coding-system.md)。

每轮工作结束按 [docs/ai/wrap-up.md](docs/ai/wrap-up.md) 收工。
