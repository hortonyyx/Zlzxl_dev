import { routes } from '../../constants/routes';
import { getFlashcards, gradeModule } from '../../services/module';
import { getStudyNode } from '../../services/study-session';
import type { Flashcard } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '闪卡',
    libraryId: '',
    studyNodeId: '',
    cards: [] as Flashcard[],
    loading: true,
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const studyNodeId = options.studyNodeId ?? '';
    this.setData({ libraryId, studyNodeId });
    void this.loadCards(studyNodeId);
  },

  async loadCards(studyNodeId: string) {
    try {
      const node = await getStudyNode(studyNodeId);
      const module = node?.plan?.modules.find((item) => item.type === 'flashcard');
      const cards = await getFlashcards(module?.knowledgePointIds ?? []);
      this.setData({ cards, loading: false });
    } catch {
      showToast('闪卡加载失败');
      this.setData({ loading: false });
    }
  },

  async submitCards() {
    this.setData({ submitting: true });
    try {
      await gradeModule(
        this.data.studyNodeId,
        'flashcard',
        this.data.cards.map((card) => ({ knowledgePointId: card.knowledgePointId, pass: true })),
      );
      wx.redirectTo({
        url: `${routes.nodeResult}?libraryId=${this.data.libraryId}&studyNodeId=${this.data.studyNodeId}&moduleType=flashcard`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },
});
