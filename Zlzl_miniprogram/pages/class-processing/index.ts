import { routes } from '../../constants/routes';
import { advanceClass } from '../../services/class-session';
import type { ClassSessionStatus } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '课堂处理中',
    libraryId: '',
    sessionId: '',
    nodeId: '',
    status: 'transcribing' as ClassSessionStatus,
    statusText: '转写中',
    done: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const sessionId = options.sessionId ?? '';
    this.setData({ libraryId, sessionId });
    void this.advance();
  },

  async advance() {
    try {
      const result = await advanceClass(this.data.sessionId);
      this.setData({
        status: result.status,
        statusText: getClassStatusText(result.status),
        nodeId: result.nodeId ?? '',
        done: result.status === 'done',
      });
    } catch {
      showToast('处理失败');
    }
  },

  openSummary() {
    wx.redirectTo({
      url: `${routes.nodeSummary}?libraryId=${this.data.libraryId}&nodeId=${this.data.nodeId}`,
    });
  },
});

function getClassStatusText(status: ClassSessionStatus): string {
  const statusTextMap: Record<ClassSessionStatus, string> = {
    'recording-uploaded': '录音已提交',
    transcribing: '转写中',
    summarizing: '生成课堂总结中',
    extracting: '生成课堂总结中',
    rewriting: '生成课堂总结中',
    'generating-quiz': '生成课后测验中',
    done: '已完成',
    failed: '处理失败',
  };

  return statusTextMap[status];
}
