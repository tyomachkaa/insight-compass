import { createFileRoute } from "@tanstack/react-router";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/moves")({ component: CompetitorMoves });

function CompetitorMoves() {
  const result = usePageObject({ pageKey: "competitor_moves" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Competitor Moves"
        subtitle="Notable changes your competitors made — launches, pivots, viral posts."
      />
      <PageObjectGate
        result={result}
        emptyTitle="No competitor moves yet"
        emptyBody="Detected competitor moves show up here after a refresh compares runs."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
