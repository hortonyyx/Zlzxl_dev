import { listKnowledgePoints } from '../../services/knowledge';
import { getMailuo } from '../../services/mailuo';
import { getLearningNode } from '../../services/node';
import type { KnowledgePoint, LearningNode } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '脉络站点',
    node: null as LearningNode | null,
    points: [] as KnowledgePoint[],
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    void this.loadStation(options.libraryId ?? '', options.nodeId ?? '');
  },

  async loadStation(libraryId: string, nodeId: string) {
    try {
      const [node, points, mailuo] = await Promise.all([
        getLearningNode(nodeId),
        listKnowledgePoints(libraryId),
        getMailuo(libraryId),
      ]);
      const station = mailuo?.stations.find((item) => item.nodeId === nodeId);
      const stationPointIds = station?.knowledgePointIds ?? [];
      const stationPoints = points.filter((point) => stationPointIds.includes(point._id));
      this.setData({ node, points: stationPoints, loading: false });
    } catch {
      showToast('站点加载失败');
      this.setData({ loading: false });
    }
  },
});
