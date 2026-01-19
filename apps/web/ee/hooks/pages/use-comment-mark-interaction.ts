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

import { useCallback, useEffect, useRef } from "react";
import type { EditorRefApi } from "@plane/editor";

type CommentMarkInteractionHook = {
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleThreadClick: (e: React.MouseEvent | React.KeyboardEvent) => void;
};

type UseCommentMarkInteractionParams = {
  commentId: string;
  editorRef?: EditorRefApi | null;
};

export function useCommentMarkInteraction({
  commentId,
  editorRef,
}: UseCommentMarkInteractionParams): CommentMarkInteractionHook {
  const deselectTimeoutRef = useRef<number | null>(null);

  const clearHover = useCallback(() => {
    editorRef?.hoverCommentMarks([]);
  }, [editorRef]);

  const clearSelection = useCallback(() => {
    editorRef?.selectCommentMark(null);
  }, [editorRef]);

  const handleMouseEnter = useCallback(() => {
    editorRef?.hoverCommentMarks([commentId]);
  }, [editorRef, commentId]);

  const handleMouseLeave = useCallback(() => {
    clearHover();
  }, [clearHover]);

  const handleThreadClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "INPUT" ||
        target.closest("input") ||
        target.tagName === "A" ||
        target.closest("a")
      ) {
        return;
      }

      editorRef?.selectCommentMark(commentId);
      editorRef?.scrollToCommentMark(commentId);

      if (deselectTimeoutRef.current) {
        window.clearTimeout(deselectTimeoutRef.current);
      }

      deselectTimeoutRef.current = window.setTimeout(() => {
        editorRef?.selectCommentMark(null);
        deselectTimeoutRef.current = null;
      }, 2000);
    },
    [editorRef, commentId]
  );

  useEffect(
    () => () => {
      if (deselectTimeoutRef.current) {
        window.clearTimeout(deselectTimeoutRef.current);
      }
      clearHover();
      clearSelection();
    },
    [clearHover, clearSelection]
  );

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleThreadClick,
  };
}
