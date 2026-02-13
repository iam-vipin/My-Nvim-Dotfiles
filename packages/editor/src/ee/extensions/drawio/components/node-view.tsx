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
  const { decorations, node, updateAttributes, extension } = props;
  const xmlSrc = node.attrs[EDrawioAttributeNames.XML_SRC];
  const status = node.attrs[EDrawioAttributeNames.STATUS];

  // refs
  const hasRetriedOnMount = useRef(false);
  const isDuplicatingRef = useRef(false);

  // Handle drawio duplication when status is duplicating
  useEffect(() => {
    const handleDuplication = async () => {
      if (status !== EDrawioStatus.DUPLICATING || !extension.options.duplicateDiagram) return;
      if (!xmlSrc) return;
      if (isDuplicatingRef.current) return;

      isDuplicatingRef.current = true;
      try {
        let newXmlSrc: string | null = null;

        if (xmlSrc.startsWith("http")) {
          newXmlSrc = xmlSrc;
        } else {
          newXmlSrc = await extension.options.duplicateDiagram(xmlSrc);
        }

        if (!newXmlSrc) {
          throw new Error("XML duplication failed");
        }

        updateAttributes({
          [EDrawioAttributeNames.STATUS]: EDrawioStatus.UPLOADED,
          [EDrawioAttributeNames.XML_SRC]: newXmlSrc,
        });
      } catch {
        updateAttributes({ [EDrawioAttributeNames.STATUS]: EDrawioStatus.DUPLICATION_FAILED });
      } finally {
        isDuplicatingRef.current = false;
      }
    };

    handleDuplication();
  }, [status, xmlSrc, extension.options.duplicateDiagram, updateAttributes]);

  useEffect(() => {
    if (status === EDrawioStatus.DUPLICATION_FAILED && !hasRetriedOnMount.current && xmlSrc) {
      hasRetriedOnMount.current = true;
      updateAttributes({ [EDrawioAttributeNames.STATUS]: EDrawioStatus.DUPLICATING });
    }
  }, [status, xmlSrc, updateAttributes]);

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
      </div>
    </YChangeNodeViewWrapper>
  );
});
