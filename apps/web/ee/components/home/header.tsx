import { useEffect } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Maximize } from "lucide-react";
// plane imports
import { Tooltip } from "@plane/propel/tooltip";
import { useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { BetaBadge } from "../common/beta";
import { WithFeatureFlagHOC } from "../feature-flags";
import { InputBox } from "../pi-chat/input";
import { UnauthorizedView } from "../pi-chat/unauthorized";

export const HomePageHeader = observer(function HomePageHeader() {
  const { workspaceSlug } = useParams();
  const { activeChatId, isWorkspaceAuthorized, initPiChat } = usePiChat();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  if (!isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED)) return <></>;

  useEffect(() => {
    initPiChat();
  }, []);

  return (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString()} flag="PI_CHAT" fallback={<></>}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-custom-text-350">Ask AI</div>
            <BetaBadge />
          </div>
          <Tooltip tooltipContent="Maximize" position="top">
            <Link href={`/${workspaceSlug}/projects/pi-chat/${activeChatId}`}>
              <Maximize className="size-4 text-custom-text-350" />
            </Link>
          </Tooltip>
        </div>
        {isWorkspaceAuthorized ? (
          <InputBox
            isFullScreen
            isProjectLevel
            showProgress // Required since its taken to a whole different page
            className="relative bg-transparent mt-2 max-w-[950px] mx-auto w-full"
            activeChatId={activeChatId}
          />
        ) : (
          <UnauthorizedView
            className="border border-custom-border-100 rounded-lg p-4 mt-3 max-h-[164px] justify-start"
            imgClassName="h-[117px]"
          />
        )}
      </div>
    </WithFeatureFlagHOC>
  );
});
