import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/competitors")({ component: Competitors });

function Competitors() {
  const result = usePageObject({ pageKey: "competitor_radar" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Competitor Radar"
        subtitle="Where each competitor stands across engagement, cadence, reach and reviews."
        actions={
          <Button asChild className="rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/app/settings">+ Add competitor</Link>
          </Button>
        }
      />
      <PageObjectGate
        result={result}
        emptyTitle="No radar yet"
        emptyBody="Competitor radar scores appear after the first analysis run completes."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
