import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
// plane imports
import { cn, Loader } from "@plane/ui";
// plane-web imports
import { useWorkspace } from "@/hooks/store/use-workspace";
import ActionStatusBlock from "@/plane-web/components/pi-chat/actions/action-status-block";
import { PiChatArtifactsListRoot } from "@/plane-web/components/pi-chat/actions/artifacts/list/root";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TDialogue } from "@/plane-web/types";
// local imports
import { Feedback } from "./feedback";
import { ReasoningBlock } from "./reasoning";

type TProps = {
  id?: string;
  dialogue?: TDialogue;
  isLatest?: boolean;
  isLoading?: boolean;
  handleConvertToPage?: () => void;
};
export const AiMessage = observer(function AiMessage(props: TProps) {
  // props
  const { dialogue, id = "", isLatest, isLoading, handleConvertToPage } = props;
  // store
  const { workspaceSlug } = useParams();
  const { activeChatId, isPiTyping } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived
  const workspaceId = getWorkspaceBySlug(workspaceSlug?.toString() || "")?.id;
  const { query_id, answer, reasoning, isPiThinking, feedback, current_tick } = dialogue || {};

  return (
    <div className="flex gap-4" id={id}>
      <div className="flex flex-col text-14 break-words w-full">
        {/* Message */}
        <div className="flex flex-col">
          {!isLoading && <ReasoningBlock reasoning={reasoning} isThinking={isPiThinking} currentTick={current_tick} />}
          <Markdown
            remarkPlugins={[remarkGfm]}
            className="pi-chat-root [&>*:first-child]:mt-0 animate-fade-in text-body-sm-regular text-primary"
            components={{
              a: ({ children, href }) => (
                <a href={href || ""} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto w-full my-4 border-subtle-1">
                  <table className="min-w-full border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="px-2 py-3 border-subtle-1"> {children}</th>,
              td: ({ children }) => <td className="px-2 py-3 border-subtle-1">{children}</td>,
            }}
          >
            {answer}
          </Markdown>
        </div>
        {isLoading && (
          <Loader>
            <Loader.Item width="50px" height="42px" />
          </Loader>
        )}
        {dialogue && (
          <div className={cn("flex flex-col gap-4", { "mt-4": !answer })}>
            {/* Artifacts list */}
            {dialogue.actions && <PiChatArtifactsListRoot artifacts={dialogue.actions} />}
            {/* Action bar */}
            <ActionStatusBlock
              workspaceSlug={workspaceSlug?.toString()}
              dialogue={dialogue}
              isLatest={isLatest}
              isPiTyping={isPiTyping}
              isPiThinking={isPiThinking}
              workspaceId={workspaceId}
              query_id={query_id}
              activeChatId={activeChatId}
            />
          </div>
        )}

        {/* Feedback bar */}
        {answer && (
          <Feedback
            answer={answer}
            activeChatId={activeChatId}
            id={id}
            workspaceId={workspaceId}
            feedback={feedback}
            queryId={query_id}
            isLatest={!!isLatest}
            handleConvertToPage={handleConvertToPage}
          />
        )}
      </div>
    </div>
  );
});
