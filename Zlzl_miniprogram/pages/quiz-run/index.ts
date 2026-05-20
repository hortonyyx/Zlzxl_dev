import { routes } from '../../constants/routes';
import { getClassQuizQuestions, gradeQuizAnswer } from '../../services/module';
import type { QuizAnswer, QuizQuestion } from '../../types/learning';
import { showToast } from '../../utils/toast';

type QuizQuestionView = QuizQuestion & { feedback?: string };

Page({
  data: {
    title: '测验',
    libraryId: '',
    nodeId: '',
    questions: [] as QuizQuestionView[],
    answerDrafts: [] as string[],
    loading: true,
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const nodeId = options.nodeId ?? options.studyNodeId ?? '';
    this.setData({ libraryId, nodeId });
    void this.loadQuestions(nodeId);
  },

  async loadQuestions(nodeId: string) {
    try {
      const questions = await getClassQuizQuestions(nodeId);
      this.setData({
        questions,
        answerDrafts: questions.map(() => ''),
        loading: false,
      });
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
      const results = await Promise.all(
        this.data.questions.map((question, index) =>
          gradeQuizAnswer(this.data.nodeId, question._id, {
            mode: 'text',
            text: String(this.data.answerDrafts[index] ?? ''),
          }),
        ),
      );
      this.setData({
        questions: this.data.questions.map((question, index) => ({
          ...question,
          feedback: formatFeedback(results[index].answer),
        })),
        submitting: false,
      });
      showToast(results.every((result) => result.completed) ? '测验完成' : '已生成点评');
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },

  backToSummary() {
    wx.redirectTo({ url: `${routes.nodeSummary}?libraryId=${this.data.libraryId}&nodeId=${this.data.nodeId}` });
  },
});

function formatFeedback(answer: QuizAnswer): string {
  const score = typeof answer.score === 'number' ? `${Math.round(answer.score * 100)} 分` : '已点评';
  return `${score} · ${answer.feedback ?? ''}`;
}
