"use client";

import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import { TeamspaceViewWorkItemsHeader } from "./header";

export default function TeamspaceViewWorkItemsLayout() {
  return (
    <>
      <AppHeader header={<TeamspaceViewWorkItemsHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
