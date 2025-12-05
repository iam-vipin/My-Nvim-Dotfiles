"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { EpicIcon } from "@plane/propel/icons";
import { EIssuesStoreType, EUserProjectRoles } from "@plane/types";
import { Breadcrumbs, Tooltip, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { CountChip } from "@/components/common/count-chip";
import { HeaderFilters } from "@/components/issues/filters";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web imports
import { CommonProjectBreadcrumbs } from "@/plane-web/components/breadcrumbs/common";
import { CreateUpdateEpicModal } from "@/plane-web/components/epics/epic-modal";
import { EpicLayoutQuickActions } from "@/plane-web/components/epics/quick-actions/layout-quick-actions";
import { useIssueTypes } from "@/plane-web/hooks/store";

export const EpicsHeader = observer(() => {
  const { workspaceSlug, projectId } = useParams();
  // states
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  // store hooks
  const { getProjectEpicId } = useIssueTypes();
  const {
    issues: { getGroupIssueCount },
  } = useIssues(EIssuesStoreType.EPIC);
  const { currentProjectDetails } = useProject();
  const { allowPermissions } = useUserPermissions();
  const { isMobile } = usePlatformOS();
  // derived values
  const issuesCount = getGroupIssueCount(undefined, undefined, false) || 0;
  const canUserCreateIssue = allowPermissions(
    [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    EUserPermissionsLevel.PROJECT
  );
  const projectEpicId = getProjectEpicId(projectId?.toString());

  return (
    <>
      <CreateUpdateEpicModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        data={{
          project_id: projectId.toString(),
          type_id: projectEpicId,
        }}
      />
      <Header>
        <Header.LeftItem>
          <div className="flex items-center gap-2.5">
            <CommonProjectBreadcrumbs workspaceSlug={workspaceSlug?.toString()} projectId={projectId?.toString()} />
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label="Epics"
                  href={`/${workspaceSlug}/projects/${projectId}/epics/`}
                  icon={<EpicIcon className="h-4 w-4 text-custom-text-300" />}
                  isLast
                />
              }
              isLast
            />
            {issuesCount > 0 ? (
              <Tooltip
                isMobile={isMobile}
                tooltipContent={`There are ${issuesCount} ${issuesCount > 1 ? "epics" : "epic"} in this project`}
                position="bottom"
              >
                <CountChip count={issuesCount} />
              </Tooltip>
            ) : null}
          </div>
        </Header.LeftItem>
        <Header.RightItem>
          <div className="hidden gap-3 md:flex">
            <HeaderFilters
              storeType={EIssuesStoreType.EPIC}
              projectId={projectId?.toString()}
              currentProjectDetails={currentProjectDetails}
              workspaceSlug={workspaceSlug?.toString()}
              canUserCreateIssue={canUserCreateIssue}
            />
          </div>
          {canUserCreateIssue && (
            <Button
              onClick={() => {
                setIsCreateIssueModalOpen(true);
              }}
              size="sm"
            >
              <div className="hidden sm:block">New</div> Epic
            </Button>
          )}
          {projectId && (
            <EpicLayoutQuickActions workspaceSlug={workspaceSlug?.toString()} projectId={projectId.toString()} />
          )}
        </Header.RightItem>
      </Header>
    </>
  );
});
