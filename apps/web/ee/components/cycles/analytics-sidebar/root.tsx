import type { FC } from "react";
import { lazy, Suspense, useMemo } from "react";
import { observer } from "mobx-react";
// hooks
import { useFlag } from "@/plane-web/hooks/store";

type Props = {
  workspaceSlug: string;
  projectId: string;
  cycleId: string;
};

export const SidebarChartRoot = observer(function SidebarChartRoot(props: Props) {
  const { workspaceSlug, projectId, cycleId } = props;

  const isFeatureEnabled = useFlag(workspaceSlug.toString(), "CYCLE_PROGRESS_CHARTS");

  const SidebarChart = useMemo(
    function SidebarChart() {
      return lazy(() =>
        isFeatureEnabled
          ? import(`ee/components/cycles/analytics-sidebar/base`).then((module) => ({
              default: module["SidebarChart"],
            }))
          : import("@/ce/components/cycles/analytics-sidebar/base").then((module) => ({
              default: module["SidebarChart"],
            }))
      );
    },
    [isFeatureEnabled]
  );

  return (
    <Suspense fallback={<></>}>
      <SidebarChart workspaceSlug={workspaceSlug} projectId={projectId} cycleId={cycleId} />
    </Suspense>
  );
});
