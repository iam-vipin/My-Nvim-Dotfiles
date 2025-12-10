import { observer } from "mobx-react";
import type { TBaseActivityVerbs } from "@plane/types";
// components
import { ActivityBlockComponent } from "@/components/common/activity/activity-block";
// helpers
import type { TInitiativeActivity } from "@/plane-web/types/initiative";
import type { TInitiativeActivityFields } from "./helper";
import { getInitiativeActivityKey, INITIATIVE_UPDATES_HELPER_MAP } from "./helper";

type Props = {
  activity: TInitiativeActivity;
  ends: "top" | "bottom" | undefined;
};

export const InitiativeActivityItem = observer(function InitiativeActivityItem(props: Props) {
  const { activity, ends } = props;
  // return if activity details are not available
  if (!activity) return <></>;
  // derived values
  const initiativeActivityKey = getInitiativeActivityKey(
    activity.field as TInitiativeActivityFields,
    activity.verb as TBaseActivityVerbs
  );
  const getInitiativeActivity = INITIATIVE_UPDATES_HELPER_MAP[initiativeActivityKey];

  if (getInitiativeActivity) {
    const { icon, message, customUserName } = getInitiativeActivity(activity);
    return (
      <ActivityBlockComponent icon={icon} activity={activity} ends={ends} customUserName={customUserName}>
        <>{message}</>
      </ActivityBlockComponent>
    );
  }

  return <></>;
});
