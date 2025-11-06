"use client";
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

export const SidebarChartRoot: FC<Props> = observer((props) => {
  const { workspaceSlug, projectId, cycleId } = props;

  const isFeatureEnabled = useFlag(workspaceSlug.toString(), "CYCLE_PROGRESS_CHARTS");

  const SidebarChart = useMemo(
    () =>
      lazy(() =>
        isFeatureEnabled
          ? import(`ee/components/cycles/analytics-sidebar/base`).then((module) => ({
              default: module["SidebarChart"] ?? null,
            }))
          : import("@/ce/components/cycles/analytics-sidebar/base").then((module) => ({
              default: module["SidebarChart"],
            }))
      ),
    [isFeatureEnabled]
  );

  return (
    <Suspense fallback={<></>}>
      <SidebarChart workspaceSlug={workspaceSlug} projectId={projectId} cycleId={cycleId} />
    </Suspense>
  );
});
