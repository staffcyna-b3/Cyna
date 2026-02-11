export interface ErrorResponseDto {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}