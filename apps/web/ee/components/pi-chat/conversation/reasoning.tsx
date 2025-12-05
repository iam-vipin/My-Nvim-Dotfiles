import { useState } from "react";
import Markdown from "react-markdown";
import { Brain, ChevronDownIcon } from "lucide-react";
import { cn } from "@plane/utils";

const stripEmojis = (str: string) => str.replace(/\p{Emoji}/gu, "");

type TProps = {
  currentTick?: string;
  reasoning?: string;
  isThinking: boolean | undefined;
};

export const ReasoningBlock = (props: TProps) => {
  const { currentTick, reasoning, isThinking } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("flex flex-col")}>
      {!isThinking && (
        <button className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
          <Brain className="w-4 h-4 text-custom-text-200 flex-shrink-0" />
          <span className="text-base text-custom-text-200 font-medium">Thought for a few seconds</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-500 ease-in-out ${isOpen ? "transform rotate-180" : ""}`}
          />
        </button>
      )}
      <div
        className={cn(
          "rounded-xl bg-custom-background-100  border-custom-border-200 transition-all duration-500 ease-in-out ",
          {
            "border-[0.5px]": isThinking,
            "pt-4 border-[0.5px] mt-2": !isThinking && isOpen,
          }
        )}
      >
        {isThinking && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className={cn(
              "flex justify-start items-center gap-2 w-full px-3 transition-all duration-500 ease-in-out hover:border-transparent py-2 max-w-full overflow-hidden"
            )}
          >
            <div className="w-2 h-4 rounded-[1px] pi-cursor animate-vertical-scale" />
            <div className={cn("shimmer truncate")}>{stripEmojis(currentTick || "Thinking")}</div>{" "}
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
          <div className="mx-4 overflow-hidden text-custom-text-300 relative">
            <Markdown className="pi-chat-root [&>*]:mt-0 text-sm border-l border-custom-border-200 [&>*]:pl-4 [&>*]:relative">
              {reasoning}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};
