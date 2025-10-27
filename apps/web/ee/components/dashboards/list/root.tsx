import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { ListLayout } from "@/components/core/list";
import { SimpleEmptyState } from "@/components/empty-state/simple-empty-state-root";
// hooks
import { useResolvedAssetPath } from "@/hooks/use-resolved-asset-path";
// plane web hooks
import { useDashboards } from "@/plane-web/hooks/store";
// local components
import { DashboardListItem } from "./list-item";
import { DashboardsListLayoutLoader } from "./loader";

export const DashboardsListLayoutRoot = observer(() => {
  // store hooks
  const {
    getDashboardById,
    workspaceDashboards: { currentWorkspaceFetchStatus, isAnyDashboardAvailable, currentWorkspaceFilteredDashboardIds },
  } = useDashboards();
  // translation
  const { t } = useTranslation();
  // derived values
  const searchEmptyStateResolvedPath = useResolvedAssetPath({ basePath: "/empty-state/dashboards/list-search" });

  if (!currentWorkspaceFetchStatus) {
    return <DashboardsListLayoutLoader />;
  }

  // no dashboards empty state
  if (!isAnyDashboardAvailable) {
    return (
      <div className="size-full grid place-items-center">
        <EmptyStateDetailed
          assetKey="dashboard"
          title={t("workspace.dashboard.title")}
          description={t("workspace.dashboard.description")}
        />
      </div>
    );
  }

  if (currentWorkspaceFilteredDashboardIds.length === 0) {
    return (
      <div className="size-full grid place-items-center px-page-x">
        <SimpleEmptyState
          title={t("dashboards.empty_state.dashboards_search.title")}
          description={t("dashboards.empty_state.dashboards_search.description")}
          assetPath={searchEmptyStateResolvedPath}
          size="lg"
        />
      </div>
    );
  }

  return (
    <ListLayout>
      {currentWorkspaceFilteredDashboardIds.map((dashboardId) => (
        <DashboardListItem key={dashboardId} getDashboardDetails={getDashboardById} id={dashboardId} />
      ))}
    </ListLayout>
  );
});
