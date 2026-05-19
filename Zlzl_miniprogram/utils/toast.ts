export function showToast(title: string, icon: WechatMiniprogram.ShowToastOption['icon'] = 'none'): void {
  wx.showToast({
    title,
    icon,
  });
}

