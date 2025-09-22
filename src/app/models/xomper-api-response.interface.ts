export interface XomperResponse<T = any> {
  Success: boolean;
  Message: string;
  ResponseData: T;
}