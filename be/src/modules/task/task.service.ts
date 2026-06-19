import { taskRepository } from './task.repository';
import { Task, AuditLog, TaskStatus } from './task.types';

export class TaskService {
  async listTasks(userId: number, role: 'ADMIN' | 'USER'): Promise<Task[]> {
    return taskRepository.listTasks(userId, role === 'ADMIN');
  }

  async createTask(userId: number, username: string, title: string, description?: string): Promise<Task> {
    if (!title || title.trim() === '') {
      throw new Error('Task title is required.');
    }
    return taskRepository.createTask({ title, description, user_id: userId }, username);
  }

  async updateTaskStatus(
    taskId: number,
    userId: number,
    username: string,
    role: 'ADMIN' | 'USER',
    newStatus: TaskStatus
  ): Promise<Task> {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }

    // Verify ownership for non-admin users
    if (role !== 'ADMIN' && task.user_id !== userId) {
      throw new Error('Access denied. You do not own this task.');
    }

    return taskRepository.updateTaskStatus(taskId, newStatus, username);
  }

  async deleteTask(taskId: number, userId: number, role: 'ADMIN' | 'USER'): Promise<boolean> {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }

    // Verify ownership for non-admin users
    if (role !== 'ADMIN' && task.user_id !== userId) {
      throw new Error('Access denied. You do not own this task.');
    }

    return taskRepository.deleteTask(taskId);
  }

  async getTaskAuditLogs(
    taskId: number,
    userId: number,
    username: string,
    role: 'ADMIN' | 'USER'
  ): Promise<AuditLog[]> {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }

    // Verify ownership for non-admin users
    if (role !== 'ADMIN' && task.user_id !== userId) {
      throw new Error('Access denied. You do not own this task.');
    }

    // Admins see all logs, standard users only see self logs
    const filterUsername = role === 'ADMIN' ? null : username;
    return taskRepository.getTaskAuditLogs(taskId, filterUsername);
  }

  async getGlobalAuditLogs(role: 'ADMIN' | 'USER'): Promise<AuditLog[]> {
    if (role !== 'ADMIN') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    return taskRepository.getGlobalAuditLogs();
  }
}

export const taskService = new TaskService();
