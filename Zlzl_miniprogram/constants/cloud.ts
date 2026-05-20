export const CLOUD_ENV_ID = 'cloud1-d3g0s64t152b5a542';

export function isCloudEnvConfigured(): boolean {
  return CLOUD_ENV_ID.trim().length > 0;
}
