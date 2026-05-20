import { routes } from '../../constants/routes';
import { submitClass, submitManualClass } from '../../services/class-session';
import {
  CLASS_RECORD_MAX_DURATION_MS,
  RecorderFile,
  formatFileSize,
  formatRecordDuration,
  startClassRecording,
  stopRecording,
} from '../../utils/recorder';
import { showToast } from '../../utils/toast';

let recordTimer: number | undefined;
let recordStartedAt = 0;

Page({
  data: {
    title: '上课录音',
    libraryId: '',
    recording: false,
    stopping: false,
    elapsedMs: 0,
    elapsedText: '00:00',
    maxDurationText: formatRecordDuration(CLASS_RECORD_MAX_DURATION_MS),
    recordedFile: null as RecorderFile | null,
    recordedDurationText: '',
    recordedFileSizeText: '',
    content:
      '这节课继续讨论现代主义设计。老师提到功能主义带来了秩序,但也可能忽略个体经验。后现代设计用多元符号回应这个问题。',
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({ libraryId: options.libraryId ?? '' });
  },

  onUnload() {
    this.clearRecordTimer();
    if (this.data.recording) {
      void stopRecording().catch(() => undefined);
    }
  },

  onContentInput(event: WechatMiniprogram.Input) {
    this.setData({ content: event.detail.value });
  },

  async startRecording() {
    try {
      await startClassRecording();
      recordStartedAt = Date.now();
      this.setData({
        recording: true,
        stopping: false,
        elapsedMs: 0,
        elapsedText: '00:00',
        recordedFile: null,
        recordedDurationText: '',
        recordedFileSizeText: '',
      });
      this.startRecordTimer();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '录音启动失败');
    }
  },

  async stopRecording() {
    if (!this.data.recording || this.data.stopping) {
      return;
    }

    this.setData({ stopping: true });
    try {
      const file = await stopRecording();
      this.clearRecordTimer();
      this.setData({
        recording: false,
        stopping: false,
        recordedFile: file,
        recordedDurationText: formatRecordDuration(file.duration),
        recordedFileSizeText: formatFileSize(file.fileSize),
      });
    } catch (error) {
      this.clearRecordTimer();
      this.setData({ recording: false, stopping: false });
      showToast(error instanceof Error ? error.message : '录音停止失败');
    }
  },

  async submitRecordedClass() {
    if (!this.data.recordedFile) {
      showToast('请先完成录音');
      return;
    }

    this.setData({ submitting: true });
    try {
      const transcriptFallback = `mock 转写:本节课来自一段 ${this.data.recordedDurationText} 的本地录音。D1 阶段先验证录音能力,云上传和 ASR 会在后续阶段接入。`;
      const result = await submitClass(this.data.libraryId, undefined, transcriptFallback);
      wx.redirectTo({
        url: `${routes.classProcessing}?libraryId=${this.data.libraryId}&sessionId=${result.sessionId}`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },

  async submitClass() {
    const content = String(this.data.content).trim();
    if (!content) {
      showToast('先输入课堂内容');
      return;
    }

    this.setData({ submitting: true });
    try {
      const result = await submitManualClass(this.data.libraryId, content);
      wx.redirectTo({
        url: `${routes.classProcessing}?libraryId=${this.data.libraryId}&sessionId=${result.sessionId}`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },

  startRecordTimer() {
    this.clearRecordTimer();
    recordTimer = setInterval(() => {
      const elapsedMs = Math.min(Date.now() - recordStartedAt, CLASS_RECORD_MAX_DURATION_MS);
      this.setData({ elapsedMs, elapsedText: formatRecordDuration(elapsedMs) });
      if (elapsedMs >= CLASS_RECORD_MAX_DURATION_MS && this.data.recording) {
        void this.stopRecording();
      }
    }, 1000);
  },

  clearRecordTimer() {
    if (recordTimer !== undefined) {
      clearInterval(recordTimer);
      recordTimer = undefined;
    }
  },
});
