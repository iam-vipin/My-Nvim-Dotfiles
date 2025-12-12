import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@plane/utils";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { useAIAssistant } from "@/plane-web/hooks/use-ai-assistant";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { WithFeatureFlagHOC } from "../feature-flags";
import { PiChatDetail } from "./detail";
import { PiChatLayout } from "./layout";
import { isPiAllowed } from "@/plane-web/helpers/pi-chat.helper";

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

export const PiChatFloatingBot = observer(function PiChatFloatingBot() {
  // query params
  const pathName = usePathname();
  const params = useParams();
  const { workspaceSlug, projectId, workItem, chatId: routeChatId } = params;
  const searchParams = useSearchParams();
  // hooks
  const { isPiChatDrawerOpen: isOpen, togglePiChatDrawer, initPiChat, drawerChatId } = usePiChat();
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
    if (chatId || routeChatId || drawerChatId)
      initPiChat(chatId?.toString() || routeChatId?.toString() || drawerChatId?.toString());
    else initPiChat();
    // open side panel
    if (isSidePanelOpen) {
      togglePiChatDrawer(true);
    }
  }, [isPiEnabled, isSidePanelOpen, drawerChatId]);

  if (pathName.includes("pi-chat")) return null;
  if (!isPiEnabled || !shouldRenderPiChat) return <></>;

  return (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString() || ""} flag="PI_CHAT" fallback={<></>}>
      <div
        className={cn(
          "transform transition-all duration-300 ease-in-out overflow-x-hidden",
          "rounded-lg border border-custom-border-200 h-full max-w-[400px]",
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
