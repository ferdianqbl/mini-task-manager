'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGoals, useHabits, Goal } from '../../../services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: Goal | null;
}

export default function GoalDialog({ open, onOpenChange, goalToEdit }: GoalDialogProps) {
  const { createGoal, isCreating, updateGoal, isUpdating } = useGoals();
  const { habits } = useHabits();
  const [title, setTitle] = useState('');
  const [habitId, setHabitId] = useState<string>('');
  const [targetStreak, setTargetStreak] = useState<number>(30);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Close combobox popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search query when open state changes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setComboboxOpen(false);
    }
  }, [open]);

  const isEdit = !!goalToEdit;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open && goalToEdit) {
      setTitle(goalToEdit.title);
      setHabitId(String(goalToEdit.habit_id));
      setTargetStreak(goalToEdit.target_streak);
    } else if (open) {
      setTitle('');
      setHabitId('');
      setTargetStreak(30);
    }
  }, [open, goalToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length === 0) {
      toast.error('Goal title is required.');
      return;
    }
    if (!isEdit && !habitId) {
      toast.error('Please select a habit to link this goal to.');
      return;
    }
    if (targetStreak <= 0) {
      toast.error('Target streak must be greater than 0.');
      return;
    }

    try {
      if (isEdit) {
        await updateGoal({
          id: goalToEdit.id,
          title,
          target_streak: targetStreak,
        });
        toast.success('Goal updated!', {
          description: `"${title}" challenge has been updated.`,
        });
      } else {
        await createGoal({
          title,
          habit_id: parseInt(habitId),
          target_streak: targetStreak,
        });
        toast.success('Goal created!', {
          description: `"${title}" challenge has been set with a ${targetStreak}-day target.`,
        });
      }
      onOpenChange(false);
    } catch (err) {
      const action = isEdit ? 'update' : 'create';
      const message = err instanceof Error ? err.message : `Failed to ${action} goal.`;
      toast.error(`Failed to ${action} goal`, { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Challenge Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Goal Challenge Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 30 Days Running, 14 Days Sugar Free"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Link to Habit
            </label>
            {isEdit ? (
              <Input
                value={goalToEdit?.habit_name}
                disabled
                className="bg-[#0F172A]/50 text-text-secondary cursor-not-allowed border-border"
              />
            ) : habits.length === 0 ? (
              <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-md">
                You must create a habit first before you can set a goal!
              </p>
            ) : (
              <div className="relative" ref={comboboxRef}>
                <button
                  type="button"
                  onClick={() => setComboboxOpen(!comboboxOpen)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-[#0F172A]/50 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none text-text-primary placeholder:text-gray-500 cursor-pointer text-left"
                >
                  <span className="truncate">
                    {habitId
                      ? habits.find((h) => String(h.id) === habitId)?.name +
                        ` (${habits.find((h) => String(h.id) === habitId)?.type === 'build' ? 'Build' : 'Break'})`
                      : '-- Select a Habit --'}
                  </span>
                  <svg
                    className={`h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${comboboxOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {comboboxOpen && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-border bg-[#090D16] shadow-lg shadow-black/40 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center border-b border-border px-3 bg-white/[0.01]">
                      <svg
                        className="mr-2 h-4 w-4 shrink-0 opacity-50 text-text-secondary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search habit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50 text-text-primary"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[180px] overflow-y-auto p-1 space-y-0.5">
                      {habits.filter((h) =>
                        h.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 ? (
                        <p className="p-2 text-xs text-text-secondary text-center">No habits found.</p>
                      ) : (
                        habits
                          .filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => {
                                setHabitId(String(h.id));
                                setComboboxOpen(false);
                                setSearchQuery('');
                              }}
                              className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-xs text-left cursor-pointer transition-colors duration-150 ${
                                habitId === String(h.id)
                                  ? 'bg-primary text-primary-foreground font-semibold'
                                  : 'text-text-primary hover:bg-white/[0.05]'
                              }`}
                            >
                              <span className="truncate mr-2">{h.name}</span>
                              <span
                                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                                  habitId === String(h.id)
                                    ? 'bg-black/15 text-primary-foreground'
                                    : h.type === 'build'
                                    ? 'bg-accent-build/10 text-accent-build'
                                    : 'bg-accent-break/10 text-accent-break'
                                }`}
                              >
                                {h.type === 'build' ? 'Build' : 'Break'}
                              </span>
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Target Streak Count (Days)
            </label>
            <Input
              type="number"
              min="1"
              value={targetStreak || ''}
              onChange={(e) => setTargetStreak(parseInt(e.target.value))}
              placeholder="e.g., 30, 90"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (!isEdit && (habits.length === 0 || !habitId))} 
              className="cursor-pointer"
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
