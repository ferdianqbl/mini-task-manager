import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import api from "../../lib/api";
import { ApiResponse } from "../types";
import { AuditLog, CreateTaskDTO, Task, TaskStatus } from "./types";

// Fetch all tasks
export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task[]>>("/api/tasks");
      return res.data.data;
    },
  });
}

// Create a task
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskDTO>({
    mutationFn: async (dto) => {
      const res = await api.post<ApiResponse<Task>>("/api/tasks", dto);
      return res.data.data;
    },
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
    mutationFn: async ({ id, status }) => {
      const res = await api.put<ApiResponse<Task>>(`/api/tasks/${id}/status`, {
        status,
      });
      return res.data.data;
    },
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
    mutationFn: async (id) => {
      await api.delete<ApiResponse<{ id: number }>>(`/api/tasks/${id}`);
      return id;
    },
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
  return useQuery<AuditLog[]>({
    queryKey: ["task-audit-logs", taskId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AuditLog[]>>(
        `/api/tasks/${taskId}/audit-logs`,
      );
      return res.data.data;
    },
    enabled: !!taskId && enabled,
  });
}

// Fetch global system audit logs (ADMIN only)
export function useGlobalAuditLogs(enabled = true) {
  return useQuery<AuditLog[]>({
    queryKey: ["global-audit-logs"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AuditLog[]>>(
        "/api/tasks/global-audit-logs",
      );
      return res.data.data;
    },
    enabled,
  });
}
