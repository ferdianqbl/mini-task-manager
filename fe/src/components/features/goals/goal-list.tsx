'use client';

import React, { useState } from 'react';
import { useGoals } from '../../../services';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import GoalDialog from './goal-dialog';
import { Plus, Trash2, Award, Target, Trophy, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Goal } from '../../../services';

export default function GoalList() {
  const { goals, deleteGoal, isLoading } = useGoals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'build' | 'break'>('all');

  const handleOpenEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setGoalToEdit(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary border-r-2" />
        <span className="text-xs text-text-secondary">Loading goals...</span>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteGoal(deleteTarget.id);
      toast.success('Goal removed', {
        description: `"${deleteTarget.title}" has been deleted.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete goal.';
      toast.error('Failed to delete goal', { description: message });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredGoals = goals.filter((goal) => {
    if (activeFilter === 'all') return true;
    return goal.habit_type === activeFilter;
  });

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Active Challenges</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-1 cursor-pointer text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Goal</span>
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center p-6 bg-card border border-border rounded-xl">
            <p className="text-sm text-text-secondary">No active challenges set. Link a goal to your habits to stay motivated!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Filters */}
            <div className="flex items-center space-x-2 p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl w-fit">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white/10 text-text-primary shadow-sm border border-white/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span>All</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white/10 text-text-primary'
                    : 'bg-white/[0.04] text-text-secondary'
                }`}>
                  {goals.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('build')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeFilter === 'build'
                    ? 'bg-accent-build/15 text-accent-build border border-accent-build/30 shadow-sm shadow-accent-build/5'
                    : 'text-text-secondary hover:text-accent-build hover:bg-accent-build/5 border border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-build" />
                <span>Build</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  activeFilter === 'build'
                    ? 'bg-accent-build/20 text-accent-build'
                    : 'bg-white/[0.04] text-text-secondary'
                }`}>
                  {goals.filter(g => g.habit_type === 'build').length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilter('break')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeFilter === 'break'
                    ? 'bg-accent-break/15 text-accent-break border border-accent-break/30 shadow-sm shadow-accent-break/5'
                    : 'text-text-secondary hover:text-accent-break hover:bg-accent-break/5 border border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-break" />
                <span>Break</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  activeFilter === 'break'
                    ? 'bg-accent-break/20 text-accent-break'
                    : 'bg-white/[0.04] text-text-secondary'
                }`}>
                  {goals.filter(g => g.habit_type === 'break').length}
                </span>
              </button>
            </div>

            {filteredGoals.length === 0 ? (
              <div className="text-center p-6 bg-card border border-border rounded-xl">
                <p className="text-sm text-text-secondary">No active challenges in this category.</p>
              </div>
            ) : (
              filteredGoals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`relative overflow-hidden border transition duration-300 hover:border-white/10 ${
                    goal.status === 'achieved'
                      ? 'border-accent-build/20 bg-accent-build/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-text-primary text-sm tracking-tight flex items-center space-x-1.5">
                          <span>{goal.title}</span>
                          {goal.status === 'achieved' && (
                            <Award className="h-4 w-4 text-accent-build fill-accent-build/10" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-text-secondary">
                          <span>Linked to:</span>
                          <span className="text-text-primary font-medium">{goal.habit_name}</span>
                          <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            goal.habit_type === 'build'
                              ? 'bg-accent-build/10 text-accent-build'
                              : 'bg-accent-break/10 text-accent-break'
                          }`}>
                            {goal.habit_type === 'build' ? 'Build' : 'Break'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="text-text-secondary hover:text-primary p-1 hover:bg-white/5 rounded transition cursor-pointer"
                          title="Edit Goal"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: goal.id, title: goal.title })}
                          className="text-text-secondary hover:text-accent-break p-1 hover:bg-white/5 rounded transition cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-semibold text-text-secondary">
                        <span className="flex items-center space-x-1">
                          <Target className="h-3.5 w-3.5 text-text-secondary" />
                          <span>Streak: {goal.current_streak} / {goal.target_streak} days</span>
                        </span>
                        <span className={goal.status === 'achieved' ? 'text-accent-build font-bold' : 'text-text-primary'}>
                          {goal.progress_percentage}%
                        </span>
                      </div>
                      <Progress
                        value={goal.progress_percentage}
                        className={goal.status === 'achieved' ? '[&>div]:bg-accent-build' : '[&>div]:bg-primary'}
                      />
                    </div>

                    {goal.status === 'achieved' && (
                      <div className="text-[10px] text-accent-build font-bold uppercase tracking-widest bg-accent-build/10 px-2 py-0.5 rounded inline-block">
                        ✓ Goal Achieved!
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <GoalDialog open={dialogOpen} onOpenChange={handleDialogChange} goalToEdit={goalToEdit} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Remove "${deleteTarget?.title}"?`}
        description="This goal and its progress tracking will be permanently deleted. This action cannot be undone."
        confirmLabel="Remove Goal"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  );
}
