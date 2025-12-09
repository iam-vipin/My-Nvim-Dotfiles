import { useCallback, useEffect, useMemo, useState } from "react";
import type { TExtensions } from "@plane/editor";
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
import { callNative } from "@/helpers/flutter-callback.helper";
import type { TFeatureFlagsResponse } from "@/types/feature-flag";

/**
 * @description extensions disabled in various editors
 */

const disabledExtensions: TExtensions[] = ["ai", "slash-commands"];

export const useEditorFlagging = () => {
  const [featureFlags, setFeatureFlags] = useState<TFeatureFlagsResponse | null>(null);

  const getFeatureFlags = useCallback(() => {
    try {
      callNative(CallbackHandlerStrings.getFeatureFlags).then((flags: string) => setFeatureFlags(JSON.parse(flags)));
    } catch (error) {
      console.error("Error fetching feature flags", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get the feature flags from the native code
  useEffect(() => {
    getFeatureFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editorConfig = useMemo(() => {
    const isWorkItemEmbedEnabled = featureFlags?.pageIssueEmbeds ?? false;
    const isCollaborationCursorEnabled = featureFlags?.collaborationCursor ?? false;
    const isNestedPagesEnabled = featureFlags?.nestedPages ?? false;
    const isEditorAttachmentsEnabled = featureFlags?.editorAttachments ?? false;

    const documentFlaggedArr: TExtensions[] = [];
    const documentDisabledArr = [...disabledExtensions];
    const richTextFlaggedArr: TExtensions[] = [];

    if (!isWorkItemEmbedEnabled) {
      documentFlaggedArr.push("issue-embed");
    }
    if (!isCollaborationCursorEnabled) {
      documentDisabledArr.push("collaboration-caret");
    }
    if (!isNestedPagesEnabled) {
      documentFlaggedArr.push("nested-pages");
    }
    if (!isEditorAttachmentsEnabled) {
      documentFlaggedArr.push("attachments");
      richTextFlaggedArr.push("attachments");
    }

    return {
      document: {
        disabled: documentDisabledArr,
        flagged: documentFlaggedArr,
      },
      liteText: {
        disabled: <TExtensions[]>[...disabledExtensions, "enter-key"],
        flagged: [],
      },
      richText: {
        disabled: disabledExtensions,
        flagged: richTextFlaggedArr,
      },
    };
  }, [featureFlags]);

  return editorConfig;
};
