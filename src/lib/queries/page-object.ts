// Read app.page_objects for the current workspace + role.
//
// The V2 unique key on app.page_objects is:
//   (workspace_id, page_key, section_key, role_view, platform, language)
// So we filter by all of those — defaults match WF_05's emit conventions
// (section_key=main, platform=all). Language falls back to the workspace's
// report_language, or 'uk' if unknown.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import type { DataStatus, PageKey, RoleKey, RoleView } from "../database.types";
import type { PageObjectPayload } from "../page-object-types";
import { useCurrentWorkspace } from "./workspace";

const ROLE_TO_VIEW: Record<RoleKey, RoleView> = {
  owner: "owner_view",
  marketer: "marketer_view",
  smm: "smm_view",
};

interface UsePageObjectOptions {
  pageKey: PageKey;
  sectionKey?: string;
  platform?: string;
  language?: string;
  /** Override the current workspace's role. */
  roleKey?: RoleKey;
  /** Polling interval (ms) when data_status === 'processing'. Default 8s. */
  pollIntervalMs?: number;
}

export interface UsePageObjectResult<T = unknown> {
  payload: PageObjectPayload<T> | null;
  status: DataStatus | "no_workspace" | "missing";
  generatedAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

export function usePageObject<T = unknown>(
  opts: UsePageObjectOptions,
): UsePageObjectResult<T> {
  const { workspaceId, roleKey: ctxRole, workspace } = useCurrentWorkspace();
  const role = opts.roleKey ?? ctxRole;
  const sectionKey = opts.sectionKey ?? "main";
  const platform = opts.platform ?? "all";
  const language =
    opts.language ?? workspace?.report_language ?? "uk";

  const query = useQuery({
    queryKey: [
      "app.page_objects",
      workspaceId,
      opts.pageKey,
      sectionKey,
      ROLE_TO_VIEW[role],
      platform,
      language,
    ],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data, error } = await supabase
        .schema("app")
        .from("page_objects")
        .select(
          "page_object_id, workspace_id, page_key, section_key, role_key, role_view, platform, language, page_title, data_status, payload, generated_at, period_start, period_end, run_label, analysis_job_id",
        )
        .eq("workspace_id", workspaceId)
        .eq("page_key", opts.pageKey)
        .eq("section_key", sectionKey)
        .eq("role_view", ROLE_TO_VIEW[role])
        .eq("platform", platform)
        .eq("language", language)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: (q) => {
      const status = q.state.data?.data_status as DataStatus | undefined;
      if (status === "processing") return opts.pollIntervalMs ?? 8000;
      return false;
    },
  });

  const row = query.data;

  let status: UsePageObjectResult["status"];
  if (!workspaceId) status = "no_workspace";
  else if (!row) status = "missing";
  else status = row.data_status;

  return {
    payload: (row?.payload ?? null) as PageObjectPayload<T> | null,
    status,
    generatedAt: row?.generated_at ?? null,
    periodStart: row?.period_start ?? null,
    periodEnd: row?.period_end ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
