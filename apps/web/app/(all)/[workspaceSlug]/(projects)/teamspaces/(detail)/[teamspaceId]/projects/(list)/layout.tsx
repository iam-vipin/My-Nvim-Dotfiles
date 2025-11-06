"use client";

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Outlet } from "react-router";
import { ETeamspaceNavigationItem } from "@plane/constants";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { PageHead } from "@/components/core/page-title";
// plane web components
import { TeamspaceDetailHeader } from "@/plane-web/components/teamspaces/headers/detail-header";
// plane web hooks
import { useTeamspaces } from "@/plane-web/hooks/store";

const TeamspaceProjectsLayout = observer(() => {
  const { teamspaceId } = useParams();
  // store hooks
  const { getTeamspaceById } = useTeamspaces();
  // derived values
  const currentTeam = getTeamspaceById(teamspaceId?.toString());
  const pageTitle = currentTeam?.name ? `Teamspace ${currentTeam?.name} - Projects` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <AppHeader header={<TeamspaceDetailHeader selectedNavigationKey={ETeamspaceNavigationItem.PROJECTS} />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
});

export default TeamspaceProjectsLayout;
