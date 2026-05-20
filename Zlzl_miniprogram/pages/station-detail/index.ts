import { routes } from '../../constants/routes';
import { getLearningNode } from '../../services/node';
import type { LearningNode } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '课堂详情',
    libraryId: '',
    node: null as LearningNode | null,
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({ libraryId: options.libraryId ?? '' });
    void this.loadStation(options.libraryId ?? '', options.nodeId ?? '');
  },

  async loadStation(libraryId: string, nodeId: string) {
    try {
      const node = await getLearningNode(nodeId);
      this.setData({ node, loading: false });
    } catch {
      showToast('课堂详情加载失败');
      this.setData({ loading: false });
    }
  },

  openSummary() {
    if (!this.data.node?._id) {
      return;
    }
    wx.navigateTo({ url: `${routes.nodeSummary}?libraryId=${this.data.libraryId}&nodeId=${this.data.node._id}` });
  },

  startQuiz() {
    if (!this.data.node?._id) {
      return;
    }
    wx.navigateTo({ url: `${routes.quizRun}?libraryId=${this.data.libraryId}&nodeId=${this.data.node._id}` });
  },
});
