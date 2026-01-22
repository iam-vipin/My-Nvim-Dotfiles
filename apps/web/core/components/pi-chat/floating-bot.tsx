/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@plane/utils";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { useAIAssistant } from "@/plane-web/hooks/use-ai-assistant";
import { EWorkspaceFeatures } from "@/types/workspace-feature";
import { WithFeatureFlagHOC } from "@/components/feature-flags";
import { PiChatDetail } from "./detail";
import { PiChatLayout } from "./layout";
import { isPiAllowed } from "@/helpers/pi-chat";

const getEntityData = (
  params: Record<string, string | undefined>
): {
  entityType: "issue" | "cycle" | "module" | "page" | "view";
  entityIdentifier: string;
} | null => {
  const { workItem, cycleId, moduleId, pageId, viewId } = params;
  if (workItem)
    return {
      entityType: "issue",
      entityIdentifier: workItem,
    };
  if (cycleId)
    return {
      entityType: "cycle",
      entityIdentifier: cycleId,
    };
  if (moduleId)
    return {
      entityType: "module",
      entityIdentifier: moduleId,
    };
  if (pageId)
    return {
      entityType: "page",
      entityIdentifier: pageId,
    };
  if (viewId)
    return {
      entityType: "view",
      entityIdentifier: viewId,
    };
  return null;
};

type TProps = {
  isOpen: boolean;
  sidecarChatId: string | undefined;
  openPiChatSidecar: (chatId?: string) => void;
};
export const PiChatFloatingBot = observer(function PiChatFloatingBot(props: TProps) {
  const { isOpen, sidecarChatId, openPiChatSidecar } = props;
  // query params
  const pathName = usePathname();
  const params = useParams();
  const { workspaceSlug, projectId, workItem, chatId: routeChatId } = params;
  const searchParams = useSearchParams();
  // hooks
  const { initPiChat } = usePiChat();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  const entityData = getEntityData(params);
  const contextData = entityData ? useAIAssistant(entityData.entityType, entityData.entityIdentifier) : null;
  // derived states
  const isSidePanelOpen = searchParams.get("pi_sidebar_open");
  const chatId = searchParams.get("chat_id");
  const isPiEnabled = isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED);
  const shouldRenderPiChat =
    isPiAllowed(pathName, workspaceSlug?.toString() ?? "") && isPiEnabled && (projectId || workItem);
  useEffect(() => {
    if (!isPiEnabled || (!isSidePanelOpen && !isOpen)) return;
    // initialize chat
    if (chatId || routeChatId || sidecarChatId)
      initPiChat(chatId?.toString() || routeChatId?.toString() || sidecarChatId?.toString());
    else initPiChat();
    // open side panel
    if (isSidePanelOpen) {
      openPiChatSidecar(chatId?.toString());
    }
  }, [isPiEnabled, isSidePanelOpen, sidecarChatId]);

  if (pathName.includes("pi-chat")) return null;
  if (!isPiEnabled || !shouldRenderPiChat) return <></>;

  return (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString() || ""} flag="PI_CHAT" fallback={<></>}>
      <div
        className={cn(
          "transform transition-all duration-300 ease-in-out overflow-x-hidden",
          "rounded-lg border border-subtle-1 h-full max-w-[400px]",
          isOpen ? "translate-x-0 w-[400px] mr-2" : "px-0 translate-x-[100%] w-0 border-none"
        )}
        data-prevent-outside-click
      >
        <PiChatLayout isFullScreen={false} isProjectLevel isOpen={isOpen}>
          <PiChatDetail isFullScreen={false} shouldRedirect={false} isProjectLevel contextData={contextData} />
        </PiChatLayout>
      </div>
    </WithFeatureFlagHOC>
  );
});
