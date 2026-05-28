// Workspace resolution + role state.
//
// For now we don't gate on Supabase Auth (that's a separate slice). After
// onboarding, WF_01 returns the new `workspace_id`; we stash it in
// localStorage and every `usePageObject` call reads from it.
//
// When auth lands: replace `getStoredWorkspaceId` with a query against
// core.workspace_members filtered by auth.uid().

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { RoleKey } from "../database.types";

const WORKSPACE_KEY = "flyhigh.workspace_id";
const ROLE_KEY_STORAGE = "flyhigh.role_key";
const DEFAULT_ROLE: RoleKey = "owner";

export function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WORKSPACE_KEY);
}

export function setStoredWorkspaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(WORKSPACE_KEY, id);
  else window.localStorage.removeItem(WORKSPACE_KEY);
}

function getStoredRoleKey(): RoleKey {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const v = window.localStorage.getItem(ROLE_KEY_STORAGE);
  return v === "owner" || v === "marketer" || v === "smm" ? v : DEFAULT_ROLE;
}

export function useCurrentWorkspace() {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(() =>
    getStoredWorkspaceId(),
  );
  const [roleKey, setRoleKeyState] = useState<RoleKey>(() => getStoredRoleKey());

  // Keep state in sync with localStorage changes from other tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === WORKSPACE_KEY) setWorkspaceIdState(e.newValue);
      if (e.key === ROLE_KEY_STORAGE && (e.newValue === "owner" || e.newValue === "marketer" || e.newValue === "smm")) {
        setRoleKeyState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setWorkspaceId = useCallback((id: string | null) => {
    setStoredWorkspaceId(id);
    setWorkspaceIdState(id);
  }, []);

  const setRoleKey = useCallback((role: RoleKey) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_KEY_STORAGE, role);
    }
    setRoleKeyState(role);
  }, []);

  // Fetch workspace row for display (project_name, niche, languages).
  const { data: workspace, isLoading } = useQuery({
    queryKey: ["core.workspaces", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data, error } = await supabase
        .schema("core")
        .from("workspaces")
        .select(
          "workspace_id, project_name, niche, country, timezone, interface_language, report_language, content_language, target_audience, product_description, main_goal, plan_id, subscription_status, onboarding_status",
        )
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
  });

  return {
    workspaceId,
    setWorkspaceId,
    roleKey,
    setRoleKey,
    workspace,
    isLoading,
  };
}
