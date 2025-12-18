import type { Editor } from "@tiptap/core";
import { MessageSquare } from "lucide-react";
import type { Dispatch, FC, SetStateAction } from "react";
import { useCallback } from "react";
// plane imports
import { cn } from "@plane/utils";

type Props = {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onStartNewComment?: (selection?: { from: number; to: number; referenceText?: string }) => void;
};

export function BubbleMenuCommentSelector(props: Props) {
  const { editor, isOpen, setIsOpen, onStartNewComment } = props;

  const handleCommentCreate = useCallback(() => {
    // Get current selection
    const { selection } = editor.state;
    if (selection.empty) return;

    const { from, to } = selection;

    // Extract the selected text as reference
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    // Call the callback to start a new comment with reference text
    onStartNewComment?.({ from, to, referenceText: selectedText });

    setIsOpen(false);
  }, [editor, setIsOpen, onStartNewComment]);

  return (
    <div className="relative h-full">
      <button
        type="button"
        className={cn(
          "h-full flex items-center gap-1 px-3 text-13 font-medium text-tertiary hover:bg-layer-transparent-hover active:bg-layer-transparent-active rounded-sm transition-colors",
          {
            "bg-layer-transparent-active": isOpen,
          }
        )}
        onClick={(e) => {
          handleCommentCreate();
          e.stopPropagation();
        }}
      >
        Comment
        <MessageSquare className="flex-shrink-0 size-3" />
      </button>
    </div>
  );
}
