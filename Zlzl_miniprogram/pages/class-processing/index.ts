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
      this.setData({ status: result.status, nodeId: result.nodeId ?? '', done: result.status === 'done' });
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
