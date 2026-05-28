// Onboarding submission → WF_01_Onboarding_Setup webhook.
//
// Contract: see "On-boarding JSON contract v1" in the Notion Knowledge DB
// and §3.3 of the FlyHigh technical doc.
//
// WF_01 expects all 9 blocks. Frontend collects what it can; missing
// optional fields are filled with sensible defaults. Required minimum:
//   - auth.email
//   - user.display_name
//   - workspace.project_name + niche
//   - at least one account in accounts.own_accounts
//
// On success WF_01 returns { ok, status, workspace_id, app_user_id,
// analysis_job_id, run_label, onboarding_submission_id, … }.

import { useMutation } from "@tanstack/react-query";
import { N8N_PATHS, triggerWebhook } from "../n8n";
import { setStoredWorkspaceId } from "./workspace";

export type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "threads"
  | "twitter"
  | "facebook";

export interface OwnAccountInput {
  platform: Platform;
  profile_url: string;
  username?: string;
  display_name?: string;
  account_label?: string;
  scrape_enabled?: boolean;
  notes?: string;
}

export interface CompetitorAccountInput extends OwnAccountInput {
  competitor_type?: "direct" | "adjacent" | "aspirational";
}

export interface OnboardingFormInput {
  // auth
  email: string;
  authUserId?: string | null;

  // user
  displayName: string;
  companyName?: string;
  roleInCompany?: string;

  // workspace
  projectName: string;
  niche: string;
  country?: string;
  marketRegion?: string;
  timezone?: string;
  targetAudience?: string;
  productDescription?: string;
  mainGoal?: string;
  businessStage?: "idea" | "launch" | "growth" | "scale";
  websiteUrl?: string;
  additionalContext?: string;

  // languages
  interfaceLanguage?: string;
  reportLanguage?: string;
  contentLanguage?: string;

  // accounts
  ownAccounts: OwnAccountInput[];
  competitorAccounts: CompetitorAccountInput[];

  // analysis_request
  requestedPlatforms?: Platform[];
  analysisDepth?: "lite" | "standard" | "deep";
  primaryRoleView?: "owner" | "marketer" | "smm";

  // plan
  planId?: string;
  billingProvider?: string;
  checkoutSessionId?: string;
  subscriptionId?: string | null;
  paymentStatus?: "paid" | "active" | "succeeded" | "trialing" | "free";
  subscriptionStatus?: "active" | "trialing" | "past_due" | "canceled";

  // acquisition
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;

  // notification_preferences
  emailEnabled?: boolean;
  telegramEnabled?: boolean;
  telegramChatId?: string | null;
  notifyWhenAnalysisReady?: boolean;
  notifyAboutHighPriorityInsights?: boolean;
  notifyAboutCompetitorMoves?: boolean;

  // legal
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
  marketingConsent?: boolean;
}

export interface OnboardingContractV1 {
  contract_version: "onboarding_v1";
  submission_id?: string;
  source: {
    client: "web_app";
    environment: string;
    submitted_at: string;
    locale: string;
    timezone: string;
  };
  auth: { auth_user_id: string | null; email: string };
  user: {
    display_name: string;
    company_name: string;
    role_in_company: string;
  };
  workspace: {
    project_name: string;
    niche: string;
    country: string;
    market_region: string;
    timezone: string;
    target_audience: string;
    product_description: string;
    main_goal: string;
    business_stage: string;
    website_url: string;
    additional_context: string;
  };
  languages: {
    interface_language: string;
    report_language: string;
    content_language: string;
  };
  accounts: {
    own_accounts: Array<Required<Pick<OwnAccountInput, "platform" | "profile_url" | "scrape_enabled">> & OwnAccountInput>;
    competitor_accounts: Array<Required<Pick<CompetitorAccountInput, "platform" | "profile_url" | "scrape_enabled">> & CompetitorAccountInput>;
  };
  analysis_request: {
    trigger_initial_analysis: boolean;
    requested_platforms: Platform[];
    analysis_depth: string;
    primary_role_view: string;
    enabled_role_views: string[];
    requested_scope: {
      posts_per_account: number;
      include_comments: boolean;
      include_media_description: boolean;
      include_video_transcription: boolean;
      include_profile_stats: boolean;
    };
  };
  plan: {
    plan_id: string;
    billing_provider: string;
    checkout_session_id: string;
    subscription_id: string | null;
    payment_status: string;
    subscription_status: string;
  };
  acquisition: {
    referral_code: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    landing_page: string;
  };
  notification_preferences: {
    email_enabled: boolean;
    telegram_enabled: boolean;
    telegram_chat_id: string | null;
    notify_when_analysis_ready: boolean;
    notify_about_high_priority_insights: boolean;
    notify_about_competitor_moves: boolean;
  };
  legal: {
    accepted_terms: boolean;
    accepted_privacy_policy: boolean;
    marketing_consent: boolean;
  };
}

export interface OnboardingResponse {
  ok: boolean;
  status?: string;
  workspace_id?: string;
  app_user_id?: string;
  analysis_job_id?: string;
  run_label?: string;
  onboarding_submission_id?: string;
  wf08_execution_id?: string;
  error_message?: string;
  [k: string]: unknown;
}

export function buildOnboardingContract(
  input: OnboardingFormInput,
): OnboardingContractV1 {
  const tz =
    input.timezone ??
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Europe/Kyiv");
  const lang = input.reportLanguage ?? "uk";

  return {
    contract_version: "onboarding_v1",
    source: {
      client: "web_app",
      environment: import.meta.env.MODE === "production" ? "production" : "development",
      submitted_at: new Date().toISOString(),
      locale: input.interfaceLanguage ?? lang,
      timezone: tz,
    },
    auth: {
      auth_user_id: input.authUserId ?? null,
      email: input.email,
    },
    user: {
      display_name: input.displayName,
      company_name: input.companyName ?? input.projectName,
      role_in_company: input.roleInCompany ?? "owner",
    },
    workspace: {
      project_name: input.projectName,
      niche: input.niche,
      country: input.country ?? "",
      market_region: input.marketRegion ?? input.country ?? "",
      timezone: tz,
      target_audience: input.targetAudience ?? "",
      product_description: input.productDescription ?? "",
      main_goal: input.mainGoal ?? "",
      business_stage: input.businessStage ?? "growth",
      website_url: input.websiteUrl ?? "",
      additional_context: input.additionalContext ?? "",
    },
    languages: {
      interface_language: input.interfaceLanguage ?? lang,
      report_language: lang,
      content_language: input.contentLanguage ?? lang,
    },
    accounts: {
      own_accounts: input.ownAccounts.map((a) => ({
        ...a,
        scrape_enabled: a.scrape_enabled ?? true,
      })),
      competitor_accounts: input.competitorAccounts.map((a) => ({
        ...a,
        scrape_enabled: a.scrape_enabled ?? true,
        competitor_type: a.competitor_type ?? "direct",
      })),
    },
    analysis_request: {
      trigger_initial_analysis: true,
      requested_platforms:
        input.requestedPlatforms ??
        (Array.from(
          new Set([
            ...input.ownAccounts.map((a) => a.platform),
            ...input.competitorAccounts.map((a) => a.platform),
          ]),
        ) as Platform[]),
      analysis_depth: input.analysisDepth ?? "standard",
      primary_role_view: input.primaryRoleView ?? "owner",
      enabled_role_views: ["owner", "marketer", "smm"],
      requested_scope: {
        posts_per_account: 30,
        include_comments: true,
        include_media_description: true,
        include_video_transcription: true,
        include_profile_stats: true,
      },
    },
    plan: {
      plan_id: input.planId ?? "starter",
      billing_provider: input.billingProvider ?? "stripe",
      checkout_session_id: input.checkoutSessionId ?? "",
      subscription_id: input.subscriptionId ?? null,
      payment_status: input.paymentStatus ?? "trialing",
      subscription_status: input.subscriptionStatus ?? "trialing",
    },
    acquisition: {
      referral_code: input.referralCode ?? "",
      utm_source: input.utmSource ?? "",
      utm_medium: input.utmMedium ?? "",
      utm_campaign: input.utmCampaign ?? "",
      landing_page: input.landingPage ?? (typeof window !== "undefined" ? window.location.href : ""),
    },
    notification_preferences: {
      email_enabled: input.emailEnabled ?? true,
      telegram_enabled: input.telegramEnabled ?? false,
      telegram_chat_id: input.telegramChatId ?? null,
      notify_when_analysis_ready: input.notifyWhenAnalysisReady ?? true,
      notify_about_high_priority_insights:
        input.notifyAboutHighPriorityInsights ?? true,
      notify_about_competitor_moves: input.notifyAboutCompetitorMoves ?? true,
    },
    legal: {
      accepted_terms: input.acceptedTerms,
      accepted_privacy_policy: input.acceptedPrivacyPolicy,
      marketing_consent: input.marketingConsent ?? false,
    },
  };
}

export function useSubmitOnboarding() {
  return useMutation<OnboardingResponse, Error, OnboardingFormInput>({
    mutationFn: async (input) => {
      const contract = buildOnboardingContract(input);
      const res = await triggerWebhook<OnboardingResponse>(
        N8N_PATHS.onboardingSubmit,
        contract,
      );
      if (res.ok && res.workspace_id) {
        setStoredWorkspaceId(res.workspace_id);
      }
      return res;
    },
  });
}
