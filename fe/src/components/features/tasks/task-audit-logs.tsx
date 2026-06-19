"use client";

import { TaskStatus } from "../../../services/task/types";
import { useTaskAuditLogs } from "../../../services/task/use-tasks";
import { ArrowRight, Calendar, User, X } from "lucide-react";

interface TaskAuditLogsProps {
  taskId: number;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const statusColors: Record<TaskStatus, string> = {
  to_do: "text-text-secondary bg-white/5 border-white/10",
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  in_progress: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  done: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function TaskAuditLogs({
  taskId,
  taskTitle,
  isOpen,
  onClose,
}: TaskAuditLogsProps) {
  const { data: logs, isLoading } = useTaskAuditLogs(taskId, isOpen);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-popover border-l border-border shadow-2xl flex flex-col animate-slide-in">
      {/* Glow accent */}
      <div className="absolute top-[20%] right-[-50%] w-full h-full rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            Audit Log Trail
          </h3>
          <p
            className="text-xs text-text-secondary mt-1 max-w-[280px] truncate"
            title={taskTitle}
          >
            Task: {taskTitle}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition p-1 hover:bg-white/5 rounded-md cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Logs timeline list */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2" />
            <span className="text-xs text-text-secondary">
              Retrieving logs...
            </span>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <span className="text-sm text-text-secondary">
              No log records found for this task.
            </span>
          </div>
        ) : (
          <div className="relative border-l-2 border-border ml-3 pl-6 space-y-8">
            {logs.map((log) => {
              const isCreation = log.old_status === null;
              return (
                <div key={log.id} className="relative">
                  {/* Timeline point */}
                  <span className="absolute left-[-31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#090D16] border-2 border-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>

                  <div>
                    {/* Timestamp */}
                    <div className="flex items-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(log.changed_at)}</span>
                    </div>

                    {/* Log Details */}
                    <div className="bg-[#090D16]/50 border border-border rounded-lg p-3.5 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs text-text-secondary font-medium">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>
                          Action by:{" "}
                          <span className="text-text-primary font-bold">
                            {log.actor}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 text-xs pt-1 border-t border-border/30">
                        {isCreation ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-text-secondary">
                              Task created and status set to
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors.to_do}`}
                            >
                              {statusLabels.to_do}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-text-secondary">
                              Status transitioned:
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[log.old_status as TaskStatus]}`}
                            >
                              {statusLabels[log.old_status as TaskStatus]}
                            </span>
                            <ArrowRight className="h-3 w-3 text-text-secondary" />
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors[log.new_status]}`}
                            >
                              {statusLabels[log.new_status]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
