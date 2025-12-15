import { observer } from "mobx-react";
import { Outlet } from "react-router";
// plane web imports
import { PlaneAiAppPowerKProvider } from "@/plane-web/components/command-palette/plane-ai/provider";
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { EmptyPiChat } from "@/plane-web/components/pi-chat/empty";
import { PiChatLayout } from "@/plane-web/components/pi-chat/layout";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
// local imports
import type { Route } from "./+types/layout";
import { PiAppSidebar } from "./sidebar";

function PiLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();

  return (
    <>
      <PlaneAiAppPowerKProvider />
      <div className="relative flex flex-col h-full w-full overflow-hidden rounded-lg border border-subtle-1">
        <div className="relative flex size-full overflow-hidden">
          <PiAppSidebar />
          <main className="relative flex h-full w-full flex-col overflow-hidden bg-surface-1">
            {isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED) ? (
              <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString()} flag="PI_CHAT" fallback={<EmptyPiChat />}>
                <PiChatLayout shouldRenderSidebarToggle isFullScreen>
                  <Outlet />
                </PiChatLayout>
              </WithFeatureFlagHOC>
            ) : (
              <EmptyPiChat />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default observer(PiLayout);
