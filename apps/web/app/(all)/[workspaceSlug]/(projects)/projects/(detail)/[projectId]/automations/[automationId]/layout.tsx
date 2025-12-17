import { observer } from "mobx-react";
// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// plane web imports
import { AutomationsDetailsWrapper } from "@/plane-web/components/automations/details/wrapper";
import { AutomationsListWrapper } from "@/plane-web/components/automations/list/wrapper";
// local imports
import type { Route } from "./+types/layout";
import { ProjectAutomationDetailsHeader } from "./header";

function AutomationDetailsLayout({ params }: Route.ComponentProps) {
  const { automationId, projectId, workspaceSlug } = params;

  return (
    <AutomationsListWrapper projectId={projectId} workspaceSlug={workspaceSlug}>
      <AutomationsDetailsWrapper automationId={automationId} projectId={projectId} workspaceSlug={workspaceSlug}>
        <AppHeader
          header={
            <ProjectAutomationDetailsHeader
              automationId={automationId}
              projectId={projectId}
              workspaceSlug={workspaceSlug}
            />
          }
        />
        <ContentWrapper className="overflow-hidden">
          <Outlet />
        </ContentWrapper>
      </AutomationsDetailsWrapper>
    </AutomationsListWrapper>
  );
}

export default observer(AutomationDetailsLayout);
