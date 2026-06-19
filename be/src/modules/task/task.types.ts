export type TaskStatus = "to_do" | "pending" | "in_progress" | "done";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  creator_username?: string; // populated via join for admins
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  task_id: number | null;
  task_title: string;
  actor: string;
  old_status: TaskStatus | null;
  new_status: TaskStatus;
  changed_at: Date;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  user_id: number;
}

/**
 * Validates if a task can transition from a given status to a target status
 * Following: to_do -> pending -> in_progress -> done
 */
export const isValidTransition = (
  from: TaskStatus | null,
  to: TaskStatus,
): boolean => {
  if (from === null) {
    return to === "to_do";
  }
  if (from === "to_do") {
    return to === "pending";
  }
  if (from === "pending") {
    return to === "in_progress";
  }
  if (from === "in_progress") {
    return to === "done";
  }
  return false; // 'done' is terminal, or other transitions are invalid
};
