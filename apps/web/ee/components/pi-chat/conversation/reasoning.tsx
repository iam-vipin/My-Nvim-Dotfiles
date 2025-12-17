import { useState } from "react";
import Markdown from "react-markdown";
import { Brain, ChevronDownIcon } from "lucide-react";
import { cn } from "@plane/utils";

type TProps = {
  reasoning?: string;
  isThinking: boolean | undefined;
  currentTick?: string;
};

const stripEmojis = (str: string) => str.replace(/\p{Emoji}/gu, "");

export const ReasoningBlock = (props: TProps) => {
  const { reasoning, isThinking, currentTick } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex flex-col")}>
      {!isThinking && (
        <button className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
          <Brain className="w-4 h-4 text-secondary flex-shrink-0" />
          <span className="text-body-sm-medium text-secondary">Thought for a few seconds</span>
          <ChevronDownIcon
            className={`text-icon-tertiary size-3.5 transition-transform duration-500 ease-in-out ${isOpen ? "transform rotate-180" : ""}`}
          />
        </button>
      )}
      <div
        className={cn("rounded-xl bg-surface-1  border-subtle transition-all duration-500 ease-in-out ", {
          border: isThinking,
          "border mt-2": !isThinking && isOpen,
        })}
      >
        {isThinking && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className={cn(
              "flex items-center gap-2 w-full px-3 transition-all duration-500 ease-in-out hover:border-transparent pt-2",
              {
                "pb-2": !isOpen,
              }
            )}
          >
            <div className="w-2 h-4 animate-vertical-scale bg-inverse shrink-0" />
            <div className={cn("flex gap-2 items-center text-body-sm-regular truncate")}>
              <span className="shimmer">{stripEmojis(currentTick || "Thinking")}</span>
            </div>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-500 ease-in-out flex-shrink-0 ${isOpen ? "transform rotate-180" : ""}`}
            />
          </button>
        )}
        <div
          className={cn(
            "overflow-hidden",
            "transition-all duration-500 ease-in-out",

            isOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0 mt-0"
          )}
        >
          <div className="mx-3 overflow-hidden text-tertiary relative">
            <Markdown className="pi-chat-root [&>*]:mt-0 text-body-xs-regular border-l border-subtle-1 [&>*]:pl-4 [&>*]:relative">
              {reasoning}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};
