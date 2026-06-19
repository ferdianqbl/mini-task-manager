import api from '../../lib/api';
import { Habit, CreateHabitPayload } from './types';
import { ApiResponse } from '../types';

export async function createHabit(payload: CreateHabitPayload): Promise<ApiResponse<Habit>> {
  const res = await api.post<ApiResponse<Habit>>('/api/habits', payload);
  return res.data;
}
