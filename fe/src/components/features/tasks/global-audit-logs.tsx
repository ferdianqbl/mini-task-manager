"use client";

import { TaskStatus } from "../../../services/task/types";
import { useGlobalAuditLogs } from "../../../services/task/use-tasks";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";

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

export default function GlobalAuditLogs() {
  const {
    data: logs,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGlobalAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const filteredLogs = logs?.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.task_title.toLowerCase().includes(term) ||
      log.actor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center space-x-2">
            <span>System Audit Log Stream</span>
            <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-bold font-mono">
              ADMIN ONLY
            </span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Chronological audit trail of all task state changes across the
            application.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search title or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#090D16]/60 border border-border rounded-md text-xs text-foreground placeholder:text-gray-600 focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2 bg-white/5 hover:bg-white/10 border border-border rounded-md text-text-secondary hover:text-text-primary transition disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
              Refresh
            </span>
          </button>
        </div>
      </div>

      {/* Audit logs content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2" />
          <span className="text-sm text-text-secondary">
            Retrieving logs from database...
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-destructive/20 rounded-lg bg-destructive/5">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <h4 className="font-bold text-text-primary text-sm">
            Failed to retrieve logs
          </h4>
          <p className="text-xs text-text-secondary max-w-sm">
            {error instanceof Error
              ? error.message
              : "Ensure you have proper admin privileges."}
          </p>
        </div>
      ) : !filteredLogs || filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/30 rounded-lg">
          <span className="text-sm text-text-secondary">
            {searchTerm
              ? "No matches found for your search term."
              : "No audit log activities recorded."}
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/40 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#090D16]/50 border-b border-border/40 text-text-secondary font-bold uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Task Info</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredLogs.map((log) => {
                const isCreation = log.old_status === null;
                const isDeleted = log.task_id === null;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-white/1 transition duration-150"
                  >
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap text-text-secondary font-mono text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary/75" />
                        <span>{formatDate(log.changed_at)}</span>
                      </div>
                    </td>

                    {/* Task Title & Status badge */}
                    <td className="p-4">
                      <div className="flex flex-col space-y-1 max-w-[250px] md:max-w-xs">
                        <span
                          className="font-bold text-text-primary truncate"
                          title={log.task_title}
                        >
                          {log.task_title}
                        </span>
                        {isDeleted ? (
                          <span className="inline-flex w-fit px-1.5 py-0.5 text-[9px] font-semibold bg-destructive/10 text-destructive border border-destructive/20 rounded">
                            Deleted (ID: {log.id})
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-secondary/70">
                            Task ID: {log.task_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-primary/75" />
                        <span className="font-semibold text-text-primary">
                          {log.actor}
                        </span>
                      </div>
                    </td>

                    {/* Transition details */}
                    <td className="p-4 whitespace-nowrap">
                      {isCreation ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                            Created as:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors.to_do}`}
                          >
                            {statusLabels.to_do}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
