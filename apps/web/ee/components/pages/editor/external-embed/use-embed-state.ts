import { useState, useCallback } from "react";
import type { ExternalEmbedNodeViewProps } from "@plane/editor";
import { EExternalEmbedAttributeNames, EExternalEmbedEntityType } from "@plane/editor";

// React State Family - Handles component state and interactions
export const useEmbedState = (externalEmbedNodeView: ExternalEmbedNodeViewProps) => {
  const embedAttrs = externalEmbedNodeView.node.attrs;

  const [directEmbedState, setDirectEmbedState] = useState({
    hasTriedEmbedding: embedAttrs[EExternalEmbedAttributeNames.HAS_TRIED_EMBEDDING],
    isEmbeddable: !embedAttrs[EExternalEmbedAttributeNames.HAS_EMBED_FAILED],
  });

  const {
    src,
    [EExternalEmbedAttributeNames.IS_RICH_CARD]: isRichCardView,
    [EExternalEmbedAttributeNames.HAS_EMBED_FAILED]: isEmbedFailed,
  } = embedAttrs;

  const handleDirectEmbedLoaded = useCallback(() => {
    setDirectEmbedState({ hasTriedEmbedding: true, isEmbeddable: true });
    externalEmbedNodeView.updateAttributes({
      [EExternalEmbedAttributeNames.HAS_EMBED_FAILED]: false,
      [EExternalEmbedAttributeNames.HAS_TRIED_EMBEDDING]: true,
    });
  }, [externalEmbedNodeView]);

  const handleDirectEmbedError = useCallback(() => {
    setDirectEmbedState({ hasTriedEmbedding: true, isEmbeddable: false });
    externalEmbedNodeView.updateAttributes({
      [EExternalEmbedAttributeNames.HAS_EMBED_FAILED]: true,
      [EExternalEmbedAttributeNames.HAS_TRIED_EMBEDDING]: true,
      [EExternalEmbedAttributeNames.IS_RICH_CARD]: true,
      [EExternalEmbedAttributeNames.ENTITY_TYPE]: EExternalEmbedEntityType.RICH_CARD,
    });
  }, [externalEmbedNodeView]);

  return {
    directEmbedState,
    src: src,
    isRichCardView: isRichCardView,
    isEmbedFailed: isEmbedFailed,
    handleDirectEmbedLoaded,
    handleDirectEmbedError,
  };
};
