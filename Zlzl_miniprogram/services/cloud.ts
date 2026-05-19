export const useMockCloud = true;

export type CloudFunctionName = 'submitClass' | 'advanceClass' | 'planStudy' | 'gradeModule';

export async function callCloud<TRequest, TResponse>(
  name: CloudFunctionName,
  data: TRequest,
  mockHandler: (payload: TRequest) => TResponse | Promise<TResponse>,
): Promise<TResponse> {
  if (useMockCloud) {
    return mockHandler(data);
  }

  throw new Error(`Cloud function ${name} is not connected in the mock MVP stage.`);
}
