import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createGoal } from "./create.service";
import { deleteGoal } from "./delete.service";
import { getGoals } from "./get.service";
import { Goal } from "./types";
import { updateGoal } from "./update.service";

interface UseGoalsReturn {
  goals: Goal[];
  isLoading: boolean;
  error: Error | null;
  createGoal: UseMutateAsyncFunction<
    Goal,
    Error,
    { habit_id: number; title: string; target_streak: number },
    unknown
  >;
  isCreating: boolean;
  updateGoal: UseMutateAsyncFunction<
    Goal,
    Error,
    { id: number; title: string; target_streak: number },
    unknown
  >;
  isUpdating: boolean;
  deleteGoal: UseMutateAsyncFunction<
    {
      message: string;
    },
    Error,
    number,
    unknown
  >;
  isDeleting: boolean;
}

export function useGoals(): UseGoalsReturn {
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await getGoals();
      return res.data;
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (payload: {
      habit_id: number;
      title: string;
      target_streak: number;
    }) => {
      const res = await createGoal(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      title: string;
      target_streak: number;
    }) => {
      const res = await updateGoal(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deleteGoal(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isDeleting: deleteGoalMutation.isPending,
  };
}
