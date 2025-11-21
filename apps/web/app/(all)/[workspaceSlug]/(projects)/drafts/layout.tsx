// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
// local imports
import { WorkspaceDraftHeader } from "./header";

export default function WorkspaceDraftLayout() {
  return (
    <WorkspaceAccessWrapper pageKey="drafts">
      <AppHeader header={<WorkspaceDraftHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </WorkspaceAccessWrapper>
  );
}
