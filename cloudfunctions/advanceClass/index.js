const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event) => {
  const sessionId = String(event.sessionId || '').trim();
  const recordingFileId = String(event.recordingFileId || '').trim();

  if (!sessionId) {
    return { ok: false, status: 'failed', error: 'sessionId is required' };
  }

  if (!recordingFileId) {
    return { ok: false, status: 'failed', error: 'recordingFileId is required for ASR' };
  }

  const tempUrlResult = await cloud.getTempFileURL({
    fileList: [recordingFileId],
  });
  const tempFileURL = tempUrlResult.fileList && tempUrlResult.fileList[0] && tempUrlResult.fileList[0].tempFileURL;

  if (!tempFileURL) {
    return { ok: false, status: 'failed', error: 'failed to resolve recording temp URL' };
  }

  return {
    ok: false,
    status: 'failed',
    error: 'ASR/LLM providers are not configured yet',
    contract: {
      sessionId,
      recordingFileId,
      tempFileURL,
      next: 'Send tempFileURL to ASR, then send transcript to LLM for summary and quiz generation.',
    },
  };
};
