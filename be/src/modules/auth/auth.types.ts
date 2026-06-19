export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
}

export interface JWTPayload {
  id: number;
  username: string;
  role: "ADMIN" | "USER";
}
