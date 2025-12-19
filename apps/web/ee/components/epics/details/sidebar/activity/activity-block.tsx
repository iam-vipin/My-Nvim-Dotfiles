import { observer } from "mobx-react";
import { LayersIcon } from "@plane/propel/icons";
import type { TBaseActivityVerbs } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
// components
import { ActivityBlockComponent } from "@/components/common/activity/activity-block";
// helpers
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import type { TEpicActivityFields } from "./helper";
import { getEpicActivityKey, EPIC_UPDATES_HELPER_MAP } from "./helper";

type TEpicActivityItemProps = {
  id: string;
  ends: "top" | "bottom" | undefined;
};

export const EpicActivityItem = observer(function EpicActivityItem(props: TEpicActivityItemProps) {
  const { id, ends } = props;

  const {
    activity: { getActivityById },
  } = useIssueDetail(EIssueServiceType.EPICS);

  const activity = getActivityById(id);

  // return if activity details are not available
  if (!activity) return <></>;
  // derived values
  const initiativeActivityKey = getEpicActivityKey(
    activity.field as TEpicActivityFields,
    activity.verb as TBaseActivityVerbs
  );
  const getEpicActivity = EPIC_UPDATES_HELPER_MAP[initiativeActivityKey];

  // adding this for conversion compatibility
  if (activity.field === null && activity.verb === "created") {
    return (
      <ActivityBlockComponent icon={LayersIcon} activity={activity} ends={ends}>
        <span> created the work item.</span>
      </ActivityBlockComponent>
    );
  }

  if (getEpicActivity) {
    const { icon, message, customUserName } = getEpicActivity(activity);
    return (
      <ActivityBlockComponent icon={icon} activity={activity} ends={ends} customUserName={customUserName}>
        <>{message}</>
      </ActivityBlockComponent>
    );
  }

  return <></>;
});
