const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event) => {
  const libraryId = String(event.libraryId || '').trim();
  const recordingFileId = String(event.recordingFileId || '').trim();

  if (!libraryId) {
    return { ok: false, error: 'libraryId is required' };
  }

  if (!recordingFileId) {
    return { ok: false, error: 'recordingFileId is required' };
  }

  return {
    ok: true,
    sessionId: `session-${Date.now()}`,
    status: 'recording-uploaded',
    libraryId,
    recordingFileId,
  };
};
