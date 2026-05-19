import { routes } from '../../constants/routes';
import { listKnowledgePoints } from '../../services/knowledge';
import { listLibraries } from '../../services/library';
import { getMailuo } from '../../services/mailuo';
import type { Library } from '../../types/learning';
import { showToast } from '../../utils/toast';

interface LibraryCard extends Library {
  statusText: string;
  stationCount: number;
}

Page({
  data: {
    title: '课程学习库',
    libraries: [] as LibraryCard[],
    loading: true,
  },

  onLoad() {
    void this.loadLibraries();
  },

  async loadLibraries() {
    this.setData({ loading: true });
    try {
      const libraries = await listLibraries();
      const cards = await Promise.all(
        libraries.map(async (library) => {
          const [points, mailuo] = await Promise.all([listKnowledgePoints(library._id), getMailuo(library._id)]);
          const green = points.filter((point) => point.status === 'green').length;
          const yellow = points.filter((point) => point.status === 'yellow').length;
          const gray = points.filter((point) => point.status === 'gray').length;
          return {
            ...library,
            stationCount: mailuo?.stations.length ?? 0,
            statusText: `绿 ${green} · 黄 ${yellow} · 灰 ${gray}`,
          };
        }),
      );
      this.setData({ libraries: cards, loading: false });
    } catch {
      showToast('学习库加载失败');
      this.setData({ loading: false });
    }
  },

  goCreate() {
    wx.navigateTo({ url: routes.libraryCreate });
  },

  openLibrary(event: WechatMiniprogram.TouchEvent) {
    const libraryId = event.currentTarget.dataset.libraryId as string;
    wx.navigateTo({ url: `${routes.libraryDetail}?libraryId=${libraryId}` });
  },
});
