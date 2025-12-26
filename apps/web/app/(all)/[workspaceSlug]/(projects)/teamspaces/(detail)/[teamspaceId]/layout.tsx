import { Outlet } from "react-router";
import useSWR from "swr";
import { useTeamspaces, useTeamspaceViews } from "@/plane-web/hooks/store";
import type { Route } from "./+types/layout";

export default function TeamspaceDetailLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, teamspaceId } = params;
  // store hooks
  const { isCurrentUserMemberOfTeamspace, fetchTeamspaceDetails } = useTeamspaces();
  const { fetchTeamspaceViews } = useTeamspaceViews();
  // derived values
  const isTeamspaceMember = isCurrentUserMemberOfTeamspace(teamspaceId);

  // fetching teamspace details
  useSWR(
    isTeamspaceMember ? `WORKSPACE_TEAMSPACES_${workspaceSlug}_${teamspaceId}_${isTeamspaceMember}` : null,
    isTeamspaceMember ? () => fetchTeamspaceDetails(workspaceSlug, teamspaceId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // fetch teamspace views
  useSWR(["teamspaceViews", workspaceSlug, teamspaceId], () => fetchTeamspaceViews(workspaceSlug, teamspaceId), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  return <Outlet />;
}
