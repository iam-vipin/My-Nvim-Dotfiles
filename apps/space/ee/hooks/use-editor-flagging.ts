// plane imports
import useSWR from "swr";
import type { E_FEATURE_FLAGS } from "@plane/constants";
import type { TExtensions } from "@plane/editor";
import type { TEditorFlaggingHookReturnType } from "ce/hooks/use-editor-flagging";
import { useFeatureFlags } from "./store";

const flagsToFetch: ReadonlyArray<keyof typeof E_FEATURE_FLAGS> = [
  "EDITOR_MATHEMATICS",
  "EDITOR_EXTERNAL_EMBEDS",
  "EDITOR_VIDEO_ATTACHMENTS",
] as const;

/**
 * @description extensions disabled in various editors
 */
export const useEditorFlagging = (anchor: string): TEditorFlaggingHookReturnType => {
  const { fetchFeatureFlags, getFeatureFlag } = useFeatureFlags();

  useSWR(
    anchor ? `EDITOR_FEATURE_FLAGS_${anchor}` : null,
    anchor ? () => fetchFeatureFlags(anchor, flagsToFetch) : null
  );

  const isEditorAttachmentsEnabled = getFeatureFlag(anchor, "EDITOR_ATTACHMENTS", false);
  const isVideoAttachmentsEnabled = getFeatureFlag(anchor, "EDITOR_VIDEO_ATTACHMENTS", false);
  const isMathematicsEnabled = getFeatureFlag(anchor, "EDITOR_MATHEMATICS", false);
  const isExternalEmbedEnabled = getFeatureFlag(anchor, "EDITOR_EXTERNAL_EMBEDS", false);

  const documentDisabled: TExtensions[] = [];
  const documentFlagged: TExtensions[] = [];
  // disabled and flagged in the rich text editor
  const richTextDisabled: TExtensions[] = [];
  const richTextFlagged: TExtensions[] = [];
  // disabled and flagged in the lite text editor
  const liteTextDisabled: TExtensions[] = [];
  const liteTextFlagged: TExtensions[] = [];

  liteTextDisabled.push("external-embed");

  if (!isMathematicsEnabled) {
    documentFlagged.push("mathematics");
    richTextFlagged.push("mathematics");
    liteTextFlagged.push("mathematics");
  }

  if (!isExternalEmbedEnabled) {
    documentFlagged.push("external-embed");
    richTextFlagged.push("external-embed");
    liteTextFlagged.push("external-embed");
  }

  if (!isEditorAttachmentsEnabled) {
    documentFlagged.push("attachments");
    richTextFlagged.push("attachments");
    liteTextFlagged.push("attachments");
  }
  if (!isVideoAttachmentsEnabled) {
    documentFlagged.push("video-attachments");
    richTextFlagged.push("video-attachments");
    liteTextFlagged.push("video-attachments");
  }

  return {
    document: {
      disabled: documentDisabled,
      flagged: documentFlagged,
    },
    liteText: {
      disabled: liteTextDisabled,
      flagged: liteTextFlagged,
    },
    richText: {
      disabled: richTextDisabled,
      flagged: richTextFlagged,
    },
  };
};
