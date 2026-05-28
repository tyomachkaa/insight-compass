// Insights feed reads + the "Apply insight → todo" action (WF_06).
//
// app.insights_feed is an app-schema table the frontend MAY read directly
// (it is not in the §4.20 forbidden list). The Apply action, however, must
// go through n8n — WF_06 creates the app.todos row and flips apply_status.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { N8N_PATHS, triggerWebhook } from "../n8n";
import { useCurrentWorkspace } from "./workspace";
import type { Database } from "../database.types";

type InsightRow = Database["app"]["Tables"]["insights_feed"]["Row"];

const INSIGHTS_KEY = "app.insights_feed";

export function useInsightsFeed() {
  const { workspaceId } = useCurrentWorkspace();

  const query = useQuery({
    queryKey: [INSIGHTS_KEY, workspaceId],
    queryFn: async (): Promise<InsightRow[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .schema("app")
        .from("insights_feed")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("impact_score", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!workspaceId,
  });

  return {
    insights: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasWorkspace: !!workspaceId,
  };
}

export interface ApplyInsightVars {
  insight_id: string;
}

export function useApplyInsight() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ insight_id }: ApplyInsightVars) => {
      return triggerWebhook(N8N_PATHS.insightApply, { insight_id, workspace_id: workspaceId });
    },
    onMutate: async ({ insight_id }) => {
      await qc.cancelQueries({ queryKey: [INSIGHTS_KEY, workspaceId] });
      const prev = qc.getQueryData<InsightRow[]>([INSIGHTS_KEY, workspaceId]);
      qc.setQueryData<InsightRow[]>([INSIGHTS_KEY, workspaceId], (rows) =>
        (rows ?? []).map((r) =>
          r.insight_id === insight_id ? { ...r, apply_status: "applied" } : r,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData([INSIGHTS_KEY, workspaceId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [INSIGHTS_KEY, workspaceId] });
      qc.invalidateQueries({ queryKey: ["app.todos", workspaceId] });
    },
  });
}

export function useDismissInsight() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ insight_id }: ApplyInsightVars) => {
      // No dedicated webhook in the doc — write apply_status directly.
      // (Allowed: app.insights_feed is frontend-readable/writable per RLS.)
      const { error } = await supabase
        .schema("app")
        .from("insights_feed")
        .update({ apply_status: "dismissed" })
        .eq("insight_id", insight_id);
      if (error) throw error;
    },
    onMutate: async ({ insight_id }) => {
      await qc.cancelQueries({ queryKey: [INSIGHTS_KEY, workspaceId] });
      const prev = qc.getQueryData<InsightRow[]>([INSIGHTS_KEY, workspaceId]);
      qc.setQueryData<InsightRow[]>([INSIGHTS_KEY, workspaceId], (rows) =>
        (rows ?? []).map((r) =>
          r.insight_id === insight_id ? { ...r, apply_status: "dismissed" } : r,
        ),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData([INSIGHTS_KEY, workspaceId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: [INSIGHTS_KEY, workspaceId] });
    },
  });
}
