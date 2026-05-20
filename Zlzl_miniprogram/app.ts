import { CLOUD_ENV_ID, isCloudEnvConfigured } from './constants/cloud';

App<IAppOption>({
  globalData: {},
  onLaunch() {
    if (isCloudEnvConfigured()) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
      });
    }
  },
});
