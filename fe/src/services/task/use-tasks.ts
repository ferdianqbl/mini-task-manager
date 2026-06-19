import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { AuditLog, CreateTaskDTO, Task, TaskStatus } from "./types";
import {
  listTasksAPI,
  createTaskAPI,
  updateTaskStatusAPI,
  deleteTaskAPI,
  getTaskAuditLogsAPI,
  getGlobalAuditLogsAPI,
} from "./task.service";

// Fetch all tasks
export function useTasks() {
  return useQuery<Task[], Error, Task[]>({
    queryKey: ["tasks"],
    queryFn: () => listTasksAPI(),
  });
}

// Create a task
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskDTO>({
    mutationFn: (dto) => createTaskAPI(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["global-audit-logs"] });
      toast.success("Task created successfully");
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err.message;
      toast.error("Failed to create task", { description: msg });
    },
  });
}

// Update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, { id: number; status: TaskStatus }>({
    mutationFn: ({ id, status }) => updateTaskStatusAPI(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-audit-logs", data.id] });
      queryClient.invalidateQueries({ queryKey: ["global-audit-logs"] });
      toast.success(`Task moved to ${data.status.replace("_", " ")}`);
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err.message;
      toast.error("Failed to update task status", { description: msg });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, number>({
    mutationFn: (id) => deleteTaskAPI(id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-audit-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["global-audit-logs"] });
      toast.success("Task deleted successfully");
    },
    onError: (err) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err.message;
      toast.error("Failed to delete task", { description: msg });
    },
  });
}

// Fetch task-specific audit logs
export function useTaskAuditLogs(taskId: number, enabled = true) {
  return useQuery<AuditLog[], Error, AuditLog[]>({
    queryKey: ["task-audit-logs", taskId],
    queryFn: () => getTaskAuditLogsAPI(taskId),
    enabled: !!taskId && enabled,
  });
}

// Fetch global system audit logs (ADMIN only)
export function useGlobalAuditLogs(enabled = true) {
  return useQuery<AuditLog[], Error, AuditLog[]>({
    queryKey: ["global-audit-logs"],
    queryFn: () => getGlobalAuditLogsAPI(),
    enabled,
  });
}
