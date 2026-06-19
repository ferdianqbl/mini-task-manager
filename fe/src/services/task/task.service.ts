import api from '../../lib/api';
import { ApiResponse } from '../types';
import { Task, AuditLog, CreateTaskDTO, TaskStatus } from './types';

export async function listTasksAPI(): Promise<Task[]> {
  const res = await api.get<ApiResponse<Task[]>>('/api/tasks');
  return res.data.data;
}

export async function createTaskAPI(dto: CreateTaskDTO): Promise<Task> {
  const res = await api.post<ApiResponse<Task>>('/api/tasks', dto);
  return res.data.data;
}

export async function updateTaskStatusAPI(id: number, status: TaskStatus): Promise<Task> {
  const res = await api.put<ApiResponse<Task>>(`/api/tasks/${id}/status`, { status });
  return res.data.data;
}

export async function deleteTaskAPI(id: number): Promise<number> {
  await api.delete<ApiResponse<{ id: number }>>(`/api/tasks/${id}`);
  return id;
}

export async function getTaskAuditLogsAPI(taskId: number): Promise<AuditLog[]> {
  const res = await api.get<ApiResponse<AuditLog[]>>(`/api/tasks/${taskId}/audit-logs`);
  return res.data.data;
}

export async function getGlobalAuditLogsAPI(): Promise<AuditLog[]> {
  const res = await api.get<ApiResponse<AuditLog[]>>('/api/tasks/global-audit-logs');
  return res.data.data;
}
