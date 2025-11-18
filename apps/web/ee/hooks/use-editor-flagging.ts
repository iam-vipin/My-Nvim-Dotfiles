import { useMemo } from "react";
// plane imports
import type { TExtensions } from "@plane/editor";
import { E_INTEGRATION_KEYS } from "@plane/types";
// ce imports
import type { TEditorFlaggingHookReturnType, TEditorFlaggingHookProps } from "@/ce/hooks/use-editor-flagging";
// lib
import { store } from "@/lib/store-context";
// plane web imports
import { EPageStoreType, useFlag, usePageStore } from "@/plane-web/hooks/store";
// hooks
import { useFeatureFlags } from "../hooks/store/use-feature-flags";
import { EWorkspaceFeatures } from "../types/workspace-feature";

/**
 * @description extensions disabled in various editors
 */
export const useEditorFlagging = (props: TEditorFlaggingHookProps): TEditorFlaggingHookReturnType => {
  const { workspaceSlug, storeType } = props;
  // store hooks
  const { getIntegrations } = useFeatureFlags();
  // feature flags
  const isWorkItemEmbedEnabled = useFlag(workspaceSlug, "PAGE_ISSUE_EMBEDS");
  const isEditorAIOpsEnabled =
    useFlag(workspaceSlug, "EDITOR_AI_OPS") &&
    store.workspaceFeatures.isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PI_ENABLED);
  const isCollaborationCursorEnabled = useFlag(workspaceSlug, "COLLABORATION_CURSOR");
  const { isNestedPagesEnabled, isCommentsEnabled } = usePageStore(storeType || EPageStoreType.WORKSPACE);
  const isEditorAttachmentsEnabled = useFlag(workspaceSlug, "EDITOR_ATTACHMENTS");
  const isEditorCopyBlockLinkEnabled = useFlag(workspaceSlug, "EDITOR_COPY_BLOCK_LINK");
  // const isEditorUniqueIdEnabled = useFlag(workspaceSlug, "EDITOR_UNIQUE_ID");
  const isEditorUniqueIdEnabled = true;
  const isEditorMathematicsEnabled = useFlag(workspaceSlug, "EDITOR_MATHEMATICS");
  const isExternalEmbedEnabled = useFlag(workspaceSlug, "EDITOR_EXTERNAL_EMBEDS");
  // check integrations
  const integrations = getIntegrations(workspaceSlug);
  const hasDrawioIntegration = integrations.includes(E_INTEGRATION_KEYS.DRAWIO);

  // disabled and flagged in the document editor
  const document = useMemo(
    () => ({
      disabled: new Set<TExtensions>(),
      flagged: new Set<TExtensions>(),
    }),
    []
  );
  // disabled and flagged in the rich text editor
  const richText = useMemo(
    () => ({
      disabled: new Set<TExtensions>(),
      flagged: new Set<TExtensions>(),
    }),
    []
  );
  // disabled and flagged in the lite text editor
  const liteText = useMemo(
    () => ({
      disabled: new Set<TExtensions>(["external-embed"]),
      flagged: new Set<TExtensions>(),
    }),
    []
  );

  if (!isWorkItemEmbedEnabled) {
    document.flagged.add("issue-embed");
  }
  if (!isEditorAIOpsEnabled) {
    document.disabled.add("ai");
  }
  if (!isCollaborationCursorEnabled) {
    document.disabled.add("collaboration-caret");
  }
  if (storeType && !isNestedPagesEnabled(workspaceSlug)) {
    document.flagged.add("nested-pages");
  }
  if (!isEditorAttachmentsEnabled) {
    document.flagged.add("attachments");
    richText.flagged.add("attachments");
  }
  if (!isEditorMathematicsEnabled) {
    document.flagged.add("mathematics");
    richText.flagged.add("mathematics");
    liteText.flagged.add("mathematics");
  }
  if (storeType && !isCommentsEnabled(workspaceSlug)) {
    document.flagged.add("comments");
  }
  if (!isExternalEmbedEnabled) {
    document.flagged.add("external-embed");
    richText.flagged.add("external-embed");
    liteText.flagged.add("external-embed");
  }

  if (!isEditorCopyBlockLinkEnabled) {
    document.disabled.add("copy-block-link");
    richText.disabled.add("copy-block-link");
  }

  if (!isEditorUniqueIdEnabled) {
    document.disabled.add("unique-id");
    richText.disabled.add("unique-id");
    liteText.disabled.add("unique-id");
  }

  // check for drawio integration
  if (!hasDrawioIntegration) {
    document.flagged.add("drawio");
  }

  return {
    document: {
      disabled: Array.from(document.disabled),
      flagged: Array.from(document.flagged),
    },
    liteText: {
      disabled: Array.from(liteText.disabled),
      flagged: Array.from(liteText.flagged),
    },
    richText: {
      disabled: Array.from(richText.disabled),
      flagged: Array.from(richText.flagged),
    },
  };
};
