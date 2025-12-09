"use client";

import { observer } from "mobx-react";
import useSWR from "swr";
// components
import { ActivityBlockComponent } from "@/components/common/activity/activity-block";
// constants
import { WORKSPACE_MEMBER_ACTIVITY } from "@/constants/fetch-keys";
// plane web imports
import { getWorkspaceMemberActivityDetails } from "@/plane-web/components/workspace/members/sidebar/activity/helper";
import { SidebarContentWrapper } from "@/plane-web/components/workspace/members/sidebar/content-wrapper";
import { useWorkspaceMembersActivity } from "@/plane-web/hooks/store/use-workspace-members-activity";

type TWorkspaceMembersActivitySidebarProps = { workspaceSlug: string };

export const WorkspaceMembersActivitySidebar = observer(function WorkspaceMembersActivitySidebar(
  props: TWorkspaceMembersActivitySidebarProps
) {
  const { workspaceSlug } = props;
  // store hooks
  const { getWorkspaceMembersActivity, fetchWorkspaceMembersActivity } = useWorkspaceMembersActivity();

  // fetching workspace members activity
  useSWR(
    workspaceSlug ? WORKSPACE_MEMBER_ACTIVITY(workspaceSlug) : null,
    workspaceSlug ? () => fetchWorkspaceMembersActivity(workspaceSlug) : null
  );

  const workspaceMembersActivities = getWorkspaceMembersActivity(workspaceSlug);

  return (
    <SidebarContentWrapper workspaceSlug={workspaceSlug}>
      <div className="px-7 overflow-y-scroll">
        <div role="list">
          {workspaceMembersActivities &&
            workspaceMembersActivities.map((activityItem, index) => {
              const { icon, message } = getWorkspaceMemberActivityDetails(activityItem);
              const isFirst = index === 0;
              const isLast = index === workspaceMembersActivities.length - 1;

              return (
                <ActivityBlockComponent
                  key={activityItem.id}
                  activity={activityItem}
                  icon={icon}
                  ends={isFirst ? "top" : isLast ? "bottom" : undefined}
                >
                  {message}
                </ActivityBlockComponent>
              );
            })}
        </div>
      </div>
    </SidebarContentWrapper>
  );
});
