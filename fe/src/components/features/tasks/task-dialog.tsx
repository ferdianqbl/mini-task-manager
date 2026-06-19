"use client";

import { useCreateTask } from "@/services/task/use-tasks";
import { X } from "lucide-react";
import React, { useState } from "react";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDialog({ isOpen, onClose }: TaskDialogProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      onClose();
    } catch {
      // Errors are handled in mutation via toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-popover border border-border rounded-xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition p-1 hover:bg-white/5 rounded-md cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement cookie parser"
              maxLength={255}
              className="w-full px-4 py-3 bg-[#090D16]/80 border border-border rounded-md text-foreground placeholder:text-gray-600 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or details about this task..."
              rows={4}
              className="w-full px-4 py-3 bg-[#090D16]/80 border border-border rounded-md text-foreground placeholder:text-gray-600 focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border hover:bg-white/5 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-md shadow-md shadow-primary/10 hover:bg-primary/95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
