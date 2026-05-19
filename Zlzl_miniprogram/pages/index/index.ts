import { routes } from '../../constants/routes';

Page({
  data: {
    title: 'Zlzl MVP',
    subtitle: '从课程学习库开始验证记忆闭环',
  },

  goToMainPath() {
    wx.navigateTo({
      url: routes.libraryList,
    });
  },
});

