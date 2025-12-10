import { observer } from "mobx-react";
import { Outlet } from "react-router";
// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";
import { EmptyPiChat } from "@/plane-web/components/pi-chat/empty";
import { PiChatLayout } from "@/plane-web/components/pi-chat/layout";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import type { Route } from "./+types/layout";

function Layout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug } = params;
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  return isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED) ? (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug} flag="PI_CHAT" fallback={<EmptyPiChat />}>
      <PiChatLayout isFullScreen isProjectLevel shouldRenderSidebarToggle>
        <Outlet />
      </PiChatLayout>
    </WithFeatureFlagHOC>
  ) : (
    <EmptyPiChat />
  );
}

export default observer(Layout);
