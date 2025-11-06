"use client";

import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
// plane imports
import { useTranslation } from "@plane/i18n";
// assets
import activeCycleDark from "@/app/assets/empty-state/cycle/active-dark.webp?url";
import activeCycleLight from "@/app/assets/empty-state/cycle/active-light.webp?url";
// components
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
// local imports
import ActiveCycleDetail from "./details";
import { CycleProgressHeader } from "./progress-header";
import useCycleDetails from "./use-cycle-details";

type IActiveCycleDetails = {
  workspaceSlug: string;
  projectId: string;
  cycleId?: string;
  showHeader?: boolean;
};

export const ActiveCycleBase: React.FC<IActiveCycleDetails> = observer((props) => {
  const { workspaceSlug, projectId, cycleId } = props;
  // plane hooks
  const { t } = useTranslation();
  // theme hook
  const { resolvedTheme } = useTheme();
  // store hooks
  const cycleDetails = useCycleDetails({ workspaceSlug, projectId, cycleId });
  // derived values
  const activeCycleResolvedPath = resolvedTheme === "light" ? activeCycleLight : activeCycleDark;

  if (!cycleDetails.cycle || isEmpty(cycleDetails.cycle))
    return (
      <div className="max-h-[500px]">
        <DetailedEmptyState
          title={t("project_cycles.empty_state.active.title")}
          description={t("project_cycles.empty_state.active.description")}
          assetPath={activeCycleResolvedPath}
        />
      </div>
    );

  return (
    <>
      <div className="flex flex-shrink-0 flex-col border-b border-custom-border-200">
        <div className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-custom-border-200 bg-custom-background-90 cursor-pointer">
          <CycleProgressHeader
            cycleDetails={cycleDetails.cycle}
            progress={cycleDetails.cycleProgress}
            projectId={projectId}
            cycleId={cycleDetails.cycle?.id || "  "}
            workspaceSlug={workspaceSlug}
          />
        </div>
        <div>
          <ActiveCycleDetail {...cycleDetails} />
        </div>
      </div>
    </>
  );
});
