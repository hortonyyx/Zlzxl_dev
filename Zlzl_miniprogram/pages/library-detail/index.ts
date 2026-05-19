import { routes } from '../../constants/routes';
import { listKnowledgePoints } from '../../services/knowledge';
import { getLibrary } from '../../services/library';
import { getMailuo } from '../../services/mailuo';
import { planStudy } from '../../services/study-session';
import type { KnowledgePoint, Library, Mailuo } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '库主页',
    libraryId: '',
    library: null as Library | null,
    mailuo: null as Mailuo | null,
    points: [] as KnowledgePoint[],
    loading: true,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    this.setData({ libraryId });
    void this.loadDetail(libraryId);
  },

  async loadDetail(libraryId: string) {
    this.setData({ loading: true });
    try {
      const [library, mailuo, points] = await Promise.all([
        getLibrary(libraryId),
        getMailuo(libraryId),
        listKnowledgePoints(libraryId),
      ]);
      this.setData({ library, mailuo, points, loading: false });
    } catch {
      showToast('库主页加载失败');
      this.setData({ loading: false });
    }
  },

  goClassRecord() {
    wx.navigateTo({ url: `${routes.classRecord}?libraryId=${this.data.libraryId}` });
  },

  async goStudyNode() {
    try {
      const session = await planStudy(this.data.libraryId);
      wx.navigateTo({ url: `${routes.studyNode}?libraryId=${this.data.libraryId}&studyNodeId=${session.studyNodeId}` });
    } catch {
      showToast('今日学习生成失败');
    }
  },

  openStation(event: WechatMiniprogram.TouchEvent) {
    const nodeId = event.currentTarget.dataset.nodeId as string;
    wx.navigateTo({ url: `${routes.stationDetail}?libraryId=${this.data.libraryId}&nodeId=${nodeId}` });
  },
});
