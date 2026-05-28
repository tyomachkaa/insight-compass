// Defensive, shape-agnostic renderer for page_object payloads whose exact
// section structure isn't pinned down yet (best_competitor_outcomes,
// idea_suggestions, competitor_moves, dynamics). It renders the common
// shapes WF_05 tends to emit and falls back to a raw JSON disclosure so
// nothing is silently dropped. Replace with a bespoke view per page once
// the production payloads stabilize.

import type { PageObjectPayload } from "@/lib/page-object-types";
import { Badge } from "@/components/ui/badge";

type AnyObj = Record<string, unknown>;

function isObj(v: unknown): v is AnyObj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pick(obj: AnyObj, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

const TITLE_KEYS = ["title", "name", "label", "heading", "headline", "account_handle", "tag", "metric_name"];
const BODY_KEYS = ["body", "summary", "description", "text", "short_summary", "detail", "explanation", "interpretation"];
const ITEMS_KEYS = ["items", "cards", "rows", "list", "entries", "data", "posts", "moves", "ideas", "outcomes"];

function humanize(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Card({ title, body, meta }: { title?: string; body?: string; meta?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-pop">
      {title && <h4 className="font-display text-lg font-semibold leading-snug">{title}</h4>}
      {body && <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-line">{body}</p>}
      {meta && <p className="mt-3 text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
}

function ItemList({ items }: { items: unknown[] }) {
  if (items.length === 0) return null;
  // Array of strings → bullet list
  if (items.every((i) => typeof i === "string")) {
    return (
      <ul className="space-y-2">
        {(items as string[]).map((s, i) => (
          <li key={i} className="rounded-xl border border-border/60 bg-card/50 p-3 text-sm">{s}</li>
        ))}
      </ul>
    );
  }
  // Array of objects → cards
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((it, i) => {
        if (isObj(it)) {
          const title = pick(it, TITLE_KEYS);
          const body = pick(it, BODY_KEYS);
          const metaBits = Object.entries(it)
            .filter(([k, v]) => !TITLE_KEYS.includes(k) && !BODY_KEYS.includes(k) && (typeof v === "string" || typeof v === "number"))
            .slice(0, 4)
            .map(([k, v]) => `${humanize(k)}: ${v}`);
          return <Card key={i} title={title ?? `Item ${i + 1}`} body={body} meta={metaBits.join(" · ") || undefined} />;
        }
        return <Card key={i} body={String(it)} />;
      })}
    </div>
  );
}

function Section({ heading, value }: { heading?: string; value: unknown }) {
  return (
    <section className="space-y-3">
      {heading && <h3 className="font-display text-xl font-semibold">{heading}</h3>}
      {Array.isArray(value) ? (
        <ItemList items={value} />
      ) : isObj(value) ? (
        pick(value, TITLE_KEYS) || pick(value, BODY_KEYS) ? (
          <Card title={pick(value, TITLE_KEYS)} body={pick(value, BODY_KEYS)} />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(value).map(([k, v]) => (
              <Card
                key={k}
                title={humanize(k)}
                body={typeof v === "string" || typeof v === "number" ? String(v) : undefined}
                meta={Array.isArray(v) ? `${v.length} items` : undefined}
              />
            ))}
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground">{String(value)}</p>
      )}
    </section>
  );
}

export function GenericPageObject({ payload }: { payload: PageObjectPayload }) {
  const summary = payload.summary;
  const sections = payload.sections;

  return (
    <div className="space-y-8">
      {isObj(summary) && Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary).map(([k, v]) =>
            typeof v === "string" || typeof v === "number" ? (
              <Badge key={k} variant="outline" className="rounded-full">
                {humanize(k)}: {v}
              </Badge>
            ) : null,
          )}
        </div>
      )}

      {Array.isArray(sections) ? (
        <Section value={sections} />
      ) : isObj(sections) ? (
        Object.entries(sections).map(([k, v]) => <Section key={k} heading={humanize(k)} value={v} />)
      ) : null}

      {!sections && isObj(summary) && (
        <p className="text-sm text-muted-foreground">This page object has a summary but no detailed sections yet.</p>
      )}

      {(payload.sections != null || payload.summary != null) && (
        <details className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">View raw payload</summary>
          <pre className="mt-3 text-xs overflow-auto max-h-96 text-muted-foreground">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
