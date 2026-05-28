import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UsePageObjectResult } from "@/lib/queries/page-object";
import type { PageObjectPayload } from "@/lib/page-object-types";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function NoWorkspaceState() {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <div className="size-16 rounded-2xl bg-gradient-violet mx-auto grid place-items-center shadow-glow">
        <Sparkles className="size-8 text-primary-foreground" />
      </div>
      <h1 className="font-display text-3xl font-bold">Let's set up your workspace</h1>
      <p className="text-muted-foreground">
        No workspace found yet — run onboarding to start your first competitor analysis.
      </p>
      <Button asChild className="rounded-full">
        <Link to="/onboarding">
          Start onboarding <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}

export function ProcessingState({
  variant = "simple",
  title = "We're still building this page…",
  body = "First analyses usually take ~2 minutes. This page refreshes automatically.",
}: {
  variant?: "simple" | "grid";
  title?: string;
  body?: string;
}) {
  return (
    <div className="space-y-6 max-w-7xl">
      <div className="rounded-3xl border border-primary/40 bg-primary/10 p-8 flex items-center gap-4 shadow-glow">
        <Loader2 className="size-6 text-primary animate-spin shrink-0" />
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{body}</p>
        </div>
      </div>
      {variant === "grid" && (
        <>
          <div className="grid lg:grid-cols-3 gap-5">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  body = "This page hasn't been generated. It usually means the latest analysis hasn't finished, or no run has been triggered.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{body}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
      <div className="size-16 rounded-2xl bg-destructive/20 border border-destructive/40 mx-auto grid place-items-center">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h1 className="font-display text-3xl font-bold">Could not load this page</h1>
      {message && <p className="text-muted-foreground break-words">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} className="rounded-full">
          Try again
        </Button>
      )}
    </div>
  );
}

export function PartialBanner() {
  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 flex items-center gap-3 text-sm">
      <Loader2 className="size-4 animate-spin shrink-0" />
      <span>Analysis still finishing — some sections may be incomplete.</span>
    </div>
  );
}

/**
 * Gate that renders the right state for a page-object query result and only
 * calls `children` once data is ready (or partial). Keeps every page-object
 * route free of repeated state boilerplate.
 */
export function PageObjectGate<T>({
  result,
  children,
  processingVariant = "grid",
  emptyTitle,
  emptyBody,
}: {
  result: UsePageObjectResult<T>;
  children: (payload: PageObjectPayload<T>) => ReactNode;
  processingVariant?: "simple" | "grid";
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (result.status === "no_workspace") return <NoWorkspaceState />;
  if (result.isLoading || result.status === "processing")
    return <ProcessingState variant={processingVariant} />;
  if (result.status === "error")
    return <ErrorState message={(result.error as Error)?.message} onRetry={result.refetch} />;
  if (result.status === "missing" || result.status === "empty")
    return <EmptyState title={emptyTitle} body={emptyBody} />;

  return (
    <>
      {result.status === "partial" && <PartialBanner />}
      {children(result.payload ?? ({} as PageObjectPayload<T>))}
    </>
  );
}
