import { observer } from "mobx-react";
import useSWR from "swr";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
// plane web components
import { TeamsOverviewRoot } from "@/plane-web/components/teamspaces/overview/root";
// plane web hooks
import { useFlag, useTeamspaces, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/page";

function TeamspaceOverviewPage({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, teamspaceId } = params;
  // store
  const { fetchProjectAttributes } = useProjectAdvanced();
  const { loader, getTeamspaceById, getTeamspaceProjectIds } = useTeamspaces();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  // derived values
  const teamspace = getTeamspaceById(teamspaceId);
  const teamspaceProjectIds = getTeamspaceProjectIds(teamspaceId);
  const isProjectGroupingFeatureFlagEnabled = useFlag(workspaceSlug, "PROJECT_GROUPING");
  const isProjectGroupingEnabled =
    isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PROJECT_GROUPING_ENABLED) && isProjectGroupingFeatureFlagEnabled;
  // fetch team project attributes
  useSWR(
    isProjectGroupingEnabled && teamspaceProjectIds && teamspaceProjectIds.length > 0
      ? ["teamspaceProjectAttributes", workspaceSlug, isProjectGroupingEnabled, ...teamspaceProjectIds]
      : null,
    isProjectGroupingEnabled && teamspaceProjectIds && teamspaceProjectIds.length > 0
      ? () =>
          fetchProjectAttributes(workspaceSlug, {
            project_ids: teamspaceProjectIds?.join(","),
          })
      : null
  );

  if (loader === "init-loader")
    return (
      <div className="h-full w-full flex justify-center items-center">
        <LogoSpinner />
      </div>
    );

  // Empty state if teamspace is not found
  if (!teamspace) return null;

  return <TeamsOverviewRoot teamspaceId={teamspaceId} />;
}

export default observer(TeamspaceOverviewPage);
