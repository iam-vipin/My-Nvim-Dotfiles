import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useEffect } from "react";
// plane imports
import type { TCollaborator } from "@plane/types";
// types
import type { ICollaborativeDocumentEditorProps, EventToPayloadMap, IEditorPropsExtended } from "@/types";

type DocumentEditorSideEffectsProps = {
  editor: Editor;
  id: string;
  updatePageProperties?: ICollaborativeDocumentEditorProps["updatePageProperties"];
  extendedEditorProps?: IEditorPropsExtended;
};

export const DocumentEditorSideEffects = ({
  editor,
  id,
  updatePageProperties,
  extendedEditorProps,
}: DocumentEditorSideEffectsProps) => {
  const { commentConfig } = extendedEditorProps ?? {};
  const { users } = useEditorState({
    editor,
    selector: (ctx) => ({
      users: ctx.editor.storage.collaborationCursor?.users || [],
    }),
  });

  const { commentsOrder } = useEditorState({
    editor,
    selector: (ctx) => ({
      commentsOrder: ctx.editor.storage.commentMark?.commentsOrder || [],
    }),
  });

  // Update page properties when collaborators change
  useEffect(() => {
    if (!users || !updatePageProperties) return;

    const currentUsers = users;

    const collaboratorPayload: EventToPayloadMap["collaborators-updated"] = {
      users: currentUsers as TCollaborator[],
    };

    updatePageProperties(id, "collaborators-updated", collaboratorPayload, false);
  }, [users, updatePageProperties, id, editor]);

  useEffect(() => {
    if (!commentsOrder) return;
    commentConfig?.onCommentsOrderChange?.(commentsOrder);
  }, [commentsOrder, commentConfig]);

  return null;
};
