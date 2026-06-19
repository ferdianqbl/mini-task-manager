import api from '../../lib/api';
import { ApiResponse } from '../types';

export async function deleteGoal(id: number): Promise<ApiResponse<{ message: string }>> {
  const res = await api.delete<ApiResponse<{ message: string }>>(`/api/goals/${id}`);
  return res.data;
}
