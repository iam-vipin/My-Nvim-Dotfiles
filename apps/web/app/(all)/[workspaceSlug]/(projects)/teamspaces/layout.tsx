import { observer } from "mobx-react";
import { Outlet } from "react-router";
// hooks
import { PageHead } from "@/components/core/page-title";
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web components
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { TeamspaceUpgrade } from "@/plane-web/components/teamspaces/upgrade";
// plane web hooks
import { useTeamspaces } from "@/plane-web/hooks/store";

function TeamspacesLayout() {
  // store
  const { currentWorkspace } = useWorkspace();
  // plane web stores
  const { loader, isTeamspacesFeatureEnabled } = useTeamspaces();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Teamspaces` : undefined;
  const shouldUpgrade =
    isTeamspacesFeatureEnabled !== undefined && isTeamspacesFeatureEnabled === false && loader !== "init-loader";

  return (
    <WorkspaceAccessWrapper pageKey="team_spaces">
      {shouldUpgrade ? (
        <div className="h-full w-full max-w-5xl mx-auto flex items-center justify-center">
          <TeamspaceUpgrade />
        </div>
      ) : (
        <>
          <PageHead title={pageTitle} />
          <Outlet />
        </>
      )}
    </WorkspaceAccessWrapper>
  );
}

export default observer(TeamspacesLayout);
