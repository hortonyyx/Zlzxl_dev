import { routes } from '../../constants/routes';
import { getLearningNode } from '../../services/node';
import { planStudy } from '../../services/study-session';
import type { LearningNode } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '课堂总结',
    libraryId: '',
    node: null as LearningNode | null,
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    this.setData({ libraryId });
    void this.loadNode(options.nodeId ?? '');
  },

  async loadNode(nodeId: string) {
    try {
      const node = await getLearningNode(nodeId);
      this.setData({ node, loading: false });
    } catch {
      showToast('总结加载失败');
      this.setData({ loading: false });
    }
  },

  async startQuiz() {
    try {
      const session = await planStudy(this.data.libraryId);
      wx.navigateTo({ url: `${routes.quizRun}?libraryId=${this.data.libraryId}&studyNodeId=${session.studyNodeId}` });
    } catch {
      showToast('测验生成失败');
    }
  },

  backToLibrary() {
    wx.redirectTo({ url: `${routes.libraryDetail}?libraryId=${this.data.libraryId}` });
  },
});
