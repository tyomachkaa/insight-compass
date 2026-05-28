// Workspace resolution + role state — auth-driven.
//
// RLS keys everything to auth.uid(): core.workspace_members has a row per
// (auth_user_id, workspace_id), and core.is_workspace_member() gates reads
// on app.page_objects / insights_feed / todos / social_accounts. So we
// resolve the active workspace from the user's membership rows.
//
// Role: each membership carries default_view_mode + allowed_view_modes. The
// user can switch among allowed roles; the choice is persisted locally and
// validated against what the membership allows.

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { RoleKey } from "../database.types";
import { useAuth } from "../auth";

const WORKSPACE_KEY = "flyhigh.workspace_id";
const ROLE_KEY_STORAGE = "flyhigh.role_key";
const DEFAULT_ROLE: RoleKey = "owner";
const ALL_ROLES: RoleKey[] = ["owner", "marketer", "smm"];

export function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(WORKSPACE_KEY);
}

export function setStoredWorkspaceId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(WORKSPACE_KEY, id);
  else window.localStorage.removeItem(WORKSPACE_KEY);
}

function getStoredRoleKey(): RoleKey | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(ROLE_KEY_STORAGE);
  return v === "owner" || v === "marketer" || v === "smm" ? v : null;
}

/** Normalize a stored view mode (e.g. "owner_view" or "owner") to a RoleKey. */
function normalizeRole(v: string | null | undefined): RoleKey | null {
  if (!v) return null;
  const base = v.replace(/_view$/, "");
  return base === "owner" || base === "marketer" || base === "smm" ? base : null;
}

export function useCurrentWorkspace() {
  const { user } = useAuth();
  const [overrideWorkspaceId, setOverrideWorkspaceIdState] = useState<string | null>(() =>
    getStoredWorkspaceId(),
  );
  const [roleOverride, setRoleOverrideState] = useState<RoleKey | null>(() => getStoredRoleKey());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === WORKSPACE_KEY) setOverrideWorkspaceIdState(e.newValue);
      if (e.key === ROLE_KEY_STORAGE) setRoleOverrideState(normalizeRole(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Membership rows for the signed-in user (RLS: auth_user_id = auth.uid()).
  const membershipsQuery = useQuery({
    queryKey: ["core.workspace_members", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .schema("core")
        .from("workspace_members")
        .select("workspace_id, role, workspace_role, default_view_mode, allowed_view_modes, status")
        .eq("auth_user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const memberships = membershipsQuery.data ?? [];

  const workspaceId =
    overrideWorkspaceId && memberships.some((m) => m.workspace_id === overrideWorkspaceId)
      ? overrideWorkspaceId
      : memberships[0]?.workspace_id ?? null;

  const activeMembership = memberships.find((m) => m.workspace_id === workspaceId);

  const allowedRoles: RoleKey[] = (() => {
    const modes: string[] = activeMembership?.allowed_view_modes ?? [];
    const fromMembership = modes
      .map((v) => normalizeRole(v))
      .filter((r): r is RoleKey => r !== null);
    return fromMembership.length > 0 ? fromMembership : ALL_ROLES;
  })();

  const roleKey: RoleKey = (() => {
    if (roleOverride && allowedRoles.includes(roleOverride)) return roleOverride;
    const def = normalizeRole(activeMembership?.default_view_mode);
    if (def && allowedRoles.includes(def)) return def;
    return allowedRoles[0] ?? DEFAULT_ROLE;
  })();

  const setWorkspaceId = useCallback((id: string | null) => {
    setStoredWorkspaceId(id);
    setOverrideWorkspaceIdState(id);
  }, []);

  const setRoleKey = useCallback((role: RoleKey) => {
    if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY_STORAGE, role);
    setRoleOverrideState(role);
  }, []);

  // Workspace details for display.
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
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
    memberships,
    roleKey,
    setRoleKey,
    allowedRoles,
    workspace,
    isLoading: membershipsQuery.isLoading || workspaceLoading,
    membershipsError: membershipsQuery.error,
  };
}
