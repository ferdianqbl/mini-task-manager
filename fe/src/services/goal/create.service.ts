import api from '../../lib/api';
import { Goal, CreateGoalPayload } from './types';
import { ApiResponse } from '../types';

export async function createGoal(payload: CreateGoalPayload): Promise<ApiResponse<Goal>> {
  const res = await api.post<ApiResponse<Goal>>('/api/goals', payload);
  return res.data;
}
