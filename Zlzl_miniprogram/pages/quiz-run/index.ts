import { routes } from '../../constants/routes';
import { getQuizQuestions, gradeModule } from '../../services/module';
import { getStudyNode } from '../../services/study-session';
import type { QuizQuestion } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '测验',
    libraryId: '',
    studyNodeId: '',
    questions: [] as QuizQuestion[],
    answerDrafts: [] as string[],
    loading: true,
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const studyNodeId = options.studyNodeId ?? '';
    this.setData({ libraryId, studyNodeId });
    void this.loadQuestions(studyNodeId);
  },

  async loadQuestions(studyNodeId: string) {
    try {
      const node = await getStudyNode(studyNodeId);
      const module = node?.plan?.modules.find((item) => item.type === 'quiz');
      const questions = await getQuizQuestions(module?.knowledgePointIds ?? []);
      this.setData({ questions, answerDrafts: questions.map(() => ''), loading: false });
    } catch {
      showToast('测验加载失败');
      this.setData({ loading: false });
    }
  },

  onAnswerInput(event: WechatMiniprogram.Input) {
    const index = Number(event.currentTarget.dataset.index);
    const answerDrafts = [...this.data.answerDrafts];
    answerDrafts[index] = event.detail.value;
    this.setData({ answerDrafts });
  },

  async submitQuiz() {
    this.setData({ submitting: true });
    try {
      await gradeModule(
        this.data.studyNodeId,
        'quiz',
        this.data.questions.map((question, index) => ({
          knowledgePointId: question.knowledgePointId,
          pass: String(this.data.answerDrafts[index] ?? '').trim().length >= 8,
        })),
      );
      wx.redirectTo({
        url: `${routes.nodeResult}?libraryId=${this.data.libraryId}&studyNodeId=${this.data.studyNodeId}&moduleType=quiz`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },
});
