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
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TableMap } from "@tiptap/pm/tables";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
// extensions
import {
  findTable,
  getTableCellWidgetDecorationPos,
  haveTableRelatedChanges,
} from "@/extensions/table/table/utilities/helpers";
// local imports
import { createColumnDragHandle } from "./drag-handle";

type DragHandleInstance = {
  element: HTMLElement;
  destroy: () => void;
};

type TableColumnDragHandlePluginState = {
  decorations?: DecorationSet;
  // track table structure to detect changes
  tableWidth?: number;
  tableNodePos?: number;
  // track drag handle instances for cleanup, keyed by column index
  dragHandles?: Map<number, DragHandleInstance>;
};

const TABLE_COLUMN_DRAG_HANDLE_PLUGIN_KEY = new PluginKey("tableColumnHandlerDecorationPlugin");

export const TableColumnDragHandlePlugin = (editor: Editor): Plugin<TableColumnDragHandlePluginState> =>
  new Plugin<TableColumnDragHandlePluginState>({
    key: TABLE_COLUMN_DRAG_HANDLE_PLUGIN_KEY,
    state: {
      init: () => ({}),
      apply(tr, prev, oldState, newState) {
        const table = findTable(newState.selection);
        if (!haveTableRelatedChanges(editor, table, oldState, newState, tr)) {
          return table !== undefined ? prev : {};
        }

        const tableMap = TableMap.get(table.node);

        // Check if table structure changed (width or position)
        const tableStructureChanged = prev.tableWidth !== tableMap.width || prev.tableNodePos !== table.pos;

        let isStale = tableStructureChanged;

        // Only do position-based stale check if structure hasn't changed
        const mapped = prev.decorations?.map(tr.mapping, tr.doc);
        if (!isStale) {
          for (let col = 0; col < tableMap.width; col++) {
            const pos = getTableCellWidgetDecorationPos(table, tableMap, col);
            if (mapped?.find(pos, pos + 1)?.length !== 1) {
              isStale = true;
              break;
            }
          }
        }

        if (!isStale) {
          return {
            decorations: mapped,
            tableWidth: tableMap.width,
            tableNodePos: table.pos,
            dragHandles: prev.dragHandles,
          };
        }

        // Reuse existing drag handles where possible
        const decorations: Decoration[] = [];
        const dragHandles: Map<number, DragHandleInstance> = new Map();
        const prevDragHandles: Map<number, DragHandleInstance> | undefined = prev.dragHandles || new Map();

        for (let col = 0; col < tableMap.width; col++) {
          const pos = getTableCellWidgetDecorationPos(table, tableMap, col);

          // Reuse existing drag handle if it exists for this column
          let dragHandle: DragHandleInstance | undefined = prevDragHandles.get(col);
          if (!dragHandle) {
            // Create new drag handle only if one doesn't exist for this column
            dragHandle = createColumnDragHandle({
              editor,
              col,
            });
          }

          dragHandles.set(col, dragHandle);
          const handleElement = dragHandle.element;
          decorations.push(
            Decoration.widget(pos, () => handleElement, {
              key: `col-drag-handle-${col}`,
            })
          );
        }

        // Clean up drag handles that are no longer needed (columns that don't exist anymore)
        prevDragHandles.forEach((handle: DragHandleInstance, col: number) => {
          if (!dragHandles.has(col)) {
            try {
              handle.destroy();
            } catch (error) {
              console.error("Error destroying drag handle:", error);
            }
          }
        });

        return {
          decorations: DecorationSet.create(newState.doc, decorations),
          tableWidth: tableMap.width,
          tableNodePos: table.pos,
          dragHandles,
        };
      },
    },
    props: {
      decorations(state) {
        return (TABLE_COLUMN_DRAG_HANDLE_PLUGIN_KEY.getState(state) as TableColumnDragHandlePluginState | undefined)
          ?.decorations;
      },
    },
    destroy() {
      // Clean up all drag handles when plugin is destroyed
      const state =
        editor.state &&
        (TABLE_COLUMN_DRAG_HANDLE_PLUGIN_KEY.getState(editor.state) as TableColumnDragHandlePluginState | undefined);
      state?.dragHandles?.forEach((handle: DragHandleInstance) => {
        try {
          handle.destroy();
        } catch (error) {
          console.error("Error destroying drag handle:", error);
        }
      });
    },
  });
