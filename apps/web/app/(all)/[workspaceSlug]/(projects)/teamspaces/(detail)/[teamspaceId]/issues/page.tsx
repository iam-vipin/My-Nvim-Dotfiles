import { observer } from "mobx-react";
// components
import { PageHead } from "@/components/core/page-title";
// plane web components
import { TeamspaceLayoutRoot } from "@/plane-web/components/issues/issue-layouts/roots/teamspace-layout-root";
// plane web hooks
import { useTeamspaces } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TeamspaceWorkItemsPage({ params }: Route.ComponentProps) {
  const { teamspaceId } = params;
  // store
  const { getTeamspaceById } = useTeamspaces();

  // derived values
  const teamspace = getTeamspaceById(teamspaceId);
  const pageTitle = teamspace?.name ? `${teamspace?.name} - Issues` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full">
        <TeamspaceLayoutRoot />
      </div>
    </>
  );
}

export default observer(TeamspaceWorkItemsPage);
