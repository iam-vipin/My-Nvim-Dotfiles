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

import type { NodeViewProps } from "@tiptap/react";
// plane utils
import { cn } from "@plane/utils";
// plane constants
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// version diff support
import { YChangeNodeViewWrapper } from "@/components/editors/version-diff/extensions/ychange-node-view-wrapper";
// components
import { FloatingMathModal } from "../../components/floating-modal";
// hooks
import { useMathNodeView } from "../../hooks/use-math-node-view";
// types
import { EMathAttributeNames } from "../../types";
import type { TMathAttributes } from "../../types";
// local types
import type { BlockMathExtensionType } from "../types";
// local components
import { BlockMathEmptyState } from "./empty-state";
import { BlockMathErrorState } from "./error-state";
import { BlockMathView } from "./view";

export type BlockMathNodeViewProps = Omit<NodeViewProps, "extension"> & {
  extension: BlockMathExtensionType;
  node: NodeViewProps["node"] & {
    attrs: TMathAttributes;
  };
  updateAttributes: (attrs: Partial<TMathAttributes>) => void;
};

export function BlockMathNodeView(props: BlockMathNodeViewProps) {
  const { decorations, getPos, editor } = props;

  // Use shared hook for common math node logic
  const {
    wrapperRef,
    isModalOpen,
    setIsModalOpen,
    nodeAttrs,
    isDisplayEmpty,
    displayLatex,
    validation,
    isExtensionFlagged,
    handleMouseDown,
    handleSave,
    handleClose,
    handlePreview,
  } = useMathNodeView({
    node: props.node,
    getPos,
    editor,
    extension: props.extension,
    nodeType: ADDITIONAL_EXTENSIONS.BLOCK_MATH,
  });

  return (
    <>
      <YChangeNodeViewWrapper
        ref={wrapperRef}
        decorations={decorations}
        className={cn(
          "block-math-component editor-mathematics-component relative",
          editor.isEditable && "cursor-pointer"
        )}
        onMouseDown={handleMouseDown}
        key={nodeAttrs[EMathAttributeNames.ID]}
      >
        {isDisplayEmpty ? (
          <BlockMathEmptyState
            onClick={handleMouseDown}
            selected={isModalOpen}
            editor={editor}
            isEditable={editor.isEditable}
          />
        ) : !validation.isValid ? (
          <BlockMathErrorState
            errorMessage={validation.errorMessage}
            onClick={handleMouseDown}
            isEditable={editor.isEditable}
          />
        ) : (
          <BlockMathView latex={displayLatex} onClick={handleMouseDown} isEditable={editor.isEditable} />
        )}
      </YChangeNodeViewWrapper>

      <FloatingMathModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        referenceElement={wrapperRef.current}
        latex={nodeAttrs[EMathAttributeNames.LATEX] || ""}
        onSave={handleSave}
        onClose={handleClose}
        onPreview={handlePreview}
        nodeType={ADDITIONAL_EXTENSIONS.BLOCK_MATH}
        editor={editor}
        getPos={getPos}
        isFlagged={isExtensionFlagged}
      />
    </>
  );
}
