import { Outlet } from "react-router";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import { ProjectOverviewHeader } from "./header";

export default function ProjectOverviewLayout() {
  return (
    <>
      <AppHeader header={<ProjectOverviewHeader />} />
      <ContentWrapper className="overflow-hidden">
        <Outlet />
      </ContentWrapper>
    </>
  );
}
