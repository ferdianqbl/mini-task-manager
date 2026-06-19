import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../db/db";
import {
  AuditLog,
  CreateTaskDTO,
  Task,
  TaskStatus,
  isValidTransition,
} from "./task.types";

export class TaskRepository {
  async listTasks(userId: number, isAdmin: boolean): Promise<Task[]> {
    if (isAdmin) {
      // Admins see all tasks with creator usernames
      const [rows] = (await pool.query(
        `SELECT t.*, u.username as creator_username 
         FROM tasks t 
         JOIN users u ON t.user_id = u.id 
         ORDER BY t.created_at DESC`,
      )) as [RowDataPacket[], unknown];
      return rows as Task[];
    } else {
      // Standard users only see their own tasks
      const [rows] = (await pool.query(
        "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      )) as [RowDataPacket[], unknown];
      return rows as Task[];
    }
  }

  async findTaskById(taskId: number): Promise<Task | null> {
    const [rows] = (await pool.query("SELECT * FROM tasks WHERE id = ?", [
      taskId,
    ])) as [RowDataPacket[], unknown];

    if (rows.length === 0) return null;
    return rows[0] as Task;
  }

  async createTask(dto: CreateTaskDTO, actor: string): Promise<Task> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert the task
      const [taskResult] = (await connection.query(
        'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, "to_do")',
        [dto.user_id, dto.title, dto.description || null],
      )) as [ResultSetHeader, unknown];

      const taskId = taskResult.insertId;

      // 2. Insert initial creation log
      await connection.query(
        'INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, null, "to_do")',
        [taskId, dto.title, actor],
      );

      await connection.commit();

      const task = await this.findTaskById(taskId);
      if (!task) throw new Error("Failed to retrieve task after creation.");
      return task;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async updateTaskStatus(
    taskId: number,
    newStatus: TaskStatus,
    actor: string,
  ): Promise<Task> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch current task state using row-level lock (FOR UPDATE)
      const [rows] = (await connection.query(
        "SELECT * FROM tasks WHERE id = ? FOR UPDATE",
        [taskId],
      )) as [RowDataPacket[], unknown];

      if (rows.length === 0) {
        throw new Error("Task not found.");
      }

      const task = rows[0] as Task;
      const oldStatus = task.status;

      // 2. Idempotency Check: if status is the same, do nothing
      if (oldStatus === newStatus) {
        await connection.commit();
        return task;
      }

      // 3. Domain Validation: check transition flow
      if (!isValidTransition(oldStatus, newStatus)) {
        throw new Error(
          `Invalid status transition from '${oldStatus}' to '${newStatus}'. Status must follow: to_do -> pending -> in_progress -> done.`,
        );
      }

      // 4. Update status in tasks table
      await connection.query("UPDATE tasks SET status = ? WHERE id = ?", [
        newStatus,
        taskId,
      ]);

      // 5. Insert transition log
      await connection.query(
        "INSERT INTO audit_logs (task_id, task_title, actor, old_status, new_status) VALUES (?, ?, ?, ?, ?)",
        [taskId, task.title, actor, oldStatus, newStatus],
      );

      await connection.commit();

      const updatedTask = await this.findTaskById(taskId);
      if (!updatedTask)
        throw new Error("Failed to retrieve task after update.");
      return updatedTask;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async deleteTask(taskId: number): Promise<boolean> {
    const [result] = (await pool.query("DELETE FROM tasks WHERE id = ?", [
      taskId,
    ])) as [ResultSetHeader, unknown];
    return result.affectedRows > 0;
  }

  async getTaskAuditLogs(
    taskId: number,
    actorUsername: string | null,
  ): Promise<AuditLog[]> {
    if (actorUsername) {
      // Standard users only see logs they created for this task
      const [rows] = (await pool.query(
        "SELECT * FROM audit_logs WHERE task_id = ? AND actor = ? ORDER BY changed_at ASC",
        [taskId, actorUsername],
      )) as [RowDataPacket[], unknown];
      return rows as AuditLog[];
    } else {
      // Admins see all logs for the task
      const [rows] = (await pool.query(
        "SELECT * FROM audit_logs WHERE task_id = ? ORDER BY changed_at ASC",
        [taskId],
      )) as [RowDataPacket[], unknown];
      return rows as AuditLog[];
    }
  }

  async getGlobalAuditLogs(): Promise<AuditLog[]> {
    // Exclusively for admins: returns all logs across all tasks
    const [rows] = (await pool.query(
      "SELECT * FROM audit_logs ORDER BY changed_at DESC",
    )) as [RowDataPacket[], unknown];
    return rows as AuditLog[];
  }
}

export const taskRepository = new TaskRepository();
