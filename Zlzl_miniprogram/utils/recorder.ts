export const CLASS_RECORD_MAX_DURATION_MS = 10 * 60 * 1000;
export const QUIZ_VOICE_MAX_DURATION_MS = 60 * 1000;

export interface RecorderFile {
  tempFilePath: string;
  duration: number;
  fileSize: number;
}

export type RecorderState = 'idle' | 'recording' | 'stopping';
export type RecorderRuntimeEvent =
  | { type: 'stop'; file: RecorderFile }
  | { type: 'error'; message: string }
  | { type: 'interruption'; message: string };
export type RecorderRuntimeEventHandler = (event: RecorderRuntimeEvent) => void;

const RECORD_DURATION_GUARD_MS = 5000;

const classRecordOption: WechatMiniprogram.RecorderManagerStartOption = {
  duration: CLASS_RECORD_MAX_DURATION_MS + RECORD_DURATION_GUARD_MS,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
  audioSource: 'auto',
};

const quizVoiceOption: WechatMiniprogram.RecorderManagerStartOption = {
  ...classRecordOption,
  duration: QUIZ_VOICE_MAX_DURATION_MS,
};

class AppRecorder {
  private readonly manager = wx.getRecorderManager();
  private state: RecorderState = 'idle';
  private pendingStart: (() => void) | null = null;
  private pendingStop: ((file: RecorderFile) => void) | null = null;
  private pendingReject: ((error: Error) => void) | null = null;
  private runtimeHandlers: RecorderRuntimeEventHandler[] = [];
  private suppressNextStop = false;

  constructor() {
    this.manager.onStart(() => {
      this.state = 'recording';
      this.suppressNextStop = false;
      this.pendingStart?.();
      this.pendingStart = null;
      // Keep this clear after start, otherwise recording-time errors would reject a settled start promise.
      this.pendingReject = null;
    });

    this.manager.onStop((result) => {
      this.state = 'idle';
      if (this.suppressNextStop) {
        this.suppressNextStop = false;
        this.clearPending();
        return;
      }

      const file: RecorderFile = {
        tempFilePath: result.tempFilePath,
        duration: result.duration,
        fileSize: result.fileSize,
      };
      const pendingStop = this.pendingStop;
      this.clearPending();
      if (pendingStop) {
        pendingStop(file);
        return;
      }
      this.notifyRuntime({ type: 'stop', file });
    });

    this.manager.onError((result) => {
      this.state = 'idle';
      this.suppressNextStop = true;
      const message = result.errMsg || '录音失败';
      const pendingReject = this.pendingReject;
      this.clearPending();
      if (pendingReject) {
        pendingReject(new Error(message));
        return;
      }
      this.notifyRuntime({ type: 'error', message });
    });

    this.manager.onInterruptionBegin(() => {
      this.state = 'idle';
      this.suppressNextStop = true;
      const message = '录音被系统中断';
      const pendingReject = this.pendingReject;
      this.clearPending();
      if (pendingReject) {
        pendingReject(new Error(message));
        return;
      }
      this.notifyRuntime({ type: 'interruption', message });
    });

    this.manager.onInterruptionEnd(() => {
      // MVP does not auto-resume; the page asks the user to start a fresh recording.
    });
  }

  getState(): RecorderState {
    return this.state;
  }

  async startClassRecord(): Promise<void> {
    await ensureRecordPermission();
    return this.start(classRecordOption);
  }

  async startQuizVoice(): Promise<void> {
    await ensureRecordPermission();
    return this.start(quizVoiceOption);
  }

  onRuntimeEvent(handler: RecorderRuntimeEventHandler): () => void {
    this.runtimeHandlers.push(handler);
    return () => {
      this.runtimeHandlers = this.runtimeHandlers.filter((item) => item !== handler);
    };
  }

  stop(): Promise<RecorderFile> {
    if (this.state !== 'recording') {
      return Promise.reject(new Error('当前没有正在录制的音频'));
    }

    this.state = 'stopping';
    return new Promise((resolve, reject) => {
      this.pendingStop = resolve;
      this.pendingReject = reject;
      this.manager.stop();
    });
  }

  private start(option: WechatMiniprogram.RecorderManagerStartOption): Promise<void> {
    if (this.state !== 'idle') {
      return Promise.reject(new Error('录音正在进行中'));
    }

    return new Promise((resolve, reject) => {
      this.pendingStart = resolve;
      this.pendingReject = reject;
      this.manager.start(option);
    });
  }

  private clearPending(): void {
    this.pendingStart = null;
    this.pendingStop = null;
    this.pendingReject = null;
  }

  private notifyRuntime(event: RecorderRuntimeEvent): void {
    this.runtimeHandlers.forEach((handler) => handler(event));
  }
}

const appRecorder = new AppRecorder();

export function getRecorderState(): RecorderState {
  return appRecorder.getState();
}

export function startClassRecording(): Promise<void> {
  return appRecorder.startClassRecord();
}

export function startQuizVoiceRecording(): Promise<void> {
  return appRecorder.startQuizVoice();
}

export function stopRecording(): Promise<RecorderFile> {
  return appRecorder.stop();
}

export function onRecorderRuntimeEvent(handler: RecorderRuntimeEventHandler): () => void {
  return appRecorder.onRuntimeEvent(handler);
}

export function formatRecordDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export function formatFileSize(fileSize: number): string {
  if (fileSize < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSize / 1024))} KB`;
  }
  return `${(fileSize / 1024 / 1024).toFixed(1)} MB`;
}

function ensureRecordPermission(): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(setting) {
        const recordAuth = setting.authSetting['scope.record'];
        if (recordAuth === true) {
          resolve();
          return;
        }

        if (recordAuth === false) {
          wx.openSetting({
            success(nextSetting) {
              if (nextSetting.authSetting['scope.record']) {
                resolve();
                return;
              }
              reject(new Error('需要在设置中开启麦克风权限才能录音'));
            },
            fail: () => reject(new Error('无法打开权限设置')),
          });
          return;
        }

        wx.authorize({
          scope: 'scope.record',
          success: () => resolve(),
          fail: () => reject(new Error('需要麦克风权限才能录音')),
        });
      },
      fail: () => reject(new Error('无法读取授权状态')),
    });
  });
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}
