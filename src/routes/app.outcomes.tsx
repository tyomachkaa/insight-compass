import { createFileRoute } from "@tanstack/react-router";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/outcomes")({ component: BestOutcomes });

function BestOutcomes() {
  const result = usePageObject({ pageKey: "best_competitor_outcomes" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Best Competitor Outcomes"
        subtitle="The highest-performing competitor content — what worked and why."
      />
      <PageObjectGate
        result={result}
        emptyTitle="No outcomes yet"
        emptyBody="Top competitor outcomes appear after the first analysis run completes."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
