import type { FC } from "react";
import { observer } from "mobx-react";
import { getPageName } from "@plane/utils";
import { IssueActivityBlockComponent } from "@/components/issues/issue-detail/issue-activity/activity/actions";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

export type TIssuePageActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssuePageActivity: FC<TIssuePageActivity> = observer((props) => {
  const { activityId, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent activityId={activityId} ends={ends}>
      {activity.verb === "added" ? `added a new page` : `removed the page`}{" "}
      <span className="font-medium">{getPageName(activity.new_value || activity.old_value || "")}</span>
    </IssueActivityBlockComponent>
  );
});
