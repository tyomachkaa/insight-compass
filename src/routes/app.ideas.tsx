import { createFileRoute } from "@tanstack/react-router";
import { usePageObject } from "@/lib/queries/page-object";
import { PageHeader, PageObjectGate } from "@/components/app/PageState";
import { GenericPageObject } from "@/components/app/GenericPageObject";

export const Route = createFileRoute("/app/ideas")({ component: IdeaSuggestions });

function IdeaSuggestions() {
  const result = usePageObject({ pageKey: "idea_suggestions" });
  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Idea Suggestions"
        subtitle="AI-generated content and campaign ideas tailored to your niche."
      />
      <PageObjectGate
        result={result}
        emptyTitle="No ideas yet"
        emptyBody="Content ideas are generated from competitor patterns after analysis finishes."
      >
        {(payload) => <GenericPageObject payload={payload} />}
      </PageObjectGate>
    </div>
  );
}
