# 云函数

本目录存放微信云开发云函数。密钥只通过云函数环境变量读取，不进入小程序代码。

## 当前阶段

阶段 E 前置已创建最小骨架：

- `submitClass`：接收 `libraryId` 和 `recordingFileId`，返回待处理 session 占位。
- `advanceClass`：定义 `recordingFileId -> 临时下载 URL -> ASR -> LLM` 的推进入口。

真实 ASR / LLM 服务商、模型和凭据确定后，再在云函数内部接入。

## 需要配置的环境变量

后续接真服务时再配置：

- `ASR_PROVIDER`
- `ASR_API_KEY`
- `ASR_API_BASE_URL`
- `LLM_PROVIDER`
- `LLM_API_KEY`
- `LLM_API_BASE_URL`
- `LLM_MODEL`
