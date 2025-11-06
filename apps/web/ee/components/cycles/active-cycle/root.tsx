import { lazy, Suspense, useMemo } from "react";
import { useFlag } from "@/plane-web/hooks/store";

interface IActiveCycleDetails {
  workspaceSlug: string;
  projectId: string;
  cycleId?: string;
  showHeader?: boolean;
}

export const ActiveCycleRoot = (props: IActiveCycleDetails) => {
  const { workspaceSlug, projectId, cycleId, showHeader = true } = props;
  const isFeatureEnabled = useFlag(workspaceSlug.toString(), "CYCLE_PROGRESS_CHARTS");
  const ActiveCycle = useMemo(
    () =>
      lazy(() =>
        isFeatureEnabled
          ? import(`ee/components/cycles/active-cycle/base`).then((module) => ({
              default: module["ActiveCycleBase"],
            }))
          : import("ce/components/cycles/active-cycle/root").then((module) => ({
              default: module["ActiveCycleRoot"],
            }))
      ),
    [isFeatureEnabled]
  );

  return (
    <Suspense fallback={<></>}>
      <ActiveCycle
        workspaceSlug={workspaceSlug.toString()}
        projectId={projectId.toString()}
        cycleId={cycleId}
        showHeader={showHeader}
      />
    </Suspense>
  );
};
