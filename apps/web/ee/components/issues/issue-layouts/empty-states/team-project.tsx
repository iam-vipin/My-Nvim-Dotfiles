import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import {
  EUserPermissionsLevel,
  TEAMSPACE_WORK_ITEM_TRACKER_ELEMENTS,
  TEAMSPACE_WORK_ITEM_TRACKER_EVENTS,
} from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { EIssuesStoreType, EUserWorkspaceRoles } from "@plane/types";
// helpers
import { captureClick, captureError, captureSuccess } from "@/helpers/event-tracker.helper";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useUserPermissions } from "@/hooks/store/user";
import { useWorkItemFilterInstance } from "@/hooks/store/work-item-filters/use-work-item-filter-instance";

export const TeamProjectWorkItemEmptyState: React.FC = observer(() => {
  // router
  const {
    workspaceSlug: routerWorkspaceSlug,
    projectId: routerProjectId,
    teamspaceId: routerTeamspaceId,
  } = useParams();
  const workspaceSlug = routerWorkspaceSlug ? routerWorkspaceSlug.toString() : undefined;
  const teamspaceId = routerTeamspaceId ? routerTeamspaceId.toString() : undefined;
  const projectId = routerProjectId ? routerProjectId.toString() : undefined;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const teamspaceProjectWorkItemFilter = projectId
    ? useWorkItemFilterInstance(EIssuesStoreType.TEAM_PROJECT_WORK_ITEMS, projectId)
    : undefined;
  const hasWorkspaceMemberLevelPermissions = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const handleClearAllFilters = () => {
    if (!teamspaceProjectWorkItemFilter || !teamspaceId || !projectId) return;
    teamspaceProjectWorkItemFilter
      .clearFilters()
      .then(() => {
        captureSuccess({
          eventName: TEAMSPACE_WORK_ITEM_TRACKER_EVENTS.EMPTY_STATE_CLEAR_FILTERS,
          payload: {
            teamspace_id: teamspaceId,
            project_id: projectId,
          },
        });
      })
      .catch(() => {
        captureError({
          eventName: TEAMSPACE_WORK_ITEM_TRACKER_EVENTS.EMPTY_STATE_CLEAR_FILTERS,
          payload: {
            teamspace_id: teamspaceId,
            project_id: projectId,
          },
        });
      });
  };

  if (!workspaceSlug || !teamspaceId || !projectId) return null;

  return (
    <div className="relative h-full w-full overflow-y-auto">
      {teamspaceProjectWorkItemFilter?.hasActiveFilters ? (
        <EmptyStateDetailed
          assetKey="search"
          title={t("teamspace_work_items.empty_state.work_items_empty_filter.title")}
          description={t("teamspace_work_items.empty_state.work_items_empty_filter.description")}
          actions={[
            {
              label: t("teamspace_work_items.empty_state.work_items_empty_filter.secondary_button.text"),
              onClick: () => {
                captureClick({
                  elementName: TEAMSPACE_WORK_ITEM_TRACKER_ELEMENTS.EMPTY_STATE_CLEAR_FILTERS_BUTTON,
                });
                handleClearAllFilters();
              },
              disabled: !hasWorkspaceMemberLevelPermissions || !teamspaceProjectWorkItemFilter,
              variant: "outline-primary",
            },
          ]}
        />
      ) : (
        <EmptyStateDetailed
          assetKey="work-item"
          title={t("teamspace_work_items.empty_state.no_work_items.title")}
          description={t("teamspace_work_items.empty_state.no_work_items.description")}
          actions={[
            {
              label: t("teamspace_work_items.empty_state.no_work_items.primary_button.text"),
              onClick: () => {
                captureClick({
                  elementName: TEAMSPACE_WORK_ITEM_TRACKER_ELEMENTS.EMPTY_STATE_ADD_WORK_ITEM_BUTTON,
                });
                toggleCreateIssueModal(true, EIssuesStoreType.TEAM_PROJECT_WORK_ITEMS, [projectId]);
              },
              disabled: !hasWorkspaceMemberLevelPermissions,
              variant: "primary",
            },
          ]}
        />
      )}
    </div>
  );
});
