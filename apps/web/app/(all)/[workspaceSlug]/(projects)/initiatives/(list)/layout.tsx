// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
// plane-web
import { InitiativesFilterProvider } from "@/plane-web/components/initiatives/components/rich-filters/context";
// local components
import { InitiativesListHeader } from "./header";

function InitiativesListLayout() {
  return (
    <InitiativesFilterProvider>
      <AppHeader header={<InitiativesListHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </InitiativesFilterProvider>
  );
}

export default InitiativesListLayout;
