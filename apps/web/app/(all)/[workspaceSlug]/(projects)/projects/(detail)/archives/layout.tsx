// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { ProjectsListHeader } from "@/plane-web/components/projects/header";
import { ProjectsListMobileHeader } from "@/plane-web/components/projects/mobile-header";

export default function ProjectListLayout() {
  return (
    <WorkspaceAccessWrapper pageKey="archives">
      <AppHeader header={<ProjectsListHeader />} mobileHeader={<ProjectsListMobileHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </WorkspaceAccessWrapper>
  );
}
