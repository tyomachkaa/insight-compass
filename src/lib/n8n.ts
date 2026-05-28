// Thin client for n8n webhooks. Every frontend action that mutates server
// state should go through here — never write to analysis/ops/raw tables
// from the browser. n8n holds the service_role key and orchestrates the
// downstream writes (insert into app.todos, set apply_status, start WF_08, …).
//
// Webhook paths are defined in n8n. The paths below match the docs in
// /Users/tyomachka/Desktop/Insight Compas/FlyHigh-Сервіс для маркетингового аналізу.docx
// (sections 3.3 WF_01, 4.19 Frontend action endpoints).

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL as string | undefined;

export class N8nNotConfiguredError extends Error {
  constructor() {
    super(
      "VITE_N8N_BASE_URL is not set. Add it to .env.local before triggering webhooks.",
    );
    this.name = "N8nNotConfiguredError";
  }
}

export class N8nRequestError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `n8n returned ${status}`);
    this.name = "N8nRequestError";
  }
}

export async function triggerWebhook<TResponse = unknown>(
  path: string,
  payload: unknown,
  init?: { signal?: AbortSignal; headers?: Record<string, string> },
): Promise<TResponse> {
  if (!N8N_BASE_URL) throw new N8nNotConfiguredError();

  const url = `${N8N_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: JSON.stringify(payload),
    signal: init?.signal,
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // leave as text
  }

  if (!res.ok) {
    throw new N8nRequestError(res.status, body, `n8n ${res.status} ${res.statusText}`);
  }

  return body as TResponse;
}

// Canonical webhook paths. Keep in one place so swapping n8n routing
// is a single-file change.
export const N8N_PATHS = {
  onboardingSubmit: "webhook/onboarding/submit",
  insightApply: "webhook/insight/apply",
  todoStartTracking: "webhook/todo/start_tracking",
  todoManualCreate: "webhook/todo/manual_create",
  refreshStart: "webhook/refresh/start",
  accountAdd: "webhook/account/add",
  accountRemove: "webhook/account/remove",
  notificationsUpdate: "webhook/notifications/update",
} as const;
