"use client";

import { useParams } from "next/navigation";
import { Outlet } from "react-router";
// components
import { EUserPermissions } from "@plane/constants";
// wrappers
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
// plane web components
import { WikiAppPowerKProvider } from "@/plane-web/components/command-palette/wiki/provider";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags/with-feature-flag-hoc";
import { WikiUpgradeScreen } from "@/plane-web/components/wiki/upgrade-screen";
import { WorkspaceAuthWrapper } from "@/plane-web/layouts/workspace-wrapper";
// local imports
import { PagesAppSidebar } from "./_sidebar";

export default function WikiLayout() {
  // router
  const { workspaceSlug } = useParams();

  return (
    <AuthenticationWrapper>
      <WikiAppPowerKProvider />
      <WorkspaceAuthWrapper>
        <WithFeatureFlagHOC
          workspaceSlug={workspaceSlug?.toString()}
          flag="WORKSPACE_PAGES"
          fallback={<WikiUpgradeScreen workspaceSlug={workspaceSlug?.toString()} />}
        >
          <WorkspaceAccessWrapper
            pageKey="pages"
            allowedPermissions={[EUserPermissions.ADMIN, EUserPermissions.MEMBER]}
          >
            <div className="relative flex h-full w-full overflow-hidden rounded-lg border border-custom-border-200">
              <PagesAppSidebar />
              <main className="relative flex h-full w-full flex-col overflow-hidden bg-custom-background-100">
                <Outlet />
              </main>
            </div>
          </WorkspaceAccessWrapper>
        </WithFeatureFlagHOC>
      </WorkspaceAuthWrapper>
    </AuthenticationWrapper>
  );
}
