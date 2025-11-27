import type { Editor } from "@tiptap/core";
// local imports
import { EAttachmentBlockAttributeNames } from "./types";
import type { TAttachmentBlockAttributes } from "./types";

export const DEFAULT_ATTACHMENT_BLOCK_ATTRIBUTES: TAttachmentBlockAttributes = {
  [EAttachmentBlockAttributeNames.SOURCE]: null,
  [EAttachmentBlockAttributeNames.ID]: null,
  [EAttachmentBlockAttributeNames.FILE_NAME]: null,
  [EAttachmentBlockAttributeNames.FILE_TYPE]: null,
  [EAttachmentBlockAttributeNames.FILE_SIZE]: null,
};

export const getAttachmentExtensionFileMap = (editor: Editor) => editor.storage.attachmentComponent?.fileMap;

export const getAttachmentExtensionErrorMap = (editor: Editor) => editor.storage.attachmentComponent?.errorMap;

export const getAttachmentBlockId = (id: string) => `editor-attachment-block-${id}`;
