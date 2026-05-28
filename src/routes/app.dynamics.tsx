import { createFileRoute } from "@tanstack/react-router";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/dynamics")({ component: Dynamics });

function Dynamics() {
  const result = usePageObject({ pageKey: "dynamics" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Dynamics"
        subtitle="What changed since your last refresh — momentum, gains, and regressions."
      />
      <PageObjectGate
        result={result}
        emptyTitle="No dynamics yet"
        emptyBody="Dynamics compare the latest run against the previous one. The first run shows a baseline."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
