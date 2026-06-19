import api from '../../lib/api';
import { Habit, UpdateHabitPayload } from './types';
import { ApiResponse } from '../types';

export async function updateHabit(payload: UpdateHabitPayload): Promise<ApiResponse<Habit>> {
  const res = await api.put<ApiResponse<Habit>>(`/api/habits/${payload.id}`, { name: payload.name });
  return res.data;
}
