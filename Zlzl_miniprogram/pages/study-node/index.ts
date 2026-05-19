import { routes } from '../../constants/routes';
import { listKnowledgePoints } from '../../services/knowledge';
import { getStudyNode } from '../../services/study-session';
import type { KnowledgePoint, LearningNode, StudyPlanModule } from '../../types/learning';
import { showToast } from '../../utils/toast';

interface ModuleView extends StudyPlanModule {
  title: string;
  pointNames: string;
}

Page({
  data: {
    title: '今日学习',
    libraryId: '',
    studyNodeId: '',
    node: null as LearningNode | null,
    modules: [] as ModuleView[],
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    const studyNodeId = options.studyNodeId ?? '';
    this.setData({ libraryId, studyNodeId });
    void this.loadStudyNode(libraryId, studyNodeId);
  },

  async loadStudyNode(libraryId: string, studyNodeId: string) {
    try {
      const [node, points] = await Promise.all([getStudyNode(studyNodeId), listKnowledgePoints(libraryId)]);
      const modules =
        node?.plan?.modules.map((module) => ({
          ...module,
          title: module.type === 'quiz' ? '测验' : '闪卡',
          pointNames: module.knowledgePointIds.map((id) => findPointName(points, id)).join(' / '),
        })) ?? [];
      this.setData({ node, modules, loading: false });
    } catch {
      showToast('学习节点加载失败');
      this.setData({ loading: false });
    }
  },

  startModule(event: WechatMiniprogram.TouchEvent) {
    const type = event.currentTarget.dataset.type as string;
    const route = type === 'flashcard' ? routes.flashcardRun : routes.quizRun;
    wx.navigateTo({ url: `${route}?libraryId=${this.data.libraryId}&studyNodeId=${this.data.studyNodeId}` });
  },
});

function findPointName(points: KnowledgePoint[], knowledgePointId: string): string {
  return points.find((point) => point._id === knowledgePointId)?.name ?? '知识点';
}
