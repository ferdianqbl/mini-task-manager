export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserDTO {
  email: string;
  password_hash: string;
}
