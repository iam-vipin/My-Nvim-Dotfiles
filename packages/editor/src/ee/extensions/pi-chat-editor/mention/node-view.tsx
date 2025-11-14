import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useEffect, useState } from "react";
// plane imports
import { cn } from "@plane/utils";
// local imports
import type { PiChatEditorMentionAttributes } from "./types";

export type PiChatEditorMentionNodeViewProps = NodeViewProps & {
  node: NodeViewProps["node"] & {
    attrs: PiChatEditorMentionAttributes;
  };
};

export const PiChatEditorMentionNodeView: React.FC<PiChatEditorMentionNodeViewProps> = (props) => {
  // TODO: move it to web app
  const [highlightsState, setHighlightsState] = useState<string[]>([]);
  // derived values
  const { redirect_uri, label, entity_identifier, target } = props.node.attrs;

  useEffect(() => {
    if (!props.extension.options.mentionHighlights) return;
    const highlights = async () => {
      const userId = await props.extension.options.mentionHighlights();
      setHighlightsState(userId);
    };
    highlights();
  }, [props.extension.options]);

  return (
    <NodeViewWrapper className="mention-component inline w-fit">
      <a
        href={redirect_uri}
        target="_blank"
        className={cn("mention rounded px-1 py-0.5 font-medium bg-yellow-500/20 text-yellow-500 text-base", {
          "bg-yellow-500/20 text-yellow-500": highlightsState
            ? highlightsState.includes(entity_identifier ?? "")
            : false,
          "cursor-pointer": !props.extension.options.readonly,
        })}
      >
        @{target} {label}
      </a>
    </NodeViewWrapper>
  );
};
