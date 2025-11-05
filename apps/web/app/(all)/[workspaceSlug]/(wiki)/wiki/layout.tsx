"use client";

// layouts
import { useParams } from "next/navigation";
// components
import { EUserPermissions } from "@plane/constants";
// wrappers
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
import { AuthenticationWrapper } from "@/lib/wrappers/authentication-wrapper";
// plane web components
import { WikiAppPowerKProvider } from "@/plane-web/components/command-palette/wiki/provider";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { WorkspacePagesUpgrade } from "@/plane-web/components/pages";
// plane web layouts
import { WorkspaceAuthWrapper } from "@/plane-web/layouts/workspace-wrapper";
// local components
import { PagesAppSidebar } from "./_sidebar";

export default function WorkspacePagesLayout({ children }: { children: React.ReactNode }) {
  // router
  const { workspaceSlug } = useParams();

  return (
    <AuthenticationWrapper>
      <WikiAppPowerKProvider />
      <WorkspaceAuthWrapper>
        <WithFeatureFlagHOC
          workspaceSlug={workspaceSlug?.toString()}
          flag="WORKSPACE_PAGES"
          fallback={<WorkspacePagesUpgrade />}
        >
          <WorkspaceAccessWrapper
            pageKey="pages"
            allowedPermissions={[EUserPermissions.ADMIN, EUserPermissions.MEMBER]}
          >
            <div className="relative flex h-full w-full overflow-hidden rounded-lg border border-custom-border-200">
              <PagesAppSidebar />
              <main className="relative flex h-full w-full flex-col overflow-hidden bg-custom-background-100">
                {children}
              </main>
            </div>
          </WorkspaceAccessWrapper>
        </WithFeatureFlagHOC>
      </WorkspaceAuthWrapper>
    </AuthenticationWrapper>
  );
}
