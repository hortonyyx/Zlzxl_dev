type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestData = string | WechatMiniprogram.IAnyObject | ArrayBuffer;

export interface RequestOptions<TData extends RequestData = WechatMiniprogram.IAnyObject> {
  url: string;
  method?: RequestMethod;
  data?: TData;
  header?: WechatMiniprogram.IAnyObject;
}

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  header: WechatMiniprogram.IAnyObject;
}

const DEFAULT_TIMEOUT = 15000;

export function request<TResponse, TData extends RequestData = WechatMiniprogram.IAnyObject>(
  options: RequestOptions<TData>,
): Promise<ApiResponse<TResponse>> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method ?? 'GET',
      data: options.data,
      header: options.header,
      timeout: DEFAULT_TIMEOUT,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve({
            data: response.data as TResponse,
            statusCode: response.statusCode,
            header: response.header,
          });
          return;
        }

        reject(new Error(`请求失败，状态码 ${response.statusCode}`));
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

