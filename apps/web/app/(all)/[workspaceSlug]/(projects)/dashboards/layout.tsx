import { Outlet } from "react-router";
import useSWR from "swr";
// plane web components
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { DashboardsFeatureFlagFallback } from "@/plane-web/components/dashboards/feature-flag-fallback";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
// plane web hooks
import { useDashboards } from "@/plane-web/hooks/store";
import type { Route } from "./+types/layout";

export default function WorkspaceDashboardsLayout({ params }: Route.ComponentProps) {
  // navigation
  const { workspaceSlug } = params;
  // store hooks
  const {
    workspaceDashboards: { fetchDashboards },
  } = useDashboards();

  useSWR(`WORKSPACE_DASHBOARDS_LIST_${workspaceSlug}`, () => fetchDashboards());

  return (
    <WorkspaceAccessWrapper pageKey="dashboards">
      <WithFeatureFlagHOC
        fallback={<DashboardsFeatureFlagFallback />}
        flag="DASHBOARDS"
        workspaceSlug={workspaceSlug?.toString() ?? ""}
      >
        <Outlet />
      </WithFeatureFlagHOC>
    </WorkspaceAccessWrapper>
  );
}
