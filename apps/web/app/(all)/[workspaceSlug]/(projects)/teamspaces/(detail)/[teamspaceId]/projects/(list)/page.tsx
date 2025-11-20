"use client";

import { observer } from "mobx-react";
import { useTheme } from "next-themes";
// plane imports
import useSWR from "swr";
import { useTranslation } from "@plane/i18n";
// assets
import teamsDark from "@/app/assets/empty-state/teams/teams-dark.webp?url";
import teamsLight from "@/app/assets/empty-state/teams/teams-light.webp?url";
// components
import { PageHead } from "@/components/core/page-title";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web imports
import { TeamspaceProjectsWithGroupingRoot } from "@/plane-web/components/teamspaces/projects/grouping-root";
import { TeamspaceProjectsWithoutGroupingRoot } from "@/plane-web/components/teamspaces/projects/non-grouping-root";
import { useFlag, useTeamspaces, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/page";

function TeamspaceProjectsPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, teamspaceId } = params;
  // plane hooks
  const { t } = useTranslation();
  // theme hook
  const { resolvedTheme } = useTheme();
  // store hooks
  const { fetchProjects } = useProject();
  const { getTeamspaceById, getTeamspaceProjectIds } = useTeamspaces();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  // derived values
  const teamspace = getTeamspaceById(teamspaceId);
  const teamspaceProjectIds = getTeamspaceProjectIds(teamspaceId);
  const pageTitle = teamspace?.name ? `${teamspace?.name} - Projects` : undefined;
  const isProjectGroupingFlagEnabled = useFlag(workspaceSlug.toString(), "PROJECT_GROUPING");
  const isProjectGroupingEnabled =
    isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PROJECT_GROUPING_ENABLED) && isProjectGroupingFlagEnabled;
  const resolvedPath = resolvedTheme === "light" ? teamsLight : teamsDark;
  // fetching workspace projects
  useSWR(`WORKSPACE_PROJECTS_${workspaceSlug}`, () => fetchProjects(workspaceSlug), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });

  if (teamspaceProjectIds?.length === 0) {
    return (
      <DetailedEmptyState
        title={t("teamspace_projects.empty_state.general.title")}
        description={t("teamspace_projects.empty_state.general.description")}
        assetPath={resolvedPath}
      />
    );
  }

  if (!teamspace) return null;
  return (
    <>
      <PageHead title={pageTitle} />
      {isProjectGroupingEnabled ? (
        <TeamspaceProjectsWithGroupingRoot workspaceSlug={workspaceSlug} />
      ) : (
        <TeamspaceProjectsWithoutGroupingRoot workspaceSlug={workspaceSlug} teamspace={teamspace} />
      )}
    </>
  );
}

export default observer(TeamspaceProjectsPage);
