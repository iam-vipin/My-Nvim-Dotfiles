// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { ProjectWorkItemDetailsHeader } from "./header";

export default function ProjectIssueDetailsLayout() {
  return (
    <>
      <AppHeader header={<ProjectWorkItemDetailsHeader />} />
      <ContentWrapper className="overflow-hidden">
        <Outlet />
      </ContentWrapper>
    </>
  );
}
