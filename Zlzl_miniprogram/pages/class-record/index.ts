import { routes } from '../../constants/routes';
import { submitClass as submitClassSession, submitManualClass } from '../../services/class-session';
import { UploadClassRecordingResult, uploadClassRecording } from '../../services/upload';
import {
  CLASS_RECORD_MAX_DURATION_MS,
  RecorderFile,
  formatFileSize,
  formatRecordDuration,
  onRecorderRuntimeEvent,
  startClassRecording,
  stopRecording as stopRecorder,
} from '../../utils/recorder';
import { showToast } from '../../utils/toast';

Page({
  recordTimer: undefined as number | undefined,
  recordStartedAt: 0,
  stopInFlight: false,
  unsubscribeRecorderRuntime: null as (() => void) | null,

  data: {
    title: '上课录音',
    libraryId: '',
    recording: false,
    stopping: false,
    elapsedMs: 0,
    elapsedText: '00:00',
    progressPercent: 0,
    maxDurationText: formatRecordDuration(CLASS_RECORD_MAX_DURATION_MS),
    recordedFile: null as RecorderFile | null,
    recordedDurationText: '',
    recordedFileSizeText: '',
    uploadResult: null as UploadClassRecordingResult | null,
    uploading: false,
    uploadProgress: 0,
    uploadError: '',
    content:
      '这节课继续讨论现代主义设计。老师提到功能主义带来了秩序,但也可能忽略个体经验。后现代设计用多元符号回应这个问题。',
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({ libraryId: options.libraryId ?? '' });
    this.unsubscribeRecorderRuntime = onRecorderRuntimeEvent((event) => {
      if (event.type === 'stop') {
        if (!this.data.recording && !this.data.stopping) {
          return;
        }
        this.finishRecording(event.file);
        return;
      }

      this.handleRecordingFailure(event.message);
    });
  },

  onUnload() {
    this.unsubscribeRecorderRuntime?.();
    this.unsubscribeRecorderRuntime = null;
    this.clearRecordTimer();
    if (this.data.recording) {
      void stopRecorder().catch(() => undefined);
    }
  },

  onContentInput(event: WechatMiniprogram.Input) {
    this.setData({ content: event.detail.value });
  },

  async startRecording() {
    try {
      await startClassRecording();
      this.recordStartedAt = Date.now();
      this.stopInFlight = false;
      this.setData({
        recording: true,
        stopping: false,
        elapsedMs: 0,
        elapsedText: '00:00',
        progressPercent: 0,
        recordedFile: null,
        recordedDurationText: '',
        recordedFileSizeText: '',
        uploadResult: null,
        uploading: false,
        uploadProgress: 0,
        uploadError: '',
      });
      this.startRecordTimer();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '录音启动失败');
    }
  },

  async stopRecording() {
    if (!this.data.recording || this.data.stopping || this.stopInFlight) {
      return;
    }

    this.stopInFlight = true;
    this.setData({ stopping: true });
    try {
      const file = await stopRecorder();
      this.finishRecording(file);
    } catch (error) {
      this.handleRecordingFailure(error instanceof Error ? error.message : '录音停止失败');
    }
  },

  async submitRecordedClass() {
    if (!this.data.recordedFile) {
      showToast('请先完成录音');
      return;
    }

    this.setData({ submitting: true });
    try {
      const recording = this.data.recordedFile;
      const uploadResult = this.data.uploadResult;
      const localRecordingHint = `本地录音 ${this.data.recordedDurationText}, ${this.data.recordedFileSizeText}, 临时路径 ${recording.tempFilePath}`;
      const result = await submitClassSession({
        libraryId: this.data.libraryId,
        recordingFileId: uploadResult?.recordingFileId,
        localRecordingHint: uploadResult ? undefined : localRecordingHint,
      });
      wx.redirectTo({
        url: `${routes.classProcessing}?libraryId=${this.data.libraryId}&sessionId=${result.sessionId}`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },

  async retryUploadRecording() {
    if (!this.data.recordedFile) {
      showToast('请先完成录音');
      return;
    }

    await this.uploadRecordedFile(this.data.recordedFile);
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
    this.recordTimer = setInterval(() => {
      const elapsedMs = Math.min(Date.now() - this.recordStartedAt, CLASS_RECORD_MAX_DURATION_MS);
      const progressPercent = Math.round((elapsedMs * 10000) / CLASS_RECORD_MAX_DURATION_MS) / 100;
      this.setData({ elapsedMs, elapsedText: formatRecordDuration(elapsedMs), progressPercent });
      if (elapsedMs >= CLASS_RECORD_MAX_DURATION_MS && this.data.recording) {
        void this.stopRecording();
      }
    }, 1000);
  },

  clearRecordTimer() {
    if (this.recordTimer !== undefined) {
      clearInterval(this.recordTimer);
      this.recordTimer = undefined;
    }
  },

  finishRecording(file: RecorderFile) {
    this.clearRecordTimer();
    this.stopInFlight = false;
    const elapsedMs = Math.min(Date.now() - this.recordStartedAt, CLASS_RECORD_MAX_DURATION_MS);
    const progressPercent = Math.round((elapsedMs * 10000) / CLASS_RECORD_MAX_DURATION_MS) / 100;
    this.setData({
      recording: false,
      stopping: false,
      elapsedMs,
      elapsedText: formatRecordDuration(elapsedMs),
      progressPercent,
      recordedFile: file,
      recordedDurationText: formatRecordDuration(elapsedMs),
      recordedFileSizeText: formatFileSize(file.fileSize),
      uploadResult: null,
      uploading: false,
      uploadProgress: 0,
      uploadError: '',
    });
    void this.uploadRecordedFile(file);
  },

  handleRecordingFailure(message: string) {
    this.clearRecordTimer();
    this.stopInFlight = false;
    this.setData({ recording: false, stopping: false });
    showToast(message);
  },

  async uploadRecordedFile(file: RecorderFile) {
    this.setData({ uploading: true, uploadProgress: 0, uploadError: '', uploadResult: null });
    try {
      const result = await uploadClassRecording({
        libraryId: this.data.libraryId,
        recording: file,
        onProgress: (progress) => {
          this.setData({ uploadProgress: progress });
        },
      });
      this.setData({ uploading: false, uploadProgress: 100, uploadResult: result });
    } catch (error) {
      this.setData({
        uploading: false,
        uploadError: error instanceof Error ? error.message : '录音上传失败',
      });
    }
  },
});
