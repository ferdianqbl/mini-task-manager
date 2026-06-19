import api from '../../lib/api';
import { ApiResponse } from '../types';

export async function deleteHabit(id: number): Promise<ApiResponse<{ message: string }>> {
  const res = await api.delete<ApiResponse<{ message: string }>>(`/api/habits/${id}`);
  return res.data;
}
