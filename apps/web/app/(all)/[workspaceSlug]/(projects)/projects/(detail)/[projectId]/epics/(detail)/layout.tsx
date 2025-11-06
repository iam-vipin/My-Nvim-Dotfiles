"use client";

import { Outlet } from "react-router";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { ProjectEpicDetailsHeader } from "./header";

export default function ProjectEpicDetailsLayout() {
  return (
    <>
      <AppHeader header={<ProjectEpicDetailsHeader />} />
      <ContentWrapper className="overflow-hidden">
        <Outlet />
      </ContentWrapper>
    </>
  );
}
