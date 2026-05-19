import { listKnowledgePoints } from '../../services/knowledge';
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
      const [node, points] = await Promise.all([getLearningNode(nodeId), listKnowledgePoints(libraryId)]);
      const stationPoints = node
        ? points.filter((point) => point.firstSeenNodeId === node._id || point.relatedIds.length > 0)
        : [];
      this.setData({ node, points: stationPoints.slice(0, 6), loading: false });
    } catch {
      showToast('站点加载失败');
      this.setData({ loading: false });
    }
  },
});
