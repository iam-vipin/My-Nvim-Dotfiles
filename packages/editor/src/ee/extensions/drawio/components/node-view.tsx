/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { NodeViewProps } from "@tiptap/core";
import { memo, useEffect, useRef } from "react";
// version diff support
import { YChangeNodeViewWrapper } from "@/components/editors/version-diff/extensions/ychange-node-view-wrapper";
// types
import type { TDrawioBlockAttributes, TDrawioExtension } from "../types";
import { EDrawioAttributeNames, EDrawioStatus } from "../types";
// components
import { DrawioBlock } from "./block";

export type DrawioNodeViewProps = Omit<NodeViewProps, "extension"> & {
  extension: TDrawioExtension;
  node: NodeViewProps["node"] & {
    attrs: TDrawioBlockAttributes;
  };
  updateAttributes: (attrs: Partial<TDrawioBlockAttributes>) => void;
};

export const DrawioNodeView = memo(function DrawioNodeView(props: DrawioNodeViewProps) {
  const { decorations, selected, node, updateAttributes, extension } = props;
  const hasImage = !!node.attrs[EDrawioAttributeNames.IMAGE_SRC];
  const imageSrc = node.attrs[EDrawioAttributeNames.IMAGE_SRC];
  const xmlSrc = node.attrs[EDrawioAttributeNames.XML_SRC];
  const status = node.attrs[EDrawioAttributeNames.STATUS];

  // refs
  const hasRetriedOnMount = useRef(false);
  const isDuplicatingRef = useRef(false);

  // Handle drawio duplication when status is duplicating
  useEffect(() => {
    const handleDuplication = async () => {
      if (status !== EDrawioStatus.DUPLICATING || !extension.options.duplicateDiagram) {
        return;
      }

      // Need at least one source to duplicate
      if (!imageSrc && !xmlSrc) {
        return;
      }

      // Prevent duplicate calls - check if already duplicating this asset
      if (isDuplicatingRef.current) {
        return;
      }

      isDuplicatingRef.current = true;
      try {
        // Duplicate both image and XML sources if they exist
        // Using explicit structure instead of arrays since we know exactly what we have
        const duplicatedFiles: {
          newImageSrc: string | null;
          newXmlSrc: string | null;
        } = {
          newImageSrc: null,
          newXmlSrc: null,
        };

        // Duplicate image if it exists and is not an external URL
        if (imageSrc && !imageSrc.startsWith("http")) {
          duplicatedFiles.newImageSrc = await extension.options.duplicateDiagram(imageSrc);
        } else if (imageSrc && imageSrc.startsWith("http")) {
          duplicatedFiles.newImageSrc = imageSrc;
        }

        // Duplicate XML if it exists and is not an external URL
        if (xmlSrc && !xmlSrc.startsWith("http")) {
          duplicatedFiles.newXmlSrc = await extension.options.duplicateDiagram(xmlSrc);
        } else if (xmlSrc && xmlSrc.startsWith("http")) {
          duplicatedFiles.newXmlSrc = xmlSrc;
        }

        // Validate that at least one source exists (either duplicated or HTTP)
        if (!duplicatedFiles.newImageSrc && !duplicatedFiles.newXmlSrc) {
          throw new Error("Both image and XML duplication failed or returned invalid IDs");
        }

        // Build update object with new sources
        const updateAttrs: Partial<TDrawioBlockAttributes> = {
          [EDrawioAttributeNames.STATUS]: EDrawioStatus.UPLOADED,
        };

        if (duplicatedFiles.newImageSrc) {
          updateAttrs[EDrawioAttributeNames.IMAGE_SRC] = duplicatedFiles.newImageSrc;
        }

        if (duplicatedFiles.newXmlSrc) {
          updateAttrs[EDrawioAttributeNames.XML_SRC] = duplicatedFiles.newXmlSrc;
        }

        // Update node with new sources and success status
        updateAttributes(updateAttrs);
      } catch {
        // Update status to failed
        updateAttributes({ [EDrawioAttributeNames.STATUS]: EDrawioStatus.DUPLICATION_FAILED });
      } finally {
        isDuplicatingRef.current = false;
      }
    };

    handleDuplication();
  }, [status, imageSrc, xmlSrc, extension.options.duplicateDiagram, updateAttributes]);

  useEffect(() => {
    if (status === EDrawioStatus.DUPLICATION_FAILED && !hasRetriedOnMount.current && (imageSrc || xmlSrc)) {
      hasRetriedOnMount.current = true;
      updateAttributes({ [EDrawioAttributeNames.STATUS]: EDrawioStatus.DUPLICATING });
    }
  }, [status, imageSrc, xmlSrc, updateAttributes]);

  useEffect(() => {
    if (status === EDrawioStatus.UPLOADED) {
      hasRetriedOnMount.current = false;
    }
  }, [status]);

  return (
    <YChangeNodeViewWrapper
      decorations={decorations}
      className="editor-drawio-component relative"
      contentEditable={false}
    >
      <div className="relative" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <DrawioBlock {...props} />
        {selected && hasImage && (
          <div className="absolute inset-0 size-full bg-accent-primary/30 pointer-events-none rounded-md" />
        )}
      </div>
    </YChangeNodeViewWrapper>
  );
});
