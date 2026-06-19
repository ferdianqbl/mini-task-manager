export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
}
