import api from '../../lib/api';
import { ApiResponse, User } from '../types';

export async function loginAPI(username: string, password: string): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>('/api/auth/login', { username, password });
  return res.data.data.user;
}

export async function registerAPI(username: string, password: string): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>('/api/auth/register', { username, password });
  return res.data.data.user;
}

export async function logoutAPI(): Promise<void> {
  await api.post<ApiResponse<null>>('/api/auth/logout');
}

export async function getMeAPI(): Promise<User> {
  const res = await api.get<ApiResponse<{ user: User }>>('/api/users/me');
  return res.data.data.user;
}
