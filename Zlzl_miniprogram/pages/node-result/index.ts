import { routes } from '../../constants/routes';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '学习结果暂不开放',
    libraryId: '',
    loading: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    const libraryId = options.libraryId ?? '';
    this.setData({ libraryId });
    showToast('学习结果页暂不开放');
    wx.redirectTo({ url: libraryId ? `${routes.libraryDetail}?libraryId=${libraryId}` : routes.libraryList });
  },
});
