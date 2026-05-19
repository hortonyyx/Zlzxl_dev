import { routes } from '../../constants/routes';
import { createLibrary } from '../../services/library';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '新建学习库',
    name: '设计史练习库',
    saving: false,
  },

  onNameInput(event: WechatMiniprogram.Input) {
    this.setData({ name: event.detail.value });
  },

  async createCourseLibrary() {
    const name = String(this.data.name).trim();
    if (!name) {
      showToast('先输入库名');
      return;
    }

    this.setData({ saving: true });
    try {
      const library = await createLibrary(name, 'course');
      wx.redirectTo({ url: `${routes.libraryDetail}?libraryId=${library._id}` });
    } catch {
      showToast('创建失败');
      this.setData({ saving: false });
    }
  },
});
