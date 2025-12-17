// components
import { PageHead } from "@/components/core/page-title";
// plane web components
import { TeamspaceProjectWorkLayoutRoot } from "@/plane-web/components/issues/issue-layouts/roots/teamspace-project-root";
// plane web hooks
import { useTeamspaces } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TeamspaceProjectDetailPage({ params }: Route.ComponentProps) {
  const { teamspaceId } = params;
  // store
  const { getTeamspaceById } = useTeamspaces();

  // derived values
  const teamspace = getTeamspaceById(teamspaceId);
  const pageTitle = teamspace?.name ? `${teamspace?.name} - Work items` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full">
        <TeamspaceProjectWorkLayoutRoot />
      </div>
    </>
  );
}

export default TeamspaceProjectDetailPage;
