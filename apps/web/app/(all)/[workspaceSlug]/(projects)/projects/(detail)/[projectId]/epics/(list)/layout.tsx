import { Outlet } from "react-router";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// local components
import { EpicsHeader } from "./header";
import { ProjectEpicMobileHeader } from "./mobile-header";

export default function ProjectEpicsLayout() {
  return (
    <>
      <AppHeader header={<EpicsHeader />} mobileHeader={<ProjectEpicMobileHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
