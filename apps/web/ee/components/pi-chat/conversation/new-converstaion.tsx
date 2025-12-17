import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import type { IUser } from "@plane/types";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TTemplate } from "@/plane-web/types";
import SystemPrompts from "../system-prompts";
import { UnauthorizedView } from "../unauthorized";

type TProps = {
  currentUser: IUser | undefined;
  isFullScreen: boolean;
  shouldRedirect?: boolean;
  isProjectLevel?: boolean;
};
export const NewConversation = observer(function NewConversation(props: TProps) {
  const { currentUser, isFullScreen, shouldRedirect = true, isProjectLevel = false } = props;
  // store hooks
  const { workspaceSlug } = useParams();
  const { getInstance } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString())?.id;
  // SWR
  const { data: instance, isLoading } = useSWR(
    workspaceId ? `PI_STARTER_${workspaceId}` : null,
    workspaceId ? () => getInstance(workspaceId) : null,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      errorRetryCount: 0,
    }
  );
  // state
  const [isInitializing, setIsInitializing] = useState<string | null>(null);

  if (!currentUser) return null;
  if (!isLoading && !instance?.is_authorized) return <UnauthorizedView />;
  return (
    <div className={cn("mt-[10%] md:mt-[20%]")}>
      <div className="flex flex-col gap-2.5">
        <div className={cn("text-center text-h1-semibold text-disabled", { "text-h3-semibold": !isFullScreen })}>
          Hey, {currentUser?.display_name}!
        </div>
        <div className={cn("text-center text-h3-semibold text-secondary pb-2", { "text-h4-medium": !isFullScreen })}>
          How can I help you today?
        </div>
      </div>
      {/* Templates */}
      {isLoading ? (
        <div className="flex gap-4 flex-wrap justify-center">
          <Loader className="flex flex-wrap m-auto justify-center gap-6">
            <Loader.Item width="250px" height="90px" />
            <Loader.Item width="250px" height="90px" />
            <Loader.Item width="250px" height="90px" />
          </Loader>
        </div>
      ) : (
        <div className="flex gap-4 flex-wrap m-auto justify-center mt-6">
          {instance?.is_authorized &&
            instance?.templates?.map((prompt: TTemplate, index: number) => (
              <SystemPrompts
                key={index}
                prompt={prompt}
                shouldRedirect={shouldRedirect}
                isProjectLevel={isProjectLevel}
                isInitializing={isInitializing === prompt.text}
                setIsInitializing={(value) => setIsInitializing(value)}
              />
            ))}
        </div>
      )}
    </div>
  );
});
