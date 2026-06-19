export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: 'ADMIN' | 'USER';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserDTO {
  username: string;
  password_hash: string;
  role?: 'ADMIN' | 'USER';
}
