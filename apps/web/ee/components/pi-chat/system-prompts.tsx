import React from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { BriefcaseIcon, Loader as Spinner } from "lucide-react";
import { CycleIcon, ModuleIcon, LayersIcon, PageIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TTemplate } from "@/plane-web/types";

type TSystemPrompt = {
  prompt: TTemplate;
  isProjectLevel: boolean;
  shouldRedirect?: boolean;
  isInitializing?: boolean;
  setIsInitializing: (value: string) => void;
};

function SystemPrompts(props: TSystemPrompt) {
  const { prompt, isProjectLevel = false, shouldRedirect = true, isInitializing, setIsInitializing } = props;
  // store hooks
  const { getAnswer, isPiTyping, createNewChat } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  // router
  const { workspaceSlug, projectId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  // derived values
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString() || "")?.id;

  const getIcon = (type: string) => {
    switch (type) {
      case "pages":
        return PageIcon;
      case "cycles":
        return CycleIcon;
      case "modules":
        return ModuleIcon;
      case "projects":
        return BriefcaseIcon;
      case "issues":
        return LayersIcon;
      default:
        return LayersIcon;
    }
  };

  const handleClick = async () => {
    setIsInitializing(prompt.text);
    const focus = {
      isInWorkspaceContext: true,
      entityType: projectId ? "project_id" : "workspace_id",
      entityIdentifier: projectId?.toString() || workspaceId?.toString() || "",
    };
    const newChatId = await createNewChat(focus, "ask", isProjectLevel, workspaceId);
    setIsInitializing("");
    // Don't redirect if we are in the floating chat window
    if (shouldRedirect) router.push(`/${workspaceSlug}/${isProjectLevel ? "projects/" : ""}pi-chat/${newChatId}`);
    void getAnswer(
      newChatId,
      prompt.text,
      focus,
      isProjectLevel,
      workspaceSlug?.toString() || "",
      workspaceId?.toString() || "",
      pathname,
      [],
      "ask"
    );
  };
  const promptIcon = getIcon(prompt.type as string);

  return (
    <button
      className={cn(
        "bg-layer-1 rounded-lg flex flex-col w-[250px] p-4 gap-2 border border-transparent hover:border-subtle hover:shadow-sm",
        {
          "border-subtle shadow-sm": isPiTyping || isInitializing,
        }
      )}
      onClick={() => void handleClick()}
      disabled={isPiTyping || isInitializing}
    >
      <div className="items-center gap-2 hidden md:flex">
        {isInitializing ? (
          <Spinner className="size-[20px] animate-spin text-pi-400" />
        ) : (
          <span>
            {React.createElement(promptIcon, {
              className:
                prompt.type === "threads"
                  ? "size-[20px] text-icon-tertiary fill-current"
                  : `shrink-0 size-[20px] stroke-[2] text-icon-tertiary stroke-current`,
            })}
          </span>
        )}
      </div>
      <span className="text-left text-body-sm-regular text-secondary break-words line-clamp-2">{prompt.text}</span>
    </button>
  );
}

export default SystemPrompts;
