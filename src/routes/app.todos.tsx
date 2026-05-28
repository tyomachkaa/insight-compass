import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListChecks, Loader2, Target, Activity, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStartTracking, useTodos } from "@/lib/queries/todos";
import { NoWorkspaceState, ProcessingState, ErrorState, EmptyState } from "@/components/app/PageState";
import type { Database } from "@/lib/database.types";

type TodoRow = Database["app"]["Tables"]["todos"]["Row"];

export const Route = createFileRoute("/app/todos")({ component: Todos });

type Tab = "active" | "tracking" | "done";

function Todos() {
  const { todos, isLoading, error, refetch, hasWorkspace } = useTodos();
  const [tab, setTab] = useState<Tab>("active");

  const grouped = useMemo(() => {
    const isDone = (t: TodoRow) => t.status === "done" || t.status === "completed";
    return {
      active: todos.filter((t) => !isDone(t) && t.tracking_status !== "tracking"),
      tracking: todos.filter((t) => t.tracking_status === "tracking"),
      done: todos.filter(isDone),
    };
  }, [todos]);

  if (!hasWorkspace) return <NoWorkspaceState />;
  if (isLoading) return <ProcessingState variant="simple" title="Loading your todos…" />;
  if (error) return <ErrorState message={(error as Error)?.message} onRetry={refetch} />;

  const list = grouped[tab];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground mt-1">Actions you applied from insights — start tracking to measure impact.</p>
        </div>
        <div className="flex gap-2">
          {(["active", "tracking", "done"] as Tab[]).map((t) => (
            <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)} className="rounded-full capitalize">
              {t} <Badge variant="outline" className="ml-2 rounded-full">{grouped[t].length}</Badge>
            </Button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={`No ${tab} todos`}
          body={tab === "active" ? "Apply an insight from the Insights Feed to create your first todo." : "Nothing here yet."}
        />
      ) : (
        <div className="space-y-3">
          {list.map((todo) => (
            <TodoCard key={todo.todo_id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}

function TodoCard({ todo }: { todo: TodoRow }) {
  const startTracking = useStartTracking();
  const isTracking = todo.tracking_status === "tracking";
  const isDone = todo.status === "done" || todo.status === "completed";
  const canTrack = !isTracking && !isDone && !!(todo.tracking_metric || todo.target_metric);

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-pop">
      <div className="flex items-start gap-4">
        <div className={`size-10 rounded-2xl grid place-items-center shrink-0 ${isDone ? "bg-success/20 text-success" : isTracking ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          {isDone ? <Check className="size-5" /> : isTracking ? <Activity className="size-5" /> : <ListChecks className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {todo.priority && <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wider">{todo.priority}</Badge>}
            {todo.platform && <Badge variant="outline" className="rounded-full text-[10px]">{todo.platform}</Badge>}
            {isTracking && <Badge className="rounded-full bg-primary text-primary-foreground border-0 text-[10px]"><Activity className="size-3 mr-1" /> Tracking</Badge>}
            {isDone && <Badge className="rounded-full bg-success text-success-foreground border-0 text-[10px]">Done</Badge>}
          </div>
          <h3 className="font-display text-lg font-semibold leading-snug">{todo.title}</h3>
          {(todo.description || todo.recommended_action) && (
            <p className="mt-1.5 text-sm text-muted-foreground">{todo.description ?? todo.recommended_action}</p>
          )}

          {(todo.tracking_metric || todo.target_metric || todo.due_at) && (
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {(todo.tracking_metric || todo.target_metric) && (
                <span className="flex items-center gap-1"><Target className="size-3.5" /> {todo.tracking_metric ?? todo.target_metric}</span>
              )}
              {todo.baseline_value != null && <span>baseline {todo.baseline_value}</span>}
              {todo.target_value != null && <span>target {todo.target_value}</span>}
              {todo.due_at && <span className="flex items-center gap-1"><Clock className="size-3.5" /> due {new Date(todo.due_at).toLocaleDateString()}</span>}
            </div>
          )}

          {canTrack && (
            <div className="mt-4">
              <Button
                size="sm"
                className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90"
                disabled={startTracking.isPending}
                onClick={() =>
                  startTracking.mutate({
                    todo_id: todo.todo_id,
                    metric_key: todo.tracking_metric ?? todo.target_metric ?? undefined,
                    tracking_period_days: todo.tracking_period_days ?? 14,
                    baseline_value: todo.baseline_value,
                  })
                }
              >
                {startTracking.isPending ? <><Loader2 className="size-3.5 mr-1 animate-spin" /> Starting…</> : <><Activity className="size-3.5 mr-1" /> Start tracking</>}
              </Button>
              {startTracking.isError && <p className="mt-2 text-xs text-destructive">{(startTracking.error as Error)?.message}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
