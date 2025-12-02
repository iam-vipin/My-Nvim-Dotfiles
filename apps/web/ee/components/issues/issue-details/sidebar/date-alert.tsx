import { TriangleAlertIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { TDateAlertProps } from "@/ce/components/issues/issue-details/sidebar.tsx/date-alert";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

export const DateAlert = (props: TDateAlertProps) => {
  const { date, workItem, projectId } = props;

  // store hooks
  const { getMilestoneById } = useMilestones();

  if (!workItem.milestone_id) return null;

  const milestone = getMilestoneById(projectId, workItem.milestone_id);

  if (!milestone || !milestone.target_date) return null;

  const isWorkItemDatePast = new Date(date) > new Date(milestone.target_date);

  if (!isWorkItemDatePast) return null;

  return (
    <Tooltip
      tooltipContent="End date is after the milestone target. You can update to stay on track."
      position="bottom-end"
    >
      <span className="inline-flex cursor-pointer">
        <TriangleAlertIcon className="size-4 text-[#FE9A00]" />
      </span>
    </Tooltip>
  );
};
