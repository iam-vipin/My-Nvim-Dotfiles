import { Outlet } from "react-router";
// components
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// plane web components
import { TeamspaceListItemHeader } from "@/plane-web/components/teamspaces/headers/list-header";

export default function TeamspaceListItemLayout() {
  return (
    <>
      <AppHeader header={<TeamspaceListItemHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
