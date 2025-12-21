import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// plane web imports
import { useAutomations } from "@/plane-web/hooks/store/automations/use-automations";
// local imports
import { AutomationDetailsSidebarActivityLogItem } from "./activity-log-item";
import { AutomationDetailsSidebarActivityRunHistoryItem } from "./run-history-item";

type Props = {
  automationId: string;
  activityId: string;
};

export const AutomationDetailsSidebarActivityListItem = observer(function AutomationDetailsSidebarActivityListItem(
  props: Props
) {
  const { automationId, activityId } = props;
  // store hooks
  const { getAutomationById } = useAutomations();
  // derived values
  const automation = getAutomationById(automationId);
  const { getActivityById, checkIfActivityIsFirst, checkIfActivityIsLast } = automation?.activity ?? {};
  const activityDetails = getActivityById?.(activityId);
  const isFirst = checkIfActivityIsFirst?.(activityId);
  const isLast = checkIfActivityIsLast?.(activityId);
  const isRunHistory = activityDetails?.field === "automation.run_history";

  if (!activityDetails) return null;

  return (
    <div
      className={cn("relative flex items-center gap-3 text-11 py-2", {
        "pt-0": isFirst,
        "pb-0": isLast,
      })}
    >
      <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-layer-3" aria-hidden />
      {isRunHistory ? (
        <AutomationDetailsSidebarActivityRunHistoryItem automationId={automationId} activityId={activityId} />
      ) : (
        <AutomationDetailsSidebarActivityLogItem automationId={automationId} activityId={activityId} />
      )}
    </div>
  );
});
