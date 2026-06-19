'use client';

import React, { useState, useEffect } from 'react';
import { useHabits, Habit } from '../../../services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitToEdit?: Habit | null;
}

export default function HabitDialog({ open, onOpenChange, habitToEdit }: HabitDialogProps) {
  const { createHabit, isCreating, updateHabit, isUpdating } = useHabits();
  const [name, setName] = useState('');
  const [type, setType] = useState<'build' | 'break'>('build');

  const isEdit = !!habitToEdit;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open && habitToEdit) {
      setName(habitToEdit.name);
      setType(habitToEdit.type);
    } else if (open) {
      setName('');
      setType('build');
    }
  }, [open, habitToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length === 0) {
      toast.error('Habit name is required.');
      return;
    }

    try {
      if (isEdit) {
        await updateHabit({ id: habitToEdit.id, name });
        toast.success('Habit updated!', {
          description: `"${name}" has been updated.`,
        });
      } else {
        await createHabit({ name, type });
        toast.success('Habit created!', {
          description: `"${name}" has been added to your ${type === 'build' ? 'build' : 'break'} list.`,
        });
      }
      onOpenChange(false);
    } catch (err) {
      const action = isEdit ? 'update' : 'create';
      const message = err instanceof Error ? err.message : `Failed to ${action} habit.`;
      toast.error(`Failed to ${action} habit`, { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Habit Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Run 5km, Read 10 pages, No sugary drinks"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Type of Habit
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isEdit}
                onClick={() => setType('build')}
                className={`py-3 px-4 border rounded-lg text-sm font-semibold transition ${
                  isEdit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  type === 'build'
                    ? 'bg-accent-build/15 border-accent-build text-accent-build shadow-sm shadow-accent-build/5'
                    : 'border-border text-text-secondary hover:border-gray-600'
                }`}
              >
                Habit to Build
              </button>
              <button
                type="button"
                disabled={isEdit}
                onClick={() => setType('break')}
                className={`py-3 px-4 border rounded-lg text-sm font-semibold transition ${
                  isEdit ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                } ${
                  type === 'break'
                    ? 'bg-accent-break/15 border-accent-break text-accent-break shadow-sm shadow-accent-break/5'
                    : 'border-border text-text-secondary hover:border-gray-600'
                }`}
              >
                Habit to Break
              </button>
            </div>
            <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed">
              {type === 'build'
                ? 'Select this if you want to perform a positive behavior daily and track your consistency streak.'
                : 'Select this if you want to avoid a negative behavior daily and track how many days you stay clean.'}
            </p>
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
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
