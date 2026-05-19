# 下个窗口启动交接

## 当前状态

- GitHub 仓库已建立并绑定：`https://github.com/hortonyyx/Zlzxl_dev.git`
- 默认分支：`main`
- 项目类型：微信原生小程序 MVP。
- 小程序源码目录：`Zlzl_miniprogram/`
- 微信开发者工具打开目录：项目根目录 `C:\Users\Horton\Desktop\Zlzxl_dev`，不要打开子目录。
- 当前使用测试号/当前 AppID 配置即可，暂不做多端产品框架。
- 文档和管理上下文已中文化。
- 当前工作流：集中上下文、先计划、分模块执行、交叉审阅。

## 新窗口先读

1. `docs/ai/START_HERE.md`
2. `AGENTS.md`
3. `docs/ai/context-map.md`
4. `docs/ai/vibe-coding-system.md`
5. `docs/product/brief.md`
6. `docs/product/backlog.md`

如果用 Claude Code，也读：

- `CLAUDE.md`

## 技术约束

- 微信小程序 MVP 优先。
- 使用微信原生小程序 + TypeScript。
- MVP 验证前不引入 Taro、uni-app、React、Vue 或其他跨端框架。
- 页面保持轻量。
- 请求放 `Zlzl_miniprogram/services`。
- storage/toast 等平台能力先走 `Zlzl_miniprogram/utils` 封装。
- 使用 `corepack pnpm run check` 做基础类型检查。

## 正式开发第一步建议

先不要直接写业务代码。建议先完成：

1. 在 `docs/product/brief.md` 写清楚 MVP 目标、目标用户、核心用户路径。
2. 在 `docs/product/backlog.md` 写第一批功能优先级。
3. 为第一个功能创建执行包：
   - `docs/specs/<feature>/requirements.md`
   - `docs/specs/<feature>/design.md`
   - `docs/specs/<feature>/tasks.md`
4. 审完计划后，再让 Codex 或 Claude Code 按模块实现。

## 当前验证

已通过：

```bash
corepack pnpm run check
```

已推送到 GitHub：

```bash
git push -u origin main
```
