"use client";

import { Task, TaskStatus } from "../../../services/task/types";
import TaskCard from "./task-card";

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  onOpenLogs: (taskId: number, taskTitle: string) => void;
}

const columns: {
  status: TaskStatus;
  label: string;
  colorClass: string;
  borderClass: string;
}[] = [
  {
    status: "to_do",
    label: "To Do",
    colorClass: "bg-white/5 text-text-primary border-white/10",
    borderClass: "border-white/5",
  },
  {
    status: "pending",
    label: "Pending",
    colorClass: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    borderClass: "border-amber-400/5",
  },
  {
    status: "in_progress",
    label: "In Progress",
    colorClass: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    borderClass: "border-cyan-400/5",
  },
  {
    status: "done",
    label: "Done",
    colorClass: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    borderClass: "border-emerald-400/5",
  },
];

export default function TaskBoard({
  tasks,
  isLoading,
  onOpenLogs,
}: TaskBoardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-5 h-[350px] space-y-4"
          >
            <div className="h-6 bg-white/5 rounded-md w-1/3" />
            <div className="h-[120px] bg-white/5 rounded-md" />
            <div className="h-[120px] bg-white/5 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {columns.map((col) => {
        const colTasks = getTasksByStatus(col.status);

        return (
          <div
            key={col.status}
            className={`bg-card/40 border border-border rounded-xl p-4 flex flex-col min-h-[500px] max-h-[800px] relative`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${col.colorClass}`}
                >
                  {col.label}
                </span>
                <span className="text-[11px] font-bold text-text-secondary">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar">
              {colTasks.length === 0 ? (
                <div className="h-40 border border-dashed border-border/20 rounded-lg flex items-center justify-center text-center p-4">
                  <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium">
                    Empty Column
                  </span>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onOpenLogs={onOpenLogs} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
