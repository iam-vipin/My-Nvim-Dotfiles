import type { FC } from "react";

import { observer } from "mobx-react";
import { ArrowRightLeft } from "lucide-react";
import { EpicIcon } from "@plane/propel/icons";
import type { TIssueActivity } from "@plane/types";
import { IssueActivityBlockComponent } from "@/components/issues/issue-detail/issue-activity/activity/actions";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type TEpicActivityProps = {
  activityId: string;
  ends: "top" | "bottom" | undefined;
};

const commonIconClassName = "h-3 w-3 flex-shrink-0 text-tertiary";

export const EpicActivity = observer(function EpicActivity(props: TEpicActivityProps) {
  const { activityId, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  const getEpicActivityIcon = (activity: TIssueActivity) => {
    switch (activity.verb) {
      case "converted":
        return <ArrowRightLeft className={commonIconClassName} />;
      default:
        return <EpicIcon className={commonIconClassName} />;
    }
  };

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent icon={getEpicActivityIcon(activity)} activityId={activityId} ends={ends}>
      <>
        {activity.verb === "created" ? (
          <>created the epic.</>
        ) : (
          <>
            converted{" "}
            <span className="text-primary font-medium">{`${activity?.project_detail?.identifier}-${activity?.issue_detail?.sequence_id}`}</span>{" "}
            to work item.
          </>
        )}
      </>
    </IssueActivityBlockComponent>
  );
});
