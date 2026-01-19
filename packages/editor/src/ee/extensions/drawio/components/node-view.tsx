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
import { NodeViewWrapper } from "@tiptap/react";
import { memo } from "react";
// types
import { EDrawioAttributeNames } from "../types";
import type { TDrawioBlockAttributes, TDrawioExtension } from "../types";
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
  const { selected, node } = props;
  const hasImage = !!node.attrs[EDrawioAttributeNames.IMAGE_SRC];

  return (
    <NodeViewWrapper className="editor-drawio-component relative" contentEditable={false}>
      <div className="relative" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <DrawioBlock {...props} />
        {selected && hasImage && (
          <div className="absolute inset-0 size-full bg-accent-primary/30 pointer-events-none rounded-md" />
        )}
      </div>
    </NodeViewWrapper>
  );
});
