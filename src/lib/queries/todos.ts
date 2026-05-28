// Todos reads + tracking actions (WF_07 start tracking, WF_06B manual todo).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { N8N_PATHS, triggerWebhook } from "../n8n";
import { useCurrentWorkspace } from "./workspace";
import type { Database } from "../database.types";

type TodoRow = Database["app"]["Tables"]["todos"]["Row"];

const TODOS_KEY = "app.todos";

export function useTodos() {
  const { workspaceId } = useCurrentWorkspace();

  const query = useQuery({
    queryKey: [TODOS_KEY, workspaceId],
    queryFn: async (): Promise<TodoRow[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .schema("app")
        .from("todos")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!workspaceId,
  });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasWorkspace: !!workspaceId,
  };
}

export interface StartTrackingVars {
  todo_id: string;
  metric_key?: string;
  tracking_period_days?: number;
  baseline_value?: number | null;
  target_direction?: "increase" | "decrease";
}

export function useStartTracking() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: StartTrackingVars) => {
      return triggerWebhook(N8N_PATHS.todoStartTracking, {
        workspace_id: workspaceId,
        todo_id: vars.todo_id,
        metric_key: vars.metric_key,
        tracking_period_days: vars.tracking_period_days ?? 14,
        baseline_value: vars.baseline_value ?? null,
        target_direction: vars.target_direction ?? "increase",
      });
    },
    onMutate: async ({ todo_id }) => {
      await qc.cancelQueries({ queryKey: [TODOS_KEY, workspaceId] });
      const prev = qc.getQueryData<TodoRow[]>([TODOS_KEY, workspaceId]);
      qc.setQueryData<TodoRow[]>([TODOS_KEY, workspaceId], (rows) =>
        (rows ?? []).map((r) =>
          r.todo_id === todo_id ? { ...r, tracking_status: "tracking" } : r,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData([TODOS_KEY, workspaceId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [TODOS_KEY, workspaceId] });
    },
  });
}

export interface ManualTodoVars {
  title: string;
  recommended_action?: string;
  description?: string;
  platform?: string;
  affected_area?: string;
  tracking_metric?: string;
  baseline_value?: number | null;
  target_value?: number | null;
  tracking_period_days?: number;
}

export function useCreateManualTodo() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: ManualTodoVars) => {
      return triggerWebhook(N8N_PATHS.todoManualCreate, {
        workspace_id: workspaceId,
        source_type: "manual",
        ...vars,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [TODOS_KEY, workspaceId] });
    },
  });
}
