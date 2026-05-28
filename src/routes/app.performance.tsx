import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/performance")({ component: Performance });

function Performance() {
  const result = usePageObject({ pageKey: "my_performance" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="My Performance"
        subtitle="Your accounts and how applied insights moved your numbers."
        actions={
          <Button asChild className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/app/settings"><Plug className="size-4 mr-1.5" /> Connect another</Link>
          </Button>
        }
      />
      <PageObjectGate
        result={result}
        emptyTitle="No performance data yet"
        emptyBody="Your performance summary is generated after the first analysis run."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
