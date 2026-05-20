import { routes } from '../../constants/routes';
import { getLibrary } from '../../services/library';
import { listClassNodes } from '../../services/node';
import type { LearningNode, Library } from '../../types/learning';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '库主页',
    libraryId: '',
    library: null as Library | null,
    classNodes: [] as LearningNode[],
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
      const [library, classNodes] = await Promise.all([getLibrary(libraryId), listClassNodes(libraryId)]);
      this.setData({ library, classNodes, loading: false });
    } catch {
      showToast('库主页加载失败');
      this.setData({ loading: false });
    }
  },

  goClassRecord() {
    wx.navigateTo({ url: `${routes.classRecord}?libraryId=${this.data.libraryId}` });
  },

  openClassNode(event: WechatMiniprogram.TouchEvent) {
    const nodeId = event.currentTarget.dataset.nodeId as string;
    wx.navigateTo({ url: `${routes.stationDetail}?libraryId=${this.data.libraryId}&nodeId=${nodeId}` });
  },
});
