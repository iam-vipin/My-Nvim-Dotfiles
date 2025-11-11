"use client";

import { observer } from "mobx-react";
import useSWR from "swr";
// assets
import emptyView from "@/app/assets/empty-state/view.svg?url";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";
// plane web components
import { TeamspaceViewLayoutRoot } from "@/plane-web/components/issues/issue-layouts/roots/teamspace-view-layout-root";
// plane web hooks
import { useTeamspaces, useTeamspaceViews } from "@/plane-web/hooks/store";
import type { Route } from "./+types/page";

function TeamspaceViewWorkItemsPage({ params }: Route.ComponentProps) {
  // router
  const router = useAppRouter();
  const { workspaceSlug, teamspaceId, viewId } = params;
  // store hooks
  const { getTeamspaceById } = useTeamspaces();
  const { fetchTeamspaceViewDetails, getViewById } = useTeamspaceViews();
  // derived values
  const teamspaceView = getViewById(teamspaceId, viewId);
  const teamspace = getTeamspaceById(teamspaceId);
  const pageTitle = teamspace?.name && teamspaceView?.name ? `${teamspace?.name} - ${teamspaceView?.name}` : undefined;
  // fetch teamspace view details
  const { error } = useSWR(`TEAMSPACE_VIEW_DETAILS_${viewId}`, () =>
    fetchTeamspaceViewDetails(workspaceSlug, teamspaceId, viewId)
  );

  if (error) {
    return (
      <EmptyState
        image={emptyView}
        title="View does not exist"
        description="The view you are looking for does not exist or you don't have permission to view it."
        primaryButton={{
          text: "View other views",
          onClick: () => router.push(`/${workspaceSlug}/teamspaces/${teamspaceId}/views`),
        }}
      />
    );
  }

  return (
    <>
      <PageHead title={pageTitle} />
      <TeamspaceViewLayoutRoot />
    </>
  );
}

export default observer(TeamspaceViewWorkItemsPage);
