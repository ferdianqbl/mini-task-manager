import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createHabit } from "./create.service";
import { updateHabit } from "./update.service";
import { deleteHabit } from "./delete.service";
import { getHabits } from "./get.service";
import { toggleLog } from "./toggle.service";
import { Habit } from "./types";

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  createHabit: UseMutateAsyncFunction<
    Habit,
    Error,
    {
      name: string;
      type: "build" | "break";
    },
    unknown
  >;
  isCreating: boolean;
  updateHabit: UseMutateAsyncFunction<
    Habit,
    Error,
    {
      id: number;
      name: string;
    },
    unknown
  >;
  isUpdating: boolean;
  deleteHabit: UseMutateAsyncFunction<
    {
      message: string;
    },
    Error,
    number,
    unknown
  >;
  isDeleting: boolean;
  toggleLog: UseMutateAsyncFunction<
    {
      message: string;
      logged: boolean;
    },
    Error,
    {
      id: number;
      date: string;
    },
    unknown
  >;
}

export function useHabits(): UseHabitsReturn {
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await getHabits();
      return res.data;
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (payload: { name: string; type: "build" | "break" }) => {
      const res = await createHabit(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] }); // Goals depend on habit streaks
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteHabit(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async (payload: { id: number; name: string }) => {
      const res = await updateHabit(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const toggleLogMutation = useMutation({
    mutationFn: async (payload: { id: number; date: string }) => {
      const res = await toggleLog(payload.id, payload.date);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  return {
    habits: habitsQuery.data || [],
    isLoading: habitsQuery.isLoading,
    error: habitsQuery.error,
    createHabit: createHabitMutation.mutateAsync,
    isCreating: createHabitMutation.isPending,
    updateHabit: updateHabitMutation.mutateAsync,
    isUpdating: updateHabitMutation.isPending,
    deleteHabit: deleteHabitMutation.mutateAsync,
    isDeleting: deleteHabitMutation.isPending,
    toggleLog: toggleLogMutation.mutateAsync,
  };
}
