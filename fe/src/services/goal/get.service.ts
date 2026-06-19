import api from '../../lib/api';
import { Goal } from './types';
import { ApiResponse } from '../types';

export async function getGoals(): Promise<ApiResponse<Goal[]>> {
  const res = await api.get<ApiResponse<Goal[]>>('/api/goals');
  return res.data;
}
