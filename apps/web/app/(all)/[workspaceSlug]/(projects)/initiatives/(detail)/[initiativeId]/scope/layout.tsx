// layouts
import { Outlet } from "react-router";
import { EInitiativeNavigationItem } from "@plane/types";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { InitiativesDetailsHeader } from "@/plane-web/components/initiatives/header/root";

function InitiativeScopeLayout() {
  return (
    <>
      <AppHeader header={<InitiativesDetailsHeader selectedNavigationKey={EInitiativeNavigationItem.SCOPE} />} />
      <ContentWrapper className="overflow-hidden">
        <Outlet />
      </ContentWrapper>
    </>
  );
}

export default InitiativeScopeLayout;
