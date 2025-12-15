import type { FC } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import { Button } from "@plane/propel/button";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";

export const WorkspaceWorklogsUpgrade = observer(function WorkspaceWorklogsUpgrade() {
  const { resolvedTheme } = useTheme();
  // store hooks
  const { togglePaidPlanModal } = useWorkspaceSubscription();
  // derived values
  const resolvedEmptyStatePath = `/empty-state/worklogs/worklog-${resolvedTheme === "light" ? "light" : "dark"}.png`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 border-b border-subtle-1 pb-3">
        <div>
          <h3 className="text-18 font-medium">Worklogs</h3>
          <span className="text-13 text-tertiary">Download worklogs AKA timesheets for anyone in any project.</span>
        </div>
        <Button onClick={() => togglePaidPlanModal(true)} className="w-fit">
          Upgrade
        </Button>
      </div>
      <DetailedEmptyState
        title={"Get detailed time-tracking reports from your workspace"}
        description={
          "Set date ranges for logged time by any member in any project in your workspace and get full CSVs in a click."
        }
        assetPath={resolvedEmptyStatePath}
        className="w-[600px] !px-0 min-h-fit"
        primaryButton={{
          text: "Upgrade",
          onClick: () => togglePaidPlanModal(true),
        }}
      />
    </div>
  );
});
