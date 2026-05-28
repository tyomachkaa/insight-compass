// Handwritten narrow subset of the Supabase schema for the tables/columns
// the frontend touches. Extend as more pages/actions come online.
//
// The auto-generated types from `supabase gen types typescript` currently
// only emit the `public` schema, which is empty in this project. All real
// tables live in `app`, `analysis`, `core`, etc. Until non-public schema
// generation is set up, this file is the source of truth for typed queries.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DataStatus = "ready" | "processing" | "partial" | "empty" | "error";
export type RoleKey = "owner" | "marketer" | "smm";
export type RoleView = "owner_view" | "marketer_view" | "smm_view";

export type PageKey =
  | "dashboard"
  | "competitor_radar"
  | "best_competitor_outcomes"
  | "trend_tracker"
  | "insights_feed"
  | "idea_suggestions"
  | "competitor_moves"
  | "my_performance"
  | "dynamics"
  | "todos"
  | "settings";

export type Database = {
  app: {
    Tables: {
      page_objects: {
        Row: {
          page_object_id: string;
          workspace_id: string;
          page_key: PageKey;
          section_key: string;
          role_key: RoleKey;
          role_view: RoleView;
          platform: string;
          language: string;
          page_title: string | null;
          page_version: string;
          object_version: string;
          data_status: DataStatus;
          payload: Json;
          object_json: Json;
          metadata: Json;
          period_start: string | null;
          period_end: string | null;
          generated_at: string;
          updated_at: string;
          expires_at: string | null;
          analysis_job_id: string | null;
          run_label: string | null;
          priority: number;
        };
        Insert: never;
        Update: never;
      };
      insights_feed: {
        Row: {
          insight_id: string;
          workspace_id: string;
          insight_type: string | null;
          priority: string | null;
          title: string;
          short_summary: string | null;
          detailed_explanation: string | null;
          evidence_json: Json;
          source_type: string | null;
          source_entity_id: string | null;
          affected_area: string | null;
          recommended_action: string | null;
          expected_effect: string | null;
          confidence_score: number | null;
          impact_score: number | null;
          effort_score: number | null;
          apply_status: "not_applied" | "applied" | "dismissed";
          platform: string | null;
          semantic_key: string | null;
          recommended_tracking_metric: string | null;
          recommended_tracking_period_days: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: { apply_status?: "not_applied" | "applied" | "dismissed" };
      };
      todos: {
        Row: {
          todo_id: string;
          workspace_id: string;
          app_user_id: string | null;
          title: string;
          description: string | null;
          status: string;
          tracking_status: string | null;
          priority: string | null;
          platform: string | null;
          affected_area: string | null;
          recommended_action: string | null;
          target_metric: string | null;
          tracking_metric: string | null;
          baseline_value: number | null;
          target_value: number | null;
          tracking_period_days: number | null;
          due_at: string | null;
          start_tracking_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      onboarding_submissions: {
        Row: {
          onboarding_submission_id: string;
          contract_version: string;
          app_user_id: string | null;
          workspace_id: string | null;
          email: string;
          display_name: string | null;
          project_name: string;
          payload: Json;
          status: string;
          error_message: string | null;
          run_label: string | null;
          wf01_execution_id: string | null;
          wf08_execution_id: string | null;
          created_at: string;
          updated_at: string;
          processed_at: string | null;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  core: {
    Tables: {
      app_users: {
        Row: {
          app_user_id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
      };
      workspaces: {
        Row: {
          workspace_id: string;
          app_user_id: string;
          project_name: string;
          niche: string | null;
          country: string | null;
          timezone: string | null;
          interface_language: string | null;
          report_language: string | null;
          content_language: string | null;
          target_audience: string | null;
          product_description: string | null;
          main_goal: string | null;
          plan_id: string | null;
          subscription_status: string | null;
          onboarding_status: string | null;
        };
        Insert: never;
        Update: never;
      };
      workspace_members: {
        Row: {
          workspace_member_id: string;
          workspace_id: string;
          app_user_id: string;
          role: string;
        };
        Insert: never;
        Update: never;
      };
      social_accounts: {
        Row: {
          account_id: string;
          workspace_id: string;
          account_type: "own" | "competitor";
          platform: string;
          username: string | null;
          display_name: string | null;
          profile_url: string;
          status: string;
          scrape_enabled: boolean;
        };
        Insert: never;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
