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
// plane web imports
import { useTeamspaces } from "@/plane-web/hooks/store/teamspaces/use-teamspaces";

export const TeamEmptyState = observer(function TeamEmptyState() {
  // router
  const { workspaceSlug: routerWorkspaceSlug, teamspaceId: routerTeamspaceId } = useParams();
  const workspaceSlug = routerWorkspaceSlug ? routerWorkspaceSlug.toString() : undefined;
  const teamspaceId = routerTeamspaceId ? routerTeamspaceId.toString() : undefined;
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { toggleCreateIssueModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  const { getTeamspaceProjectIds } = useTeamspaces();
  // derived values
  const teamspaceWorkItemFilter = useWorkItemFilterInstance(EIssuesStoreType.TEAM, teamspaceId);
  const teamspaceProjectIds = teamspaceId ? getTeamspaceProjectIds(teamspaceId) : [];
  const hasWorkspaceMemberLevelPermissions = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const handleClearAllFilters = () => {
    if (!teamspaceWorkItemFilter || !teamspaceId) return;
    teamspaceWorkItemFilter
      ?.clearFilters()
      .then(() => {
        captureSuccess({
          eventName: TEAMSPACE_WORK_ITEM_TRACKER_EVENTS.EMPTY_STATE_CLEAR_FILTERS,
          payload: {
            teamspace_id: teamspaceId,
          },
        });
      })
      .catch(() => {
        captureError({
          eventName: TEAMSPACE_WORK_ITEM_TRACKER_EVENTS.EMPTY_STATE_CLEAR_FILTERS,
          payload: {
            teamspace_id: teamspaceId,
          },
        });
      });
  };

  if (!workspaceSlug || !teamspaceId) return null;

  return (
    <div className="relative h-full w-full overflow-y-auto">
      {teamspaceWorkItemFilter?.hasActiveFilters ? (
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
              disabled: !hasWorkspaceMemberLevelPermissions || !teamspaceWorkItemFilter,
              variant: "secondary",
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
                toggleCreateIssueModal(true, EIssuesStoreType.TEAM, teamspaceProjectIds);
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
