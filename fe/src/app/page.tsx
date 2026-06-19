'use client';

import React from 'react';
import { useAuth } from '../context/auth-context';
import HabitList from '../components/features/habits/habit-list';
import GoalList from '../components/features/goals/goal-list';
import { LogOut, Flame } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090D16] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-r-2" />
        <span className="text-sm text-text-secondary">Resolving user session...</span>
      </div>
    );
  }

  if (!user) {
    return null; // Let AuthProvider handle redirect
  }

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
              <Flame className="h-5 w-5 text-[#090D16] fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Habit Shaper
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs font-semibold text-text-secondary bg-white/5 px-3 py-1.5 rounded-full border border-border">
              Logged in: <span className="text-text-primary font-bold">{user.email}</span>
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

      {/* Dashboard body grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Goals widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-xl backdrop-blur-md">
              <GoalList />
            </div>
          </div>

          {/* Right Column: Habits tracking lists */}
          <div className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-xl backdrop-blur-md">
            <HabitList />
          </div>
        </div>
      </main>

      {/* Simple accessible footer */}
      <footer className="border-t border-border bg-[#0B0F19]/40 py-4 text-center mt-12">
        <p className="text-[11px] text-text-secondary font-medium uppercase tracking-wider">
          Habit Shaper &copy; 2026. Keep shaping positive routines.
        </p>
      </footer>
    </div>
  );
}
