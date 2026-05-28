// Payload shapes for app.page_objects.
//
// Every page_object row has `payload: jsonb` written by WF_05. The doc
// specifies a standard envelope (meta / summary / sections / filters /
// actions / evidence / empty_state / error_state) plus page-specific
// sections. These types document that contract on the client side.
//
// They are intentionally permissive (most fields are optional) because
// payload shape can drift as backend evolves. Treat any read as a
// best-effort parse and always render an `empty_state` fallback.

import type { DataStatus, PageKey, RoleKey } from "./database.types";

export interface PageObjectMeta {
  workspace_id: string;
  analysis_job_id?: string | null;
  run_label?: string | null;
  page_key: PageKey;
  role_key: RoleKey;
  language: string;
  period_start?: string | null;
  period_end?: string | null;
  generated_at: string;
  data_status: DataStatus;
}

export interface EmptyState {
  title?: string;
  body?: string;
  cta_label?: string;
  cta_action?: string;
}

export interface ErrorState {
  code?: string;
  message?: string;
  retryable?: boolean;
}

export interface PageObjectPayload<TSections = unknown> {
  meta?: Partial<PageObjectMeta>;
  summary?: Record<string, unknown>;
  sections?: TSections;
  filters?: Record<string, unknown>;
  actions?: unknown[];
  evidence?: unknown[];
  empty_state?: EmptyState | null;
  error_state?: ErrorState | null;
  // status echoed by WF_05 — sometimes lives at top level instead of meta
  analysis_status?: { status: DataStatus; [k: string]: unknown };
}

// --- Per-page section shapes (loose — extend as the UI matures) ---

export interface DashboardSummaryCard {
  label: string;
  value: string | number;
  delta?: string;
  delta_direction?: "up" | "down" | "flat";
  trend?: Array<{ d: number; value: number }>;
}

export interface DashboardOpportunity {
  title: string;
  body?: string;
  evidence?: string;
  source_insight_id?: string;
  priority?: "high" | "medium" | "low";
}

export interface DashboardCompetitorMove {
  account_handle: string;
  account_emoji?: string;
  title?: string;
  body?: string;
  reach?: number | string;
  metric_label?: string;
}

export interface DashboardSections {
  summary_cards?: DashboardSummaryCard[];
  competitive_position?: Record<string, unknown>;
  top_opportunities?: DashboardOpportunity[];
  high_priority_insights?: DashboardOpportunity[];
  recent_dynamics?: Record<string, unknown>;
  actions_status?: Array<{ todo_id: string; title: string; status: string }>;
  recommended_next_steps?: DashboardOpportunity[];
  competitor_spotlight?: DashboardCompetitorMove[];
  recent_wins?: Array<{
    kind: string;
    caption: string;
    reach?: string;
    likes?: string;
    comments?: string;
    lift?: string;
  }>;
}

export type DashboardPayload = PageObjectPayload<DashboardSections>;

export interface InsightCard {
  insight_id: string;
  title: string;
  short_summary?: string;
  recommended_action?: string;
  evidence?: string;
  apply_status?: "not_applied" | "applied" | "dismissed";
  tone?: "works" | "fails";
}

export interface InsightsFeedSections {
  works?: InsightCard[];
  fails?: InsightCard[];
}

export type InsightsFeedPayload = PageObjectPayload<InsightsFeedSections>;
