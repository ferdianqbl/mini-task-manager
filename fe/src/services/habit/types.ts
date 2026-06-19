export interface Habit {
  id: number;
  user_id: number;
  name: string;
  type: 'build' | 'break';
  created_at: string;
  updated_at: string;
  streak: number;
  logs: string[];
  weekly_rate?: number;
  completed_count?: number;
  missed_days?: string[];
}

export interface CreateHabitPayload {
  name: string;
  type: 'build' | 'break';
}

export interface UpdateHabitPayload {
  id: number;
  name: string;
}
