import { isEmpty, size } from "lodash-es";
import { observer } from "mobx-react";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { EUserWorkspaceRoles } from "@plane/types";
// components
import { SimpleEmptyState } from "@/components/empty-state/simple-empty-state-root";
import { ListLayoutLoader } from "@/components/ui/loader/layouts/list-layout-loader";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useMember } from "@/hooks/store/use-member";
import { useUserPermissions } from "@/hooks/store/user";
import { useResolvedAssetPath } from "@/hooks/use-resolved-asset-path";
// plane web hooks
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local imports
import { getGroupList } from "../utils";
import { InitiativeGroup } from "./initiatives-group";

export const InitiativesRoot = observer(() => {
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { initiative, initiativeFilters } = useInitiatives();
  const { getUserDetails } = useMember();
  const { toggleCreateInitiativeModal } = useCommandPalette();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const displayFilters = initiativeFilters.currentInitiativeDisplayFilters;
  const groupBy = displayFilters?.group_by;
  const groupedInitiativeIds = initiative.currentGroupedFilteredInitiativeIds;
  const searchedResolvedPath = useResolvedAssetPath({ basePath: "/empty-state/search/project" });
  const hasWorkspaceMemberLevelPermissions = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  if (initiative.fetchingFilteredInitiatives) return <ListLayoutLoader />;

  const emptyGroupedInitiativeIds = Object.values(groupedInitiativeIds || {}).every(
    (arr) => Array.isArray(arr) && arr.length === 0
  );
  const isEmptyInitiatives = isEmpty(groupedInitiativeIds) || emptyGroupedInitiativeIds;

  if (emptyGroupedInitiativeIds && size(initiative.initiativesMap) > 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <SimpleEmptyState
          title={t("initiatives.empty_state.search.title")}
          description={t("initiatives.empty_state.search.description")}
          assetPath={searchedResolvedPath}
        />
      </div>
    );
  }

  if (isEmptyInitiatives) {
    return (
      <EmptyStateDetailed
        assetKey="initiative"
        title={t("workspace_empty_state.initiatives.title")}
        description={t("workspace_empty_state.initiatives.description")}
        actions={[
          {
            label: t("workspace_empty_state.initiatives.cta_primary"),
            onClick: () => toggleCreateInitiativeModal({ isOpen: true, initiativeId: undefined }),
            disabled: !hasWorkspaceMemberLevelPermissions,
          },
        ]}
      />
    );
  }

  const groupList = getGroupList(Object.keys(groupedInitiativeIds), groupBy, getUserDetails);

  return (
    <div className={`relative size-full bg-custom-background-90`}>
      <div className="relative size-full flex flex-col">
        {groupList && (
          <div className="size-full vertical-scrollbar scrollbar-lg overflow-auto relative vertical-scrollbar-margin-top-md">
            {groupList.map((group) => (
              <InitiativeGroup
                key={group.id}
                group={group}
                initiativesIds={groupedInitiativeIds[group.id]}
                groupBy={groupBy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
