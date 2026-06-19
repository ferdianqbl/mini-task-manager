export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}
