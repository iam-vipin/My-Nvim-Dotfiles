"use client";

// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { PageHead } from "@/components/core/page-title";
import { WorkspaceDashboardDetailsHeader } from "./header";

export default function WorkspaceDashboardDetailsLayout() {
  return (
    <>
      <AppHeader header={<WorkspaceDashboardDetailsHeader />} />
      <ContentWrapper>
        <PageHead title="Dashboards" />
        <Outlet />
      </ContentWrapper>
    </>
  );
}
