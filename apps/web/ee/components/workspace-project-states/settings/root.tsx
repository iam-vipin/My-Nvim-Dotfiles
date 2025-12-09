import type { FC } from "react";
import { observer } from "mobx-react";
// plane web components
import { EmptyStateCompact } from "@plane/propel/empty-state";
import { WorkspaceProjectStatesLoader, ProjectStateGroupList } from "@/plane-web/components/workspace-project-states";
// plane web hooks
import { useWorkspaceFeatures, useWorkspaceProjectStates } from "@/plane-web/hooks/store";
// plane web types

type TWorkspaceProjectStatesRoot = {
  workspaceSlug: string;
  workspaceId: string;
  isProjectGroupingEnabled: boolean;
  toggleProjectGroupingFeature: () => void;
};

export const WorkspaceProjectStatesRoot = observer(function WorkspaceProjectStatesRoot(
  props: TWorkspaceProjectStatesRoot
) {
  const { workspaceSlug, workspaceId, isProjectGroupingEnabled, toggleProjectGroupingFeature } = props;
  // hooks
  const { loader, getProjectStateIdsWithGroupingByWorkspaceId } = useWorkspaceProjectStates();
  const { loader: workspaceLoader } = useWorkspaceFeatures();

  // derived values
  const groupedProjectStateIds = getProjectStateIdsWithGroupingByWorkspaceId(workspaceId);

  return (
    <div className="space-y-3">
      {isProjectGroupingEnabled && groupedProjectStateIds ? (
        loader || workspaceLoader ? (
          <WorkspaceProjectStatesLoader />
        ) : (
          <ProjectStateGroupList
            workspaceSlug={workspaceSlug}
            workspaceId={workspaceId}
            groupProjectStates={groupedProjectStateIds}
          />
        )
      ) : (
        <EmptyStateCompact
          assetKey="state"
          title="Enable project states"
          description="Project managers can now see the overall progress of all their projects from one screen. Turn on Project States below, set states for your projects, and start tracking progress."
          actions={[
            {
              label: "Enable",
              onClick: () => toggleProjectGroupingFeature(),
            },
          ]}
          align="start"
          rootClassName="py-20"
        />
      )}
    </div>
  );
});
