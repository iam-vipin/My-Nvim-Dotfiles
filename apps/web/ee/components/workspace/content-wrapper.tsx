"use client";
import React from "react";
import { observer } from "mobx-react";
// plane imports
import { usePathname } from "next/navigation";
import { cn } from "@plane/utils";
// components
import { AppRailRoot } from "@/components/navigation";
import { StickyActionBar } from "@/components/stickies/action-bar";
// plane web imports
import { useAppRailVisibility } from "@/lib/app-rail";
import { PiChatArtifactsRoot } from "@/plane-web/components/pi-chat/actions/artifacts/detail/root";
import { PiChatFloatingBot } from "@/plane-web/components/pi-chat/floating-bot";
import { TopNavigationRoot } from "../navigations";

export const WorkspaceContentWrapper = observer(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const shouldRenderAiCanvas = pathname.split("/").includes("pi-chat");

  // Use the context to determine if app rail should render
  const { shouldRenderAppRail } = useAppRailVisibility();

  return (
    <div className="flex flex-col relative size-full overflow-hidden bg-custom-background-90 transition-all ease-in-out duration-300">
      <TopNavigationRoot />
      <div className="relative flex size-full overflow-hidden">
        {/* Conditionally render AppRailRoot based on context */}
        {shouldRenderAppRail && <AppRailRoot />}
        <div
          className={cn(
            "relative size-full pl-2 pb-2 pr-2 flex-grow transition-all ease-in-out duration-300 overflow-hidden",
            {
              "pl-0": shouldRenderAppRail,
            }
          )}
        >
          {children}
          {/* Floating Action Bar */}
          <div className="absolute bottom-4 right-4 z-[25] flex flex-col gap-4" id="floating-bot">
            <StickyActionBar />
          </div>
        </div>
        <div className="pb-2">
          <PiChatFloatingBot />
        </div>
        {shouldRenderAiCanvas && (
          <div className="pb-2">
            <PiChatArtifactsRoot />
          </div>
        )}
      </div>
    </div>
  );
});
