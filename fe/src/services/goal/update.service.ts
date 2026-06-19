import api from '../../lib/api';
import { Goal, UpdateGoalPayload } from './types';
import { ApiResponse } from '../types';

export async function updateGoal(payload: UpdateGoalPayload): Promise<ApiResponse<Goal>> {
  const res = await api.put<ApiResponse<Goal>>(`/api/goals/${payload.id}`, {
    title: payload.title,
    target_streak: payload.target_streak,
  });
  return res.data;
}
