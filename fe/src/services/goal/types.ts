export interface Goal {
  id: number;
  user_id: number;
  habit_id: number;
  title: string;
  target_streak: number;
  created_at: string;
  updated_at: string;
  current_streak: number;
  progress_percentage: number;
  status: 'active' | 'achieved';
  habit_name: string;
  habit_type: 'build' | 'break';
}

export interface CreateGoalPayload {
  habit_id: number;
  title: string;
  target_streak: number;
}

export interface UpdateGoalPayload {
  id: number;
  title: string;
  target_streak: number;
}
