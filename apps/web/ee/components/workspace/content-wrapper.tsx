"use client";
import React from "react";
import { observer } from "mobx-react";
// plane imports
import { useParams, usePathname } from "next/navigation";
import { cn } from "@plane/utils";
// components
import { StickyActionBar } from "@/components/stickies/action-bar";
// hooks
import { useAppRail } from "@/hooks/use-app-rail";
// plane web imports
import { AppRailRoot } from "@/plane-web/components/app-rail";
import { PiChatArtifactsRoot } from "@/plane-web/components/pi-chat/actions/artifacts/detail/root";
import { PiChatFloatingBot } from "@/plane-web/components/pi-chat/floating-bot";
import { isPiAllowed } from "@/plane-web/helpers/pi-chat.helper";

export const WorkspaceContentWrapper = observer(({ children }: { children: React.ReactNode }) => {
  const { shouldRenderAppRail } = useAppRail();
  const pathname = usePathname();
  const { workspaceSlug } = useParams();
  const shouldRenderPiChat = isPiAllowed(pathname.replace(`/${workspaceSlug}`, ""));
  const shouldRenderAiCanvas = pathname.split("/").includes("pi-chat");

  return (
    <div className="flex relative size-full overflow-hidden bg-custom-background-90 rounded-lg transition-all ease-in-out duration-300">
      {shouldRenderAppRail && <AppRailRoot />}
      <div
        className={cn("relative size-full p-2 flex-grow transition-all ease-in-out duration-300 overflow-hidden", {
          "pl-0": shouldRenderAppRail,
        })}
      >
        {children}
        {/* Floating Action Bar */}
        <div className="absolute bottom-4 right-4 z-[25] flex flex-col gap-4" id="floating-bot">
          <StickyActionBar />
        </div>
      </div>
      {shouldRenderPiChat && (
        <div className="py-2">
          <PiChatFloatingBot />
        </div>
      )}
      {shouldRenderAiCanvas && (
        <div className="py-2">
          <PiChatArtifactsRoot />
        </div>
      )}
    </div>
  );
});
