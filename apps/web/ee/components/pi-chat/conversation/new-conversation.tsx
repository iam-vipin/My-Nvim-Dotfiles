import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Loader } from "@plane/ui";
import { cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { UnauthorizedView } from "../unauthorized";
import type { TTemplate } from "@/plane-web/types";

type TProps = {
  onClick: (query: string) => void;
};
export const Templates = observer(function Templates(props: TProps) {
  const { onClick } = props;
  // store hooks
  const { workspaceSlug } = useParams();
  const { getInstance, isPiTyping } = usePiChat();
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
  if (!isLoading && !instance?.is_authorized) return <UnauthorizedView />;
  return (
    <div>
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
        <div className="flex flex-col m-auto justify-center rounded-b-2xl overflow-hidden">
          {instance?.is_authorized &&
            instance?.templates?.map((prompt: TTemplate, index: number) => (
              <button
                key={index}
                className={cn("bg-layer-1 flex w-full px-3 py-2 hover:bg-layer-1-hover")}
                onClick={(e) => {
                  e.preventDefault();
                  onClick(prompt.text);
                }}
                disabled={isPiTyping}
              >
                <span className="text-left text-body-xs-regular text-secondary break-words line-clamp-2">
                  {prompt.text}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
});
