export type TaskStatus = "to_do" | "pending" | "in_progress" | "done";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  creator_username?: string; // Populated for admin global list
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  task_id: number | null;
  task_title: string;
  actor: string;
  old_status: TaskStatus | null;
  new_status: TaskStatus;
  changed_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
}

export interface UpdateTaskStatusDTO {
  status: TaskStatus;
}
