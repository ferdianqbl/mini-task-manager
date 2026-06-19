"use client";

import { Activity, CheckSquare, Columns, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import GlobalAuditLogs from "../components/features/tasks/global-audit-logs";
import TaskAuditLogs from "../components/features/tasks/task-audit-logs";
import TaskBoard from "../components/features/tasks/task-board";
import TaskDialog from "../components/features/tasks/task-dialog";
import { useAuth } from "../store/auth-store";
import { useTasks } from "../services/task/use-tasks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout, isLoading: isAuthLoading, loadUser } = useAuth();
  const { data: tasks = [], isLoading: isTasksLoading } = useTasks();
  const router = useRouter();

  // Load user session on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Redirect if unauthorized
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // State for modals and panels
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"board" | "logs">("board");
  const [logDetails, setLogDetails] = useState<{
    id: number;
    title: string;
  } | null>(null);

  if (isAuthLoading || (!user && isAuthLoading)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090D16] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2" />
        <span className="text-sm text-text-secondary">
          Resolving user session...
        </span>
      </div>
    );
  }

  if (!user) {
    return null; // Let AuthProvider handle redirect
  }

  const handleOpenLogs = (id: number, title: string) => {
    setLogDetails({ id, title });
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-text-primary relative overflow-hidden flex flex-col">
      {/* Glow backgrounds */}
      <div className="absolute top-[-25%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="border-b border-border bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-cyan-500 shadow-md shadow-primary/20">
              <CheckSquare className="h-5 w-5 text-[#090D16] fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Mini Task Manager
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/95 px-4 py-2 rounded-md shadow-lg shadow-primary/10 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>

            <span className="hidden md:inline-block text-xs font-semibold text-text-secondary bg-white/5 px-3 py-1.5 rounded-full border border-border">
              Logged in:{" "}
              <span className="text-text-primary font-bold">
                {user.username}
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary/15 text-primary text-[9px] font-bold rounded-sm border border-primary/25 font-mono">
                {user.role}
              </span>
            </span>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-text-secondary hover:text-accent-break bg-white/5 hover:bg-accent-break/10 px-3.5 py-2 rounded-md border border-border hover:border-accent-break/20 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Tab Switching Toolbar */}
      {user.role === "ADMIN" && (
        <div className="bg-[#0B0F19]/40 border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("board")}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-md border transition cursor-pointer ${
                activeTab === "board"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Task Boards</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-md border transition cursor-pointer ${
                activeTab === "logs"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>System Audit Stream</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === "logs" && user.role === "ADMIN" ? (
          <GlobalAuditLogs />
        ) : (
          <TaskBoard
            tasks={tasks}
            isLoading={isTasksLoading}
            onOpenLogs={handleOpenLogs}
          />
        )}
      </main>

      {/* Modal Dialogs / Slide Overs */}
      <TaskDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <TaskAuditLogs
        isOpen={logDetails !== null}
        taskId={logDetails?.id || 0}
        taskTitle={logDetails?.title || ""}
        onClose={() => setLogDetails(null)}
      />

      {/* Simple accessible footer */}
      <footer className="border-t border-border bg-[#0B0F19]/40 py-4 text-center mt-12">
        <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
          Mini Task Manager &copy; 2026. Keep operations organized.
        </p>
      </footer>
    </div>
  );
}
