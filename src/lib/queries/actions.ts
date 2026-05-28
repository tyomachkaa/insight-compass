// Workspace-level actions: manual refresh (WF_08), social accounts CRUD,
// notification preferences. Reads go to core.social_accounts; mutations go
// through n8n webhooks (§4.19 frontend action endpoints).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { N8N_PATHS, triggerWebhook } from "../n8n";
import { useCurrentWorkspace } from "./workspace";
import type { Database } from "../database.types";
import type { Platform } from "./onboarding";

type SocialAccountRow = Database["core"]["Tables"]["social_accounts"]["Row"];

const ACCOUNTS_KEY = "core.social_accounts";

export function useSocialAccounts() {
  const { workspaceId } = useCurrentWorkspace();

  const query = useQuery({
    queryKey: [ACCOUNTS_KEY, workspaceId],
    queryFn: async (): Promise<SocialAccountRow[]> => {
      if (!workspaceId) return [];
      const { data, error } = await supabase
        .schema("core")
        .from("social_accounts")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("account_type", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!workspaceId,
  });

  return {
    accounts: query.data ?? [],
    own: (query.data ?? []).filter((a) => a.account_type === "own"),
    competitors: (query.data ?? []).filter((a) => a.account_type === "competitor"),
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasWorkspace: !!workspaceId,
  };
}

export function useManualRefresh() {
  const { workspaceId } = useCurrentWorkspace();
  return useMutation({
    mutationFn: async () => {
      return triggerWebhook(N8N_PATHS.refreshStart, {
        workspace_id: workspaceId,
        trigger_type: "manual_refresh",
      });
    },
  });
}

export interface AddAccountVars {
  platform: Platform;
  profile_url: string;
  account_type: "own" | "competitor";
  username?: string;
  display_name?: string;
}

export function useAddAccount() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: AddAccountVars) => {
      return triggerWebhook(N8N_PATHS.accountAdd, { workspace_id: workspaceId, ...vars });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY, workspaceId] }),
  });
}

export function useRemoveAccount() {
  const { workspaceId } = useCurrentWorkspace();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ account_id }: { account_id: string }) => {
      return triggerWebhook(N8N_PATHS.accountRemove, { workspace_id: workspaceId, account_id });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [ACCOUNTS_KEY, workspaceId] }),
  });
}

export interface NotificationPrefsVars {
  email_enabled?: boolean;
  telegram_enabled?: boolean;
  telegram_chat_id?: string | null;
  notify_when_analysis_ready?: boolean;
  notify_about_high_priority_insights?: boolean;
  notify_about_competitor_moves?: boolean;
}

export function useUpdateNotifications() {
  const { workspaceId } = useCurrentWorkspace();
  return useMutation({
    mutationFn: async (vars: NotificationPrefsVars) => {
      return triggerWebhook(N8N_PATHS.notificationsUpdate, { workspace_id: workspaceId, ...vars });
    },
  });
}
