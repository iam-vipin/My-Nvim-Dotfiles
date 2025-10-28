import { observer } from "mobx-react";
// plane ui
import { Button } from "@plane/propel/button";
import { DashboardIcon } from "@plane/propel/icons";
import { Breadcrumbs, Header } from "@plane/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// plane web components
import { DashboardsListSearch } from "@/plane-web/components/dashboards/list/search";
// plane web hooks
import { useDashboards } from "@/plane-web/hooks/store";

export const WorkspaceDashboardsListHeader = observer(() => {
  // store hooks
  const {
    workspaceDashboards: { canCurrentUserCreateDashboard, toggleCreateUpdateModal, searchQuery, updateSearchQuery },
  } = useDashboards();

  return (
    <Header>
      <Header.LeftItem>
        <div>
          <Breadcrumbs>
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink label="Dashboards" icon={<DashboardIcon className="size-4 text-custom-text-300" />} />
              }
            />
          </Breadcrumbs>
        </div>
      </Header.LeftItem>
      <Header.RightItem>
        <DashboardsListSearch value={searchQuery} onChange={updateSearchQuery} />
        {canCurrentUserCreateDashboard && (
          <Button variant="primary" size="sm" onClick={() => toggleCreateUpdateModal(true)}>
            Add dashboard
          </Button>
        )}
      </Header.RightItem>
    </Header>
  );
});
