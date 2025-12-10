import type { Editor, Range } from "@tiptap/core";
// plane editor extensions
import type { InsertAttachmentComponentProps } from "@/plane-editor/extensions/attachments/types";
import { EExternalEmbedAttributeNames } from "@/plane-editor/types/external-embed";

export const insertAttachment = ({
  editor,
  event,
  pos,
  file,
  range,
  preview,
  acceptedFileType,
}: {
  editor: Editor;
  event: "insert" | "drop";
  pos?: number | null;
  file?: File;
  range?: Range;
  preview?: boolean;
  acceptedFileType?: string | null;
}) => {
  if (range) editor.chain().focus().deleteRange(range).run();

  const attachmentOptions: InsertAttachmentComponentProps = { event };
  if (pos) attachmentOptions.pos = pos;
  if (file) attachmentOptions.file = file;
  if (preview !== undefined) attachmentOptions.preview = preview;
  if (acceptedFileType !== undefined && acceptedFileType !== null) {
    attachmentOptions.acceptedFileType = acceptedFileType;
  }
  return editor?.chain().focus().insertAttachmentComponent(attachmentOptions).run();
};

export const insertBlockMath = ({ editor, range, latex }: { editor: Editor; range?: Range; latex: string }) => {
  if (range) editor.chain().focus().deleteRange(range).setBlockMath({ latex, pos: range.from }).run();
  else editor.chain().focus().setBlockMath({ latex }).run();
};

export const insertInlineMath = ({ editor, range, latex }: { editor: Editor; range?: Range; latex: string }) => {
  if (range) editor.chain().focus().deleteRange(range).setInlineMath({ latex, pos: range.from }).run();
  else editor.chain().focus().setInlineMath({ latex }).run();
};

export const insertExternalEmbed = ({
  editor,
  range,
  [EExternalEmbedAttributeNames.IS_RICH_CARD]: isRichCard,
  src,
}: {
  editor: Editor;
  range?: Range;
  [EExternalEmbedAttributeNames.IS_RICH_CARD]: boolean;
  src?: string;
}) => {
  if (range) {
    return editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertExternalEmbed({
        [EExternalEmbedAttributeNames.IS_RICH_CARD]: isRichCard,
        pos: range.from,
        [EExternalEmbedAttributeNames.SOURCE]: src,
      })
      .run();
  } else {
    return editor
      .chain()
      .focus()
      .insertExternalEmbed({
        [EExternalEmbedAttributeNames.IS_RICH_CARD]: isRichCard,
        [EExternalEmbedAttributeNames.SOURCE]: src,
      })
      .run();
  }
};
