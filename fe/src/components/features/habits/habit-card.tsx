'use client';

import React, { useState } from 'react';
import { Habit, useHabits } from '../../../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { Trash2, Flame, Shield, AlertTriangle, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function HabitCard({ habit, onEdit }: { habit: Habit; onEdit?: (habit: Habit) => void }) {
  const { toggleLog, deleteHabit } = useHabits();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRelapseConfirm, setShowRelapseConfirm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();
  const isCompletedToday = habit.logs.includes(todayStr);

  const handleToggle = async () => {
    try {
      await toggleLog({ id: habit.id, date: todayStr });
      if (!isCompletedToday) {
        toast.success('Nice work! 🔥', {
          description: `"${habit.name}" marked as completed today.`,
        });
      } else {
        toast.info('Completion removed', {
          description: `"${habit.name}" unmarked for today.`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log completion.';
      toast.error('Failed to toggle log', { description: message });
    }
  };

  const handleRelapse = async () => {
    try {
      await toggleLog({ id: habit.id, date: todayStr });
      setShowRelapseConfirm(false);
      if (!isCompletedToday) {
        toast.warning('Relapse logged', {
          description: `Streak for "${habit.name}" has been reset. Stay strong!`,
        });
      } else {
        toast.info('Relapse removed', {
          description: `"${habit.name}" relapse for today has been undone.`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log relapse.';
      toast.error('Failed to log relapse', { description: message });
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteHabit(habit.id);
      toast.success('Habit deleted', {
        description: `"${habit.name}" has been removed.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete habit.';
      toast.error('Failed to delete habit', { description: message });
      setIsDeleting(false);
    }
    setShowDeleteDialog(false);
  };

  const renderWeeklyDots = () => {
    if (habit.type !== 'build') return null;

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      past7Days.push({
        label: daysOfWeek[d.getDay()],
        dateStr,
        isCompleted: habit.logs.includes(dateStr),
      });
    }

    return (
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Weekly Progress</span>
        <div className="flex justify-between mt-2 bg-[#0F172A]/30 p-2.5 rounded-lg border border-border/40">
          {past7Days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-1">
              <span className="text-[10px] text-text-secondary font-medium">{day.label}</span>
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                  day.isCompleted
                    ? 'bg-accent-build border-accent-build text-primary-foreground shadow-sm shadow-accent-build/20'
                    : 'border-border text-text-secondary hover:border-gray-500'
                }`}
              >
                {day.isCompleted ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/5 group">
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex-1 mr-2">
            <CardTitle className="text-lg font-bold text-text-primary tracking-tight group-hover:text-white transition">
              {habit.name}
            </CardTitle>
            <span className={`inline-block text-[10px] uppercase font-bold tracking-widest mt-1.5 px-2 py-0.5 rounded-full ${
              habit.type === 'build'
                ? 'bg-accent-build/10 text-accent-build'
                : 'bg-accent-break/10 text-accent-break'
            }`}>
              {habit.type === 'build' ? 'Habit to Build' : 'Habit to Break'}
            </span>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition duration-200">
            <button
              type="button"
              onClick={() => onEdit?.(habit)}
              className="text-text-secondary hover:text-primary p-1.5 hover:bg-white/5 rounded transition disabled:opacity-50 cursor-pointer"
              title="Edit Habit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="text-text-secondary hover:text-accent-break p-1.5 hover:bg-white/5 rounded transition disabled:opacity-50 cursor-pointer"
              title="Delete Habit"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Streak Counter */}
          <div className="flex items-center space-x-2 mt-2">
            {habit.type === 'build' ? (
              <>
                <div className="p-2 rounded-lg bg-accent-build/10 text-accent-build">
                  <Flame className="h-5 w-5 fill-accent-build" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-text-primary">{habit.streak} Days</div>
                  <div className="text-xs text-text-secondary">Current Streak</div>
                </div>
              </>
            ) : (
              <>
                <div className={`p-2 rounded-lg ${habit.streak === 0 ? 'bg-accent-break/10 text-accent-break' : 'bg-accent-build/10 text-accent-build'}`}>
                  <Shield className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-text-primary">{habit.streak} Days Clean</div>
                  <div className="text-xs text-text-secondary">Current Streak</div>
                </div>
              </>
            )}
          </div>

          {/* Weekly Completion Rate */}
          {habit.type === 'build' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary font-medium">Completion Rate</span>
                <span className="text-accent-build font-bold">{habit.weekly_rate}%</span>
              </div>
              <Progress value={habit.weekly_rate} />
            </div>
          )}

          {/* Weekly Dots Grid */}
          {renderWeeklyDots()}

          {/* Logging Interaction Buttons */}
          <div className="pt-2">
            {habit.type === 'build' ? (
              <div className="flex items-center space-x-3 bg-[#0F172A]/20 p-3 rounded-lg border border-border/40 hover:border-border/80 transition duration-300">
                <Checkbox checked={isCompletedToday} onCheckedChange={handleToggle} />
                <span className="text-sm font-semibold text-text-primary">
                  {isCompletedToday ? 'Completed Today!' : 'Mark Completed Today'}
                </span>
              </div>
            ) : (
              <div>
                {showRelapseConfirm ? (
                  <div className="flex flex-col space-y-2 p-3 bg-accent-break/10 border border-accent-break/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-accent-break text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Confirm you relapsed today?</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs cursor-pointer"
                        onClick={handleRelapse}
                      >
                        Yes, Log Relapse
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs cursor-pointer"
                        onClick={() => setShowRelapseConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant={isCompletedToday ? 'outline' : 'destructive'}
                    className="w-full font-semibold transition cursor-pointer"
                    disabled={isCompletedToday}
                    onClick={() => setShowRelapseConfirm(true)}
                  >
                    {isCompletedToday ? 'Relapsed Today' : 'Report Relapse'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={`Delete "${habit.name}"?`}
        description="This will permanently remove the habit and all its logs and streak history. This action cannot be undone."
        confirmLabel="Delete Habit"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
