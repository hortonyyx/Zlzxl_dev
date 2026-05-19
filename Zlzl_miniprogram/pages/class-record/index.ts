import { routes } from '../../constants/routes';
import { submitManualClass } from '../../services/class-session';
import { showToast } from '../../utils/toast';

Page({
  data: {
    title: '手动输入课堂内容',
    libraryId: '',
    content:
      '这节课继续讨论现代主义设计。老师提到功能主义带来了秩序,但也可能忽略个体经验。后现代设计用多元符号回应这个问题。',
    submitting: false,
  },

  onLoad(options: Record<string, string | undefined>) {
    this.setData({ libraryId: options.libraryId ?? '' });
  },

  onContentInput(event: WechatMiniprogram.Input) {
    this.setData({ content: event.detail.value });
  },

  async submitClass() {
    const content = String(this.data.content).trim();
    if (!content) {
      showToast('先输入课堂内容');
      return;
    }

    this.setData({ submitting: true });
    try {
      const result = await submitManualClass(this.data.libraryId, content);
      wx.redirectTo({
        url: `${routes.classProcessing}?libraryId=${this.data.libraryId}&sessionId=${result.sessionId}`,
      });
    } catch {
      showToast('提交失败');
      this.setData({ submitting: false });
    }
  },
});
