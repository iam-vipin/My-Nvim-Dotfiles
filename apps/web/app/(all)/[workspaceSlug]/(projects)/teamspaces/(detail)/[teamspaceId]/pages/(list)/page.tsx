"use client";

import { useSearchParams } from "next/navigation";
// plane imports
import type { TPageNavigationTabs } from "@plane/types";
// components
// plane web imports
import { TeamspacePagesListView } from "@/plane-web/components/teamspaces/pages/pages-list-view";
import type { Route } from "./+types/page";

const getPageType = (pageType: string | null): TPageNavigationTabs => {
  switch (pageType) {
    case "archived":
      return "archived";
    default:
      return "public";
  }
};

function TeamspacePagesPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, teamspaceId } = params;
  const searchParams = useSearchParams();

  // Get current page type (only public/archived for teamspaces)
  const pageType = getPageType(searchParams.get("type"));

  return <TeamspacePagesListView pageType={pageType} teamspaceId={teamspaceId} workspaceSlug={workspaceSlug} />;
}

export default TeamspacePagesPage;
