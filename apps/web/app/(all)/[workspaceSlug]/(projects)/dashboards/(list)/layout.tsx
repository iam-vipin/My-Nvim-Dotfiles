// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { PageHead } from "@/components/core/page-title";
import { WorkspaceDashboardsListHeader } from "./header";

export default function WorkspaceDashboardsListLayout() {
  return (
    <>
      <AppHeader header={<WorkspaceDashboardsListHeader />} />
      <ContentWrapper>
        <PageHead title="Dashboards" />
        <Outlet />
      </ContentWrapper>
    </>
  );
}
