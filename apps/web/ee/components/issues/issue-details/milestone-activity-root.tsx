import type { FC } from "react";
import { MilestoneIcon } from "@plane/propel/icons";
import { IssueActivityBlockComponent } from "@/components/issues/issue-detail/issue-activity/activity/actions";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type TMilestoneActivityProps = {
  activityId: string;
  ends: "top" | "bottom" | undefined;
};

export function MilestoneActivity(props: TMilestoneActivityProps) {
  const { activityId, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<MilestoneIcon variant="custom" className="h-3 w-3 flex-shrink-0 text-custom-text-300" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        {activity.verb === "created" && (
          <>
            <span>added this work item to the milestone </span>
            <a
              href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
            >
              <span className="truncate">{activity.new_value}</span>
            </a>
          </>
        )}
        {activity.verb === "updated" && (
          <>
            <span>changed the milestone to </span>
            <a
              href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
            >
              <span className="truncate"> {activity.new_value}</span>
            </a>
            <span> from </span>
            <a
              href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
            >
              <span className="truncate"> {activity.old_value}</span>
            </a>
          </>
        )}
        {activity.verb === "deleted" && (
          <>
            <span>removed the work item from the milestone </span>
            <a
              href={`/${activity.workspace_detail?.slug}/projects/${activity.project}/overview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 truncate font-medium text-custom-text-100 hover:underline"
            >
              <span className="truncate"> {activity.old_value}</span>
            </a>
          </>
        )}
      </>
    </IssueActivityBlockComponent>
  );
}
