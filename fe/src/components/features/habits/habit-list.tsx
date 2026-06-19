'use client';

import React, { useState } from 'react';
import { useHabits, Habit } from '../../../services';
import HabitCard from './habit-card';
import HabitDialog from './habit-dialog';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';

export default function HabitList() {
  const { habits, isLoading } = useHabits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const handleOpenEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setHabitToEdit(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-r-2" />
        <span className="text-sm text-text-secondary">Loading habits...</span>
      </div>
    );
  }

  const buildHabits = habits.filter((h) => h.type === 'build');
  const breakHabits = habits.filter((h) => h.type === 'break');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Your Daily Tracking</h2>
          <p className="text-sm text-text-secondary mt-1">Mark completions and monitor streaks</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="flex items-center space-x-1.5 cursor-pointer">
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Habits to Build column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-2">
            <span className="text-sm font-bold text-accent-build uppercase tracking-wider">Habits to Build</span>
            <span className="text-xs bg-accent-build/10 text-accent-build px-2 py-0.5 rounded-full font-bold">
              {buildHabits.length}
            </span>
          </div>
          {buildHabits.length === 0 ? (
            <div className="text-center p-8 bg-card border border-border rounded-xl">
              <p className="text-sm text-text-secondary">No habits to build yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {buildHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onEdit={handleOpenEdit} />
              ))}
            </div>
          )}
        </div>

        {/* Habits to Break column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-2">
            <span className="text-sm font-bold text-accent-break uppercase tracking-wider">Habits to Break</span>
            <span className="text-xs bg-accent-break/10 text-accent-break px-2 py-0.5 rounded-full font-bold">
              {breakHabits.length}
            </span>
          </div>
          {breakHabits.length === 0 ? (
            <div className="text-center p-8 bg-card border border-border rounded-xl">
              <p className="text-sm text-text-secondary">No habits to break yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {breakHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} onEdit={handleOpenEdit} />
              ))}
            </div>
          )}
        </div>
      </div>

      <HabitDialog open={dialogOpen} onOpenChange={handleDialogChange} habitToEdit={habitToEdit} />
    </div>
  );
}
