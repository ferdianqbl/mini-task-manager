"use client";

import { ArrowRight, CheckCircle2, History, Trash2, User } from "lucide-react";
import { useAuth } from "../../../store/auth-store";
import { Task, TaskStatus } from "../../../services/task/types";
import {
  useDeleteTask,
  useUpdateTaskStatus,
} from "../../../services/task/use-tasks";

interface TaskCardProps {
  task: Task;
  onOpenLogs: (taskId: number, taskTitle: string) => void;
}

const statusTransitionMap: Record<TaskStatus, TaskStatus | null> = {
  to_do: "pending",
  pending: "in_progress",
  in_progress: "done",
  done: null,
};

const transitionLabels: Record<TaskStatus, string> = {
  to_do: "Move to Pending",
  pending: "Start Progress",
  in_progress: "Complete Task",
  done: "",
};

export default function TaskCard({ task, onOpenLogs }: TaskCardProps) {
  const { user } = useAuth();
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateTaskStatus();
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();

  const nextStatus = statusTransitionMap[task.status];
  const transitionLabel = nextStatus ? transitionLabels[task.status] : "";

  const handleTransition = async () => {
    if (!nextStatus) return;
    try {
      await updateStatus({ id: task.id, status: nextStatus });
    } catch {
      // Mutation handles alerts
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${task.title}"?\nIts audit logs will be retained.`,
      )
    ) {
      return;
    }
    try {
      await deleteTask(task.id);
    } catch {
      // Mutation handles alerts
    }
  };

  return (
    <div className="bg-[#0B0F19]/60 border border-border hover:border-border-hover rounded-xl p-5 shadow-lg backdrop-blur-md transition group duration-200 flex flex-col space-y-4">
      {/* Title & Delete Action */}
      <div className="flex items-start justify-between">
        <h4 className="font-bold text-text-primary text-sm group-hover:text-white transition line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center space-x-1.5 opacity-60 group-hover:opacity-100 transition pl-2">
          <button
            onClick={() => onOpenLogs(task.id, task.title)}
            title="View Task Audit Logs"
            className="p-1.5 hover:bg-white/5 hover:text-primary rounded-md transition text-text-secondary cursor-pointer"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Task"
            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition text-text-secondary disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description ? (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
          {task.description}
        </p>
      ) : (
        <p className="text-xs text-text-secondary/40 italic leading-relaxed">
          No description provided
        </p>
      )}

      {/* Footer Details */}
      <div className="flex flex-col space-y-3 pt-3 border-t border-border/30 mt-auto">
        {/* Creator Username - Shown to Admin users to identify task creators */}
        {user?.role === "ADMIN" && task.creator_username && (
          <div className="flex items-center space-x-1 text-[10px] text-text-secondary bg-white/5 px-2 py-1 rounded w-fit border border-border">
            <User className="h-3 w-3 text-primary" />
            <span>
              Owner:{" "}
              <span className="text-text-primary font-semibold">
                {task.creator_username}
              </span>
            </span>
          </div>
        )}

        {/* Transition / Terminal State buttons */}
        <div className="flex items-center justify-between pt-1">
          {task.status === "done" ? (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-400/5 px-3 py-1.5 rounded-md border border-emerald-400/10">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={handleTransition}
              disabled={isUpdating}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary/90 px-3 py-2 rounded-md border border-primary/20 hover:border-primary transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isUpdating ? "Moving..." : transitionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Quick Date Display */}
          <span className="text-[10px] text-text-secondary/60">
            {new Date(task.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
