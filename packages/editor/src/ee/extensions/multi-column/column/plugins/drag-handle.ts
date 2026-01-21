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

import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ReactRenderer } from "@tiptap/react";
// constants
import { ADDITIONAL_EXTENSIONS } from "@plane/utils";
// components
import type { ColumnDragHandleProps } from "../components/drag-handle";
import { ColumnDragHandle } from "../components/drag-handle";

type ColumnDragHandlePluginState = {
  decorations: DecorationSet;
  columnCount: number;
  columnPositions: number[];
  renderers: ReactRenderer[];
};

export const COLUMN_DRAG_HANDLE_PLUGIN_KEY = new PluginKey<ColumnDragHandlePluginState>("columnDragHandlePlugin");

/**
 * Collect all column positions in the document
 */
function collectColumnPositions(doc: ProseMirrorNode): number[] {
  const positions: number[] = [];
  const columnType = ADDITIONAL_EXTENSIONS.COLUMN as string;

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (node.type.name === columnType) {
      positions.push(pos);
    }
  });

  return positions;
}

/**
 * Check if plugin state is stale and needs to be refreshed
 */
function isPluginStateStale(
  prev: ColumnDragHandlePluginState,
  currentPositions: number[],
  docChanged: boolean,
  mappedDecorations?: DecorationSet
): boolean {
  // Column structure changed
  if (prev.columnCount !== currentPositions.length) return true;
  if (!currentPositions.every((pos, idx) => prev.columnPositions[idx] === pos)) return true;

  // If doc changed and decorations don't match expected positions
  if (docChanged && mappedDecorations) {
    return !currentPositions.every((pos) => mappedDecorations.find(pos + 1, pos + 2)?.length === 1);
  }

  return false;
}

/**
 * Cleanup renderers safely
 */
function cleanupRenderers(renderers: ReactRenderer[]): void {
  renderers.forEach((renderer) => {
    try {
      renderer.destroy();
    } catch (error) {
      console.error("[ColumnDragHandle] Error destroying renderer:", error);
    }
  });
}

/**
 * Create decorations for all columns
 */
function createColumnDecorations(
  positions: number[],
  editor: Editor
): {
  decorations: Decoration[];
  renderers: ReactRenderer[];
} {
  const decorations: Decoration[] = [];
  const renderers: ReactRenderer[] = [];

  positions.forEach((pos) => {
    const dragHandleComponent = new ReactRenderer(ColumnDragHandle, {
      props: { columnPos: pos, editor } satisfies ColumnDragHandleProps,
      editor,
    });

    renderers.push(dragHandleComponent);
    decorations.push(Decoration.widget(pos + 1, () => dragHandleComponent.element, { side: -1 }));
  });

  return { decorations, renderers };
}

export const ColumnDragHandlePlugin = (editor: Editor, isFlagged: boolean): Plugin<ColumnDragHandlePluginState> =>
  new Plugin<ColumnDragHandlePluginState>({
    key: COLUMN_DRAG_HANDLE_PLUGIN_KEY,

    state: {
      init: () => ({
        decorations: DecorationSet.empty,
        columnCount: 0,
        columnPositions: [],
        renderers: [],
      }),

      apply(tr, prev, _oldState, newState) {
        const currentPositions = collectColumnPositions(newState.doc);

        // No columns exist - cleanup and return empty state
        if (currentPositions.length === 0 || isFlagged) {
          cleanupRenderers(prev.renderers);
          return {
            decorations: DecorationSet.empty,
            columnCount: 0,
            columnPositions: [],
            renderers: [],
          };
        }

        // Check if state is stale
        const mappedDecorations = tr.docChanged ? prev.decorations.map(tr.mapping, tr.doc) : prev.decorations;
        const isStale = isPluginStateStale(prev, currentPositions, tr.docChanged, mappedDecorations);

        // Return mapped state if not stale
        if (!isStale) {
          return {
            decorations: mappedDecorations,
            columnCount: prev.columnCount,
            columnPositions: prev.columnPositions,
            renderers: prev.renderers,
          };
        }

        // Recreate all decorations
        cleanupRenderers(prev.renderers);
        const { decorations, renderers } = createColumnDecorations(currentPositions, editor);

        return {
          decorations: DecorationSet.create(newState.doc, decorations),
          columnCount: currentPositions.length,
          columnPositions: currentPositions,
          renderers,
        };
      },
    },

    props: {
      decorations(state) {
        return COLUMN_DRAG_HANDLE_PLUGIN_KEY.getState(state)?.decorations;
      },
    },

    destroy() {
      const state = editor.state && COLUMN_DRAG_HANDLE_PLUGIN_KEY.getState(editor.state);
      if (state?.renderers) {
        cleanupRenderers(state.renderers);
      }
    },
  });
