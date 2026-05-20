import { isCloudEnvConfigured } from '../constants/cloud';

export interface LocalRecordingFile {
  tempFilePath: string;
  duration: number;
  fileSize: number;
}

export interface UploadClassRecordingInput {
  libraryId: string;
  recording: LocalRecordingFile;
  now?: number;
  onProgress?: (progress: number) => void;
}

export interface UploadClassRecordingResult {
  recordingFileId: string;
  cloudPath: string;
  duration: number;
  fileSize: number;
  uploadedAt: number;
}

export function uploadClassRecording(input: UploadClassRecordingInput): Promise<UploadClassRecordingResult> {
  if (!isCloudEnvConfigured()) {
    return Promise.reject(new Error('微信云开发环境 ID 未配置'));
  }

  const uploadedAt = input.now ?? Date.now();
  const cloudPath = buildClassRecordingCloudPath(input.libraryId, uploadedAt);

  return new Promise((resolve, reject) => {
    const uploadTask = wx.cloud.uploadFile({
      cloudPath,
      filePath: input.recording.tempFilePath,
      success(result) {
        resolve({
          recordingFileId: result.fileID,
          cloudPath,
          duration: input.recording.duration,
          fileSize: input.recording.fileSize,
          uploadedAt,
        });
      },
      fail() {
        reject(new Error('录音上传失败'));
      },
    });

    uploadTask.onProgressUpdate((result) => {
      input.onProgress?.(result.progress);
    });
  });
}

function buildClassRecordingCloudPath(libraryId: string, timestamp: number): string {
  const safeLibraryId = libraryId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'unknown-library';
  return `class-recordings/${safeLibraryId}/${timestamp}.mp3`;
}
