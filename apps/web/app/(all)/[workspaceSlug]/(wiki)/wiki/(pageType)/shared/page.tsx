// plane web components
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { WikiPagesListLayoutRoot } from "@/plane-web/components/pages";
// local components
import type { Route } from "./+types/layout";
import { SharedPagesFallback } from "./empty-shared-pages";

export default function SharedPagesList({ params }: Route.ComponentProps) {
  const { workspaceSlug } = params;

  return (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug} flag="SHARED_PAGES" fallback={<SharedPagesFallback />}>
      <WikiPagesListLayoutRoot pageType="shared" />
    </WithFeatureFlagHOC>
  );
}
