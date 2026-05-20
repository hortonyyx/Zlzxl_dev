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
    currentIndex: 0,
    currentCard: null as Flashcard | null,
    revealed: false,
    answers: [] as Array<{ knowledgePointId: string; pass: boolean }>,
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
      this.setData({ cards, currentCard: cards[0] ?? null, loading: false });
    } catch {
      showToast('闪卡加载失败');
      this.setData({ loading: false });
    }
  },

  revealCard() {
    this.setData({ revealed: true });
  },

  rateCard(event: WechatMiniprogram.TouchEvent) {
    const pass = event.currentTarget.dataset.pass === 'true';
    const currentCard = this.data.currentCard;
    if (!currentCard) {
      return;
    }

    const nextAnswers = [...this.data.answers, { knowledgePointId: currentCard.knowledgePointId, pass }];
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.cards.length) {
      this.setData({ answers: nextAnswers, currentIndex: nextIndex, currentCard: null, revealed: false });
      void this.submitCards(nextAnswers);
      return;
    }

    this.setData({
      answers: nextAnswers,
      currentIndex: nextIndex,
      currentCard: this.data.cards[nextIndex],
      revealed: false,
    });
  },

  async submitCards(answers: Array<{ knowledgePointId: string; pass: boolean }>) {
    this.setData({ submitting: true });
    try {
      await gradeModule(this.data.studyNodeId, 'flashcard', answers);
      wx.redirectTo({
        url: `${routes.nodeResult}?libraryId=${this.data.libraryId}&studyNodeId=${this.data.studyNodeId}&moduleType=flashcard`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },
});
