export interface SuccessResponseDto<T = any> {
  success: true;
  data: T;
  timestamp: string;
}