import { observer } from "mobx-react";
import { MilestoneIcon } from "@plane/propel/icons";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { cn } from "@plane/ui";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { MilestonesDropdown } from "./milestones-dropdown";

type TWorkItemSideBarMilestoneItemProps = {
  workspaceSlug: string;
  projectId: string;
  workItemId: string;
  isPeekView?: boolean;
};

export const WorkItemSideBarMilestoneItem = observer((props: TWorkItemSideBarMilestoneItemProps) => {
  const { workspaceSlug, projectId, workItemId, isPeekView } = props;

  //store hooks
  const {
    workItems: { updateWorkItemMilestone },
  } = useMilestones();
  const {
    issue: { getIssueById },
  } = useIssueDetail();

  // derived values
  const workItem = getIssueById(workItemId);

  if (!workItem) return null;

  // handlers
  const handleChange = (milestoneId: string | undefined) => {
    updateWorkItemMilestone(workspaceSlug, projectId, workItemId, milestoneId).catch(() => {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Failed to update work item milestone. Please try again.",
      });
    });
  };

  return (
    <>
      <div className="flex min-h-8 gap-2">
        <div
          className={cn("flex flex-shrink-0 gap-1 pt-2 text-sm text-custom-text-300", isPeekView ? "w-1/4" : "w-2/5")}
        >
          <MilestoneIcon variant="custom" className="h-4 w-4 flex-shrink-0" />
          <span>Milestone</span>
        </div>
        <div className="h-full min-h-8 w-3/5 flex flex-wrap gap-2 items-center px-1">
          <MilestonesDropdown projectId={projectId} value={workItem.milestone_id} onChange={handleChange} />
        </div>
      </div>
    </>
  );
});
