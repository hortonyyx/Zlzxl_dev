import { routes } from '../../constants/routes';
import { getModuleResults } from '../../services/module';
import type { ModuleResult } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '学习结果',
    libraryId: '',
    studyNodeId: '',
    moduleType: '',
    results: [] as ModuleResult[],
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const studyNodeId = options.studyNodeId ?? '';
    const moduleType = options.moduleType ?? '';
    this.setData({ libraryId, studyNodeId, moduleType });
    void this.loadResults(studyNodeId);
  },

  async loadResults(studyNodeId: string) {
    try {
      const results = await getModuleResults(studyNodeId);
      this.setData({ results, loading: false });
    } catch {
      showToast('结果加载失败');
      this.setData({ loading: false });
    }
  },

  backToLibrary() {
    wx.redirectTo({ url: `${routes.libraryDetail}?libraryId=${this.data.libraryId}` });
  },

  goFlashcard() {
    wx.redirectTo({ url: `${routes.flashcardRun}?libraryId=${this.data.libraryId}&studyNodeId=${this.data.studyNodeId}` });
  },
});
