import { Outlet } from "react-router";
// plane web imports
import { InitiativeScopeModals } from "@/plane-web/components/initiatives/common/scope-modals";
// types
import type { Route } from "./+types/layout";

function InitiativeDetailLayout({ params }: Route.ComponentProps) {
  return (
    <>
      <Outlet />
      <InitiativeScopeModals workspaceSlug={params.workspaceSlug} initiativeId={params.initiativeId} />
    </>
  );
}

export default InitiativeDetailLayout;
