import api from '../../lib/api';
import { ApiResponse } from '../types';

export async function toggleLog(id: number, date: string): Promise<ApiResponse<{ message: string; logged: boolean }>> {
  const res = await api.post<ApiResponse<{ message: string; logged: boolean }>>(`/api/habits/${id}/toggle`, { date });
  return res.data;
}
