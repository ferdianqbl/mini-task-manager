import api from '../../lib/api';
import { Habit } from './types';
import { ApiResponse } from '../types';

export async function getHabits(): Promise<ApiResponse<Habit[]>> {
  const res = await api.get<ApiResponse<Habit[]>>('/api/habits');
  return res.data;
}
