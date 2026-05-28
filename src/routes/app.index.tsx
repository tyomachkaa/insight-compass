import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Sparkles, Heart, MessageCircle, Eye,
  Flame, Lightbulb, ArrowRight, Play, ImageIcon, Loader2, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts";
import { usePageObject } from "@/lib/queries/page-object";
import { useCurrentWorkspace } from "@/lib/queries/workspace";
import type { DashboardSections } from "@/lib/page-object-types";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { workspace, workspaceId } = useCurrentWorkspace();
  const { payload, status, isLoading, error, refetch } = usePageObject<DashboardSections>({
    pageKey: "dashboard",
  });

  if (!workspaceId) return <NoWorkspaceState />;
  if (status === "processing" || isLoading) return <ProcessingState />;
  if (status === "error") return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;
  if (status === "missing" || status === "empty") return <EmptyState />;

  const sections = payload?.sections ?? {};
  const summaryCards = sections.summary_cards ?? [];
  const topOpportunity = sections.top_opportunities?.[0];
  const nextSteps = sections.recommended_next_steps ?? sections.top_opportunities ?? [];
  const highPriority = sections.high_priority_insights ?? [];
  const spotlight = sections.competitor_spotlight ?? [];
  const wins = sections.recent_wins ?? [];
  const timeseries = (sections.competitive_position as { timeseries?: { d: number; you: number; niche: number }[] } | undefined)?.timeseries;

  const greetingName = workspace?.project_name ?? "there";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Greeting */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Доброго ранку, {greetingName} 👋</h1>
          <p className="text-muted-foreground mt-1">
            {highPriority.length} new insights · {spotlight.length} competitors tracked · {nextSteps.length} actions to take.
          </p>
        </div>
        <Button asChild className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90">
          <Link to="/app/insights">View today's insights <ArrowRight className="ml-2 size-4" /></Link>
        </Button>
      </div>

      {status === "partial" && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 flex items-center gap-3 text-sm">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Analysis still finishing — some sections may be incomplete.</span>
        </div>
      )}

      {/* Top Insight banner */}
      {topOpportunity && (
        <div className="relative overflow-hidden rounded-3xl bg-primary/15 border border-primary/50 p-8 text-foreground shadow-glow">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-violet/40 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="size-14 rounded-2xl bg-primary/20 backdrop-blur grid place-items-center shrink-0">
              <Sparkles className="size-7" />
            </div>
            <div className="flex-1 min-w-[260px]">
              <Badge variant="outline" className="rounded-full bg-primary/20 border-primary/40 text-foreground mb-2">⚡ Top insight today</Badge>
              <h3 className="font-display text-2xl font-bold">{topOpportunity.title}</h3>
              {topOpportunity.body && <p className="mt-1 text-foreground/80">{topOpportunity.body}</p>}
            </div>
            <Button asChild size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90">
              <Link to="/app/insights">See examples</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Pulse cards */}
      {summaryCards.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-5">
          {summaryCards.slice(0, 3).map((c, i) => (
            <PulseCard
              key={i}
              label={c.label}
              value={c.value}
              delta={c.delta ?? ""}
              up={c.delta_direction !== "down"}
              data={c.trend ?? []}
            />
          ))}
        </div>
      )}

      {/* Chart + spotlight */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-card/70 backdrop-blur-sm border border-border/60 p-6 shadow-pop">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl font-semibold">You vs your niche</h3>
              <p className="text-sm text-muted-foreground">Estimated reach over the period</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> You</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" /> Niche avg</span>
            </div>
          </div>
          <div className="h-64">
            {timeseries && timeseries.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={timeseries}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.82 0.15 220)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.82 0.15 220)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Area type="monotone" dataKey="you" stroke="oklch(0.82 0.15 220)" strokeWidth={3} fill="url(#g1)" />
                  <Area type="monotone" dataKey="niche" stroke="oklch(0.7 0.22 280)" strokeWidth={2} fill="url(#g2)" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No timeseries yet — comes online after the first refresh.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-card/70 backdrop-blur-sm border border-border/60 p-6 shadow-pop">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="size-5 text-coral" />
            <h3 className="font-display text-xl font-semibold">Competitor spotlight</h3>
          </div>
          {spotlight.length > 0 ? (
            <div className="space-y-3">
              {spotlight.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className={`rounded-2xl ${i === 0 ? "bg-gradient-to-br from-violet/30 via-primary/20 to-primary/30 border border-primary/40 text-foreground shadow-pop p-4" : "border border-border/60 p-4"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl ${i === 0 ? "bg-primary/20" : "bg-muted"} grid place-items-center text-2xl`}>{s.account_emoji ?? "🎯"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{s.account_handle}</div>
                      <div className={`text-xs ${i === 0 ? "text-foreground/75" : "text-muted-foreground"}`}>
                        {s.metric_label ?? (s.reach ? `${s.reach} reach` : "")}
                      </div>
                    </div>
                  </div>
                  {s.body && <p className="mt-3 text-sm">{s.body}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No competitor moves yet.</p>
          )}
        </div>
      </div>

      {/* Recent wins */}
      {wins.length > 0 && (
        <div className="rounded-3xl bg-card/70 backdrop-blur-sm border border-border/60 p-6 shadow-pop">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-xl font-semibold">Your recent wins 🎉</h3>
              <p className="text-sm text-muted-foreground">Posts that beat your 30-day average</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {wins.slice(0, 3).map((w, i) => (
              <PostCard
                key={i}
                kind={w.kind}
                caption={w.caption}
                reach={w.reach ?? ""}
                likes={w.likes ?? ""}
                comments={w.comments ?? ""}
                lift={w.lift ?? ""}
              />
            ))}
          </div>
        </div>
      )}

      {/* Insight teasers */}
      {highPriority.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          {highPriority.slice(0, 2).map((h, i) => (
            <InsightTeaser key={i} tone={i % 2 === 0 ? "works" : "fails"} title={h.title} body={h.body ?? ""} />
          ))}
        </div>
      )}
    </div>
  );
}

function PulseCard({ label, value, delta, up, data }: { label: string; value: string | number; delta: string; up: boolean; data: { d: number; value: number }[] }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-3xl bg-card/70 backdrop-blur-sm border border-border/60 p-6 shadow-pop">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {delta && (
          <Badge variant="outline" className={`rounded-full ${up ? "text-success border-success/40" : "text-destructive border-destructive/40"}`}>
            {up ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}{delta}
          </Badge>
        )}
      </div>
      <div className="font-display text-4xl font-bold tracking-tight">{value}</div>
      {data.length > 0 && (
        <div className="h-12 mt-3 -mx-2">
          <ResponsiveContainer>
            <LineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="oklch(0.82 0.15 220)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function PostCard({ kind, caption, reach, likes, comments, lift }: { kind: string; caption: string; reach: string | number; likes: string | number; comments: string | number; lift: string }) {
  const grad =
    kind === "Reel"
      ? "bg-gradient-to-br from-primary/30 via-primary/15 to-violet/30 border border-primary/40"
      : kind === "Carousel"
        ? "bg-gradient-to-br from-primary/25 via-violet/20 to-primary/30 border border-primary/40"
        : "bg-gradient-to-br from-violet/30 via-primary/20 to-primary/30 border border-primary/40";
  return (
    <div className="rounded-2xl border border-border/60 overflow-hidden">
      <div className={`aspect-video ${grad} grid place-items-center relative`}>
        {kind === "Reel" && <Play className="size-12 text-primary" />}
        {kind === "Carousel" && <ImageIcon className="size-12 text-foreground/70" />}
        {kind === "Story" && <Sparkles className="size-12 text-primary" />}
        <Badge className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur text-foreground border-0">{kind}</Badge>
        {lift && <Badge className="absolute top-3 right-3 rounded-full bg-success text-success-foreground border-0">{lift}</Badge>}
      </div>
      <div className="p-4">
        <p className="text-sm font-medium line-clamp-2">{caption}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="size-3.5" /> {reach}</span>
          <span className="flex items-center gap-1"><Heart className="size-3.5" /> {likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="size-3.5" /> {comments}</span>
        </div>
      </div>
    </div>
  );
}

function InsightTeaser({ tone, title, body }: { tone: "works" | "fails"; title: string; body: string }) {
  const isWorks = tone === "works";
  return (
    <div className={`rounded-3xl p-6 border-2 shadow-pop ${isWorks ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`size-9 rounded-xl grid place-items-center ${isWorks ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
          <Lightbulb className="size-5" />
        </div>
        <Badge variant="outline" className={`rounded-full uppercase text-[10px] tracking-wider ${isWorks ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}>
          {isWorks ? "What works" : "What fails"}
        </Badge>
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      <Button asChild variant="ghost" size="sm" className="mt-4 rounded-full px-0">
        <Link to="/app/insights">Apply to my strategy <ArrowRight className="size-3.5 ml-1" /></Link>
      </Button>
    </div>
  );
}

function NoWorkspaceState() {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <div className="size-16 rounded-2xl bg-gradient-violet mx-auto grid place-items-center shadow-glow">
        <Sparkles className="size-8 text-primary-foreground" />
      </div>
      <h1 className="font-display text-3xl font-bold">Let's set up your workspace</h1>
      <p className="text-muted-foreground">No workspace found yet — run onboarding to start your first competitor analysis.</p>
      <Button asChild className="rounded-full">
        <Link to="/onboarding">Start onboarding <ArrowRight className="ml-2 size-4" /></Link>
      </Button>
    </div>
  );
}

function ProcessingState() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="rounded-3xl border border-primary/40 bg-primary/10 p-8 flex items-center gap-4 shadow-glow">
        <Loader2 className="size-6 text-primary animate-spin" />
        <div>
          <h2 className="font-display text-xl font-semibold">We're still building your dashboard…</h2>
          <p className="text-sm text-muted-foreground mt-1">First analyses usually take ~2 minutes. This page will refresh automatically.</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <h1 className="font-display text-3xl font-bold">No dashboard data yet</h1>
      <p className="text-muted-foreground">
        Your dashboard page object hasn't been generated. This usually means the latest analysis hasn't finished, or no run has been triggered.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <div className="size-16 rounded-2xl bg-destructive/20 border border-destructive/40 mx-auto grid place-items-center">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h1 className="font-display text-3xl font-bold">Could not load dashboard</h1>
      {message && <p className="text-muted-foreground">{message}</p>}
      <Button onClick={onRetry} className="rounded-full">Try again</Button>
    </div>
  );
}
