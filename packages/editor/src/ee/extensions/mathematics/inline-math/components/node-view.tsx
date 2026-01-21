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
// components
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// version diff support
import { YChangeNodeViewWrapper } from "@/components/editors/version-diff/extensions/ychange-node-view-wrapper";
import { FloatingMathModal } from "../../components/floating-modal";
// hooks
import { useMathNodeView } from "../../hooks/use-math-node-view";
// types
import { EMathAttributeNames } from "../../types";
import type { TMathAttributes } from "../../types";
// local types
import type { InlineMathExtensionType } from "../types";
// local components
import { InlineMathEmptyState } from "./empty-state";
import { InlineMathErrorState } from "./error-state";
import { InlineMathView } from "./view";

export type InlineMathNodeViewProps = Omit<NodeViewProps, "extension"> & {
  extension: InlineMathExtensionType;
  node: NodeViewProps["node"] & {
    attrs: TMathAttributes;
  };
  updateAttributes: (attrs: Partial<TMathAttributes>) => void;
};

export function InlineMathNodeView(props: InlineMathNodeViewProps) {
  const { getPos, editor, decorations } = props;

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
    nodeType: ADDITIONAL_EXTENSIONS.INLINE_MATH,
  });

  return (
    <>
      <YChangeNodeViewWrapper
        as="span"
        decorations={decorations}
        ref={wrapperRef}
        className={editor.isEditable ? "cursor-pointer" : ""}
        onMouseDown={handleMouseDown}
        key={nodeAttrs[EMathAttributeNames.ID]}
      >
        {isDisplayEmpty ? (
          <InlineMathEmptyState onClick={handleMouseDown} isEditable={editor.isEditable} />
        ) : !validation.isValid ? (
          <InlineMathErrorState
            errorMessage={validation.errorMessage}
            onClick={handleMouseDown}
            isEditable={editor.isEditable}
          />
        ) : (
          <InlineMathView latex={displayLatex} onClick={handleMouseDown} isEditable={editor.isEditable} />
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
        nodeType={ADDITIONAL_EXTENSIONS.INLINE_MATH}
        editor={editor}
        getPos={getPos}
        isFlagged={isExtensionFlagged}
      />
    </>
  );
}
