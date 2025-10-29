import { observer } from "mobx-react";
import { MilestoneIcon } from "@plane/propel/icons";
import { cn } from "@plane/ui";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { getMilestoneVariant } from "@/plane-web/components/project-overview/details/main/milestones/helper";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

type TWorkItemSideBarMilestoneItemProps = {
  projectId: string;
  workItemId: string;
  isPeekView?: boolean;
};

export const WorkItemSideBarMilestoneItem = observer((props: TWorkItemSideBarMilestoneItemProps) => {
  const { projectId, workItemId, isPeekView } = props;

  //store hooks
  const { getMilestoneById } = useMilestones();
  const {
    issue: { getIssueById },
  } = useIssueDetail();

  // derived values
  const workItem = getIssueById(workItemId);

  if (!workItem?.milestone_id) return null;

  const milestone = getMilestoneById(projectId, workItem.milestone_id);

  if (!milestone) return null;

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
          <MilestoneIcon
            variant={getMilestoneVariant(milestone.progress_percentage)}
            className="size-4 text-custom-text-200"
          />
          <span className="text-sm">{milestone.title}</span>
        </div>
      </div>
    </>
  );
});
