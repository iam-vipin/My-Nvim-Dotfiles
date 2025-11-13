"use client";

// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
// local imports
import { WorkspaceActiveCycleHeader } from "./header";

export default function WorkspaceActiveCycleLayout() {
  return (
    <WorkspaceAccessWrapper pageKey="active_cycles">
      <AppHeader header={<WorkspaceActiveCycleHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </WorkspaceAccessWrapper>
  );
}
