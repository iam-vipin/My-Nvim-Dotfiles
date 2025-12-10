import type { HocuspocusProvider } from "@hocuspocus/provider";
import type { Extensions } from "@tiptap/core";
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
import type { IEditorPropsExtended } from "@/plane-editor/types/editor-extended";
// types
import type { TExternalEmbedConfig } from "@/types";
// ce imports
import type { TCoreAdditionalExtensionsProps } from "src/ce/extensions";
// local imports
import { CustomAttachmentExtension } from "../attachments/extension";
import { ExternalEmbedExtension } from "../external-embed/extension";
import { MathematicsExtension } from "../mathematics/extension";
import { SmoothCursorExtension } from "../smooth-cursor";

type Props = TCoreAdditionalExtensionsProps & { extendedEditorProps?: IEditorPropsExtended } & {
  provider: HocuspocusProvider | undefined;
  isEditable?: boolean;
};

export const CoreEditorAdditionalExtensions = (props: Props): Extensions => {
  const { flaggedExtensions, extendedEditorProps, disabledExtensions, fileHandler, isEditable } = props;
  const { extensionOptions } = extendedEditorProps ?? {};
  const { embedHandler, isSmoothCursorEnabled } = extendedEditorProps ?? {};
  const extensions: Extensions = [];
  extensions.push(
    MathematicsExtension({
      isFlagged: !!flaggedExtensions?.includes("mathematics"),
      ...extensionOptions?.[ADDITIONAL_EXTENSIONS.MATHEMATICS],
    })
  );
  const widgetCallback: TExternalEmbedConfig["widgetCallback"] =
    embedHandler?.externalEmbedComponent?.widgetCallback ?? (() => null);
  if (!disabledExtensions?.includes("external-embed")) {
    extensions.push(
      ExternalEmbedExtension({ isFlagged: !!flaggedExtensions?.includes("external-embed"), widgetCallback })
    );
  }
  if (isSmoothCursorEnabled) {
    extensions.push(SmoothCursorExtension);
  }

  if (!disabledExtensions?.includes("attachments")) {
    extensions.push(
      CustomAttachmentExtension({
        fileHandler,
        isFlagged: !!flaggedExtensions?.includes("attachments"),
        isVideoAttachmentsFlagged: !!flaggedExtensions?.includes("video-attachments"),
        isEditable: !!isEditable,
      }).configure({
        onClick: extendedEditorProps?.extensionOptions?.attachmentComponent?.onClick,
      })
    );
  }

  return extensions;
};
