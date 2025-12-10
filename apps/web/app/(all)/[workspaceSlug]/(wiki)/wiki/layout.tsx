import { Outlet } from "react-router";
import useSWR from "swr";
// components
import { EUserPermissions } from "@plane/constants";
// wrappers
import WorkspaceAccessWrapper from "@/layouts/access/workspace-wrapper";
// plane web components
import { WikiAppPowerKProvider } from "@/plane-web/components/command-palette/wiki/provider";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags/with-feature-flag-hoc";
import { WikiUpgradeScreen } from "@/plane-web/components/wiki/upgrade-screen";
import { EPageStoreType, usePageStore } from "@/plane-web/hooks/store";
// local components
import type { Route } from "./+types/layout";
import { PagesAppSidebar } from "./_sidebar";

export default function WikiLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  // store hooks
  const { fetchPagesSummary } = usePageStore(EPageStoreType.WORKSPACE);
  // fetch wiki summary
  useSWR(workspaceSlug ? `WORKSPACE_PAGES_SUMMARY_${workspaceSlug}` : null, workspaceSlug ? fetchPagesSummary : null, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  return (
    <>
      <WikiAppPowerKProvider />
      <WithFeatureFlagHOC
        workspaceSlug={workspaceSlug}
        flag="WORKSPACE_PAGES"
        fallback={<WikiUpgradeScreen workspaceSlug={workspaceSlug} />}
      >
        <WorkspaceAccessWrapper pageKey="pages" allowedPermissions={[EUserPermissions.ADMIN, EUserPermissions.MEMBER]}>
          <div className="relative flex h-full w-full overflow-hidden rounded-lg border border-custom-border-200">
            <PagesAppSidebar />
            <main className="relative flex h-full w-full flex-col overflow-hidden bg-custom-background-100">
              <Outlet />
            </main>
          </div>
        </WorkspaceAccessWrapper>
      </WithFeatureFlagHOC>
    </>
  );
}
