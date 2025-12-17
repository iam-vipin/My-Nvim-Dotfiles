import { useState } from "react";
import { observer } from "mobx-react";
import { Copy, FilePlus2, ThumbsDown, ThumbsUp, Repeat2 } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { cn } from "@plane/ui";
import { Tooltip } from "@plane/propel/tooltip";
import { copyTextToClipboard } from "@plane/utils";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EFeedback } from "@/plane-web/types";
import { FeedbackModal } from "../input/feedback-modal";

export type TProps = {
  answer: string;
  activeChatId: string;
  id: string;
  workspaceId: string | undefined;
  feedback: EFeedback | undefined;
  queryId: string | undefined;
  isLatest: boolean;
  handleConvertToPage?: () => void;
};

export const Feedback = observer(function Feedback(props: TProps) {
  // props
  const { answer, activeChatId, id, workspaceId, feedback, queryId, isLatest, handleConvertToPage } = props;
  // states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  // store
  const { isWorkspaceAuthorized, sendFeedback, regenerateAnswer } = usePiChat();
  // handlers
  const handleCopyLink = () => {
    void copyTextToClipboard(answer).then(() => {
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Response copied!",
        message: "Response to clipboard.",
      });
      return;
    });
  };
  const handleFeedback = async (feedback: EFeedback, feedbackMessage?: string) => {
    try {
      await sendFeedback(activeChatId, parseInt(id), feedback, workspaceId, feedbackMessage);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Feedback sent!",
        message: "Feedback sent!",
      });
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Feedback failed!",
        message: "Feedback failed!",
      });
    }
  };
  const handleRewrite = async () => {
    try {
      if (!queryId || !workspaceId) return;
      await regenerateAnswer(activeChatId, queryId, workspaceId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Copy */}
      <Tooltip tooltipContent="Copy to clipboard" position="bottom" className="mb-4">
        <Copy size={16} onClick={handleCopyLink} className="my-auto cursor-pointer text-icon-secondary" />
      </Tooltip>

      {/* Good response */}
      {(!feedback || feedback === EFeedback.POSITIVE) && (
        <Tooltip tooltipContent="Good response" position="bottom" className="mb-4">
          <button
            className={cn({
              "cursor-default": feedback === EFeedback.POSITIVE,
            })}
            onClick={() => {
              if (!feedback) void handleFeedback(EFeedback.POSITIVE);
            }}
          >
            <ThumbsUp
              size={16}
              fill={feedback === EFeedback.POSITIVE ? "currentColor" : "none"}
              className="my-auto text-icon-secondary transition-colors	"
            />
          </button>
        </Tooltip>
      )}

      {/* Bad response */}
      {(!feedback || feedback === EFeedback.NEGATIVE) && (
        <Tooltip tooltipContent="Bad response" position="bottom" className="mb-4">
          <button
            className={cn({
              "!cursor-default": feedback === EFeedback.NEGATIVE,
            })}
            onClick={() => !feedback && setIsFeedbackModalOpen(true)}
          >
            <ThumbsDown
              size={16}
              fill={feedback === EFeedback.NEGATIVE ? "currentColor" : "none"}
              className="my-auto text-icon-secondary transition-colors	"
            />
          </button>
        </Tooltip>
      )}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={(feedbackMessage) => void handleFeedback(EFeedback.NEGATIVE, feedbackMessage)}
      />

      {/* Rewrite */}
      {isLatest && (
        <Tooltip tooltipContent="Rewrite" position="bottom" className="mb-4">
          <button onClick={() => void handleRewrite()}>
            <Repeat2 strokeWidth={1.5} size={20} className="my-auto text-icon-secondary transition-colors" />
          </button>
        </Tooltip>
      )}

      {/* Convert to page */}
      <div className="flex text-13 font-medium gap-1 cursor-pointer">
        <Tooltip
          tooltipContent={isWorkspaceAuthorized ? "Convert to page" : "Authorize workspace to convert to page"}
          position="bottom"
          className="mb-4"
        >
          <button onClick={() => isWorkspaceAuthorized && handleConvertToPage?.()}>
            <FilePlus2
              size={16}
              className={cn("my-auto text-icon-secondary transition-colors", {
                "cursor-not-allowed text-custom-text-400": !isWorkspaceAuthorized,
              })}
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
});
