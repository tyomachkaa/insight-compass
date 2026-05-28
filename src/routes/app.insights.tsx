import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lightbulb, ArrowRight, Check, X, Sparkles, Loader2, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApplyInsight, useDismissInsight, useInsightsFeed } from "@/lib/queries/insights";
import { NoWorkspaceState, ProcessingState, ErrorState, EmptyState } from "@/components/app/PageState";
import type { Database } from "@/lib/database.types";

type InsightRow = Database["app"]["Tables"]["insights_feed"]["Row"];

export const Route = createFileRoute("/app/insights")({ component: Insights });

type Filter = "all" | "not_applied" | "applied" | "dismissed";

function Insights() {
  const { insights, isLoading, error, refetch, hasWorkspace } = useInsightsFeed();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return insights.filter((i) => i.apply_status !== "dismissed");
    return insights.filter((i) => i.apply_status === filter);
  }, [insights, filter]);

  if (!hasWorkspace) return <NoWorkspaceState />;
  if (isLoading) return <ProcessingState variant="grid" title="Loading your insights…" />;
  if (error) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Insights Feed</h1>
          <p className="text-muted-foreground mt-1">Actionable findings from your competitor radar — apply the ones that fit.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "not_applied", "applied"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="rounded-full capitalize"
            >
              {f === "not_applied" ? "Not applied" : f}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No insights here"
          body={filter === "all" ? "No insights generated yet. They appear after the first analysis finishes." : "Nothing matches this filter."}
        />
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {filtered.map((insight) => (
            <InsightCard key={insight.insight_id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: InsightRow }) {
  const apply = useApplyInsight();
  const dismiss = useDismissInsight();
  const applied = insight.apply_status === "applied";

  const evidenceText = (() => {
    const ev = insight.evidence_json;
    if (Array.isArray(ev) && ev.length > 0) {
      const parts = [`${ev.length} data points`];
      if (insight.platform) parts.unshift(insight.platform);
      if (insight.confidence_score != null) parts.push(`${Math.round(insight.confidence_score * 100)}% confidence`);
      return parts.join(" · ");
    }
    const bits: string[] = [];
    if (insight.platform) bits.push(insight.platform);
    if (insight.affected_area) bits.push(insight.affected_area);
    if (insight.confidence_score != null) bits.push(`${Math.round(insight.confidence_score * 100)}% confidence`);
    return bits.join(" · ");
  })();

  const priorityTone =
    insight.priority === "high"
      ? "border-destructive/40 text-destructive"
      : insight.priority === "medium"
        ? "border-warning/40 text-warning"
        : "border-success/40 text-success";

  return (
    <div className="rounded-3xl p-5 border-2 border-border/60 bg-card/60 shadow-pop hover:shadow-glow transition">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-primary/15 text-primary border border-primary/30">
          <Lightbulb className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {insight.insight_type && (
              <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">
                {insight.insight_type.replace(/_/g, " ")}
              </Badge>
            )}
            {insight.priority && (
              <Badge variant="outline" className={`rounded-full text-[10px] uppercase tracking-wider ${priorityTone}`}>
                {insight.priority}
              </Badge>
            )}
            {applied && (
              <Badge className="rounded-full bg-success text-success-foreground border-0 text-[10px]">
                <Check className="size-3 mr-1" /> Applied
              </Badge>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug">{insight.title}</h3>
          {insight.short_summary && (
            <p className="mt-1.5 text-sm text-muted-foreground">{insight.short_summary}</p>
          )}

          {insight.recommended_action && (
            <div className="mt-4 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/60 p-3 flex items-start gap-2">
              <Sparkles className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">Do this:</span> {insight.recommended_action}
              </div>
            </div>
          )}

          {(insight.expected_effect || insight.recommended_tracking_metric) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="size-3.5" />
              {insight.expected_effect ?? `Track ${insight.recommended_tracking_metric}`}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{evidenceText}</span>
            <div className="flex gap-1">
              {!applied && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8"
                  disabled={dismiss.isPending}
                  onClick={() => dismiss.mutate({ insight_id: insight.insight_id })}
                >
                  <X className="size-3.5 mr-1" /> Dismiss
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-full h-8 bg-primary text-primary-foreground shadow-glow hover:opacity-90"
                disabled={applied || apply.isPending}
                onClick={() => apply.mutate({ insight_id: insight.insight_id })}
              >
                {apply.isPending ? (
                  <><Loader2 className="size-3.5 mr-1 animate-spin" /> Applying…</>
                ) : applied ? (
                  <>Applied <Check className="size-3.5 ml-1" /></>
                ) : (
                  <>Apply <ArrowRight className="size-3.5 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
          {apply.isError && (
            <p className="mt-2 text-xs text-destructive">{(apply.error as Error)?.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
