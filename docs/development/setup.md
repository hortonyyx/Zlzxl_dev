# 开发环境配置

## 必备工具

Windows 和 macOS 都安装同一套核心工具：

- 微信开发者工具
- Git
- Node.js 24 LTS
- pnpm 9.15.0
- VS Code、Cursor、Codex 或 Claude Code

## Node 版本

项目使用 `.node-version`：

```text
24
```

推荐版本管理工具：

- Windows：fnm 或 nvm-windows
- macOS：fnm 或 nvm

## 安装依赖

```bash
corepack pnpm install
```

## 用微信开发者工具打开

用微信开发者工具打开仓库根目录。

如果工具询问开发语言，选择 TypeScript。

不要提交 `project.private.config.json`。
