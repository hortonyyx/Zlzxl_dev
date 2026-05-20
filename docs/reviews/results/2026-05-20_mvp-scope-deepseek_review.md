# 2026-05-20 MVP 范围调整 DeepSeek 审阅

## 元信息

- 日期：2026-05-20
- 审阅目标：上课模式最小闭环 MVP 的阶段 A/B/C 改动与阶段 D 前置条件
- 审阅方：DeepSeek v4 flash
- 触发原因：用户授权外部模型审阅当前范围调整

## 处置摘要

已采纳：

- 阶段 D 拆成更小任务包：D1 录音基础、D2 云存储上传、D3 上传后课堂提交。
- 在设计文档补充录音格式、文件生命周期、上传失败处理。
- 澄清 `transcriptFallback` 仅为开发兜底文本，不是课程资料上传。
- 增加 C.5 任务：封存旧学习模式入口，避免旧页面被 URL 直达后产生误导。

暂缓：

- 分片 / 断点续传：当前录音上限为 10 分钟，先用微信云存储单文件上传；
  若真机文件大小或网络失败率不可接受，再升级为分段 / 断点方案。

## 原始审阅输出

### 1. Scope Contradictions

`services/class-session.ts` – `submitClass` accepts `transcriptFallback?` but the
MVP scope explicitly removed "course material uploads." If `transcriptFallback`
is meant for typed notes, this is fine. If it implies file upload, it contradicts
scope. Clarify intended use.

`services/module.ts` – `getClassQuizQuestions` and `gradeQuizAnswer` are added
alongside old `getQuizQuestions`/`gradeModule`. The old endpoints reference
"module" which is not defined in the new class-mode scope. This creates ambiguity
about which path quiz operations should use.

### 2. Missing Blockers Before Real Recording/Upload (Phase D)

- No audio format/compression spec – Real 10-min recording needs codec, max size,
  sample rate. Without this, upload service cannot be built.
- No upload progress/retry logic – Current mock has no network simulation. Real
  upload will need chunking, resume, and timeout handling.
- No ASR service integration point – Phase D says "real recording and upload" but
  ASR is the next step after upload. The interface between upload completion and
  ASR trigger is undefined.
- No recording file storage model – `recordingFileId` exists in types but no
  storage schema or file lifecycle (temp vs permanent, cleanup policy).

### 3. Risks in Keeping Legacy Mailuo/Study APIs

High risk. `services/class-session.ts` states "only a legacy compatibility mailuo
record." This means:

- Old pages that call `getMailuo`/`updateStudyProgress` will receive incomplete or
  misleading data.
- If any old page is still accessible, it will break silently.
- No deprecation warning or guard exists.

Recommendation: either remove legacy API calls entirely, or add explicit
deprecation and a runtime guard.

### 4. Phase D Split Recommendation

Split Phase D into at least 3 sub-tasks:

1. D1 Recording infrastructure.
2. D2 Upload service.
3. D3 ASR integration.

### Verdict

Blockers exist. Do not start Phase D coding until:

- Legacy API risk is resolved.
- Audio spec and storage model are documented.
- Phase D is split into smaller tasks.
