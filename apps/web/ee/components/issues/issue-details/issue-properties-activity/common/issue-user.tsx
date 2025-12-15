import type { FC } from "react";
import Link from "next/link";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web hooks
import { useIssuePropertiesActivity } from "@/plane-web/hooks/store";

type TIssueUser = {
  activityId: string;
};

export function IssueUser(props: TIssueUser) {
  const { activityId } = props;
  // hooks
  const { getPropertyActivityById } = useIssuePropertiesActivity();
  const { getWorkspaceById } = useWorkspace();
  // derived values
  const activityDetail = getPropertyActivityById(activityId);
  if (!activityDetail || !activityDetail.workspace || !activityDetail.actor) return <></>;
  const workspaceDetail = getWorkspaceById(activityDetail.workspace);

  return (
    <>
      <Link
        href={`/${workspaceDetail?.slug}/profile/${activityDetail.actor_detail?.id}`}
        className="hover:underline text-primary font-medium"
      >
        {activityDetail.actor_detail?.display_name}
      </Link>
    </>
  );
}
