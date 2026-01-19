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
import { ReactRenderer } from "@tiptap/react";
// extensions
import {
  findTable,
  getTableCellWidgetDecorationPos,
  haveTableRelatedChanges,
} from "@/extensions/table/table/utilities/helpers";
// local imports
import type { RowDragHandleProps } from "./drag-handle";
import { RowDragHandle } from "./drag-handle";

type TableRowDragHandlePluginState = {
  decorations?: DecorationSet;
  // track table structure to detect changes
  tableHeight?: number;
  tableNodePos?: number;
  // track renderers for cleanup
  renderers?: ReactRenderer[];
};

const TABLE_ROW_DRAG_HANDLE_PLUGIN_KEY = new PluginKey("tableRowDragHandlePlugin");

export const TableRowDragHandlePlugin = (editor: Editor): Plugin<TableRowDragHandlePluginState> =>
  new Plugin<TableRowDragHandlePluginState>({
    key: TABLE_ROW_DRAG_HANDLE_PLUGIN_KEY,
    state: {
      init: () => ({}),
      apply(tr, prev, oldState, newState) {
        const table = findTable(newState.selection);
        if (!haveTableRelatedChanges(editor, table, oldState, newState, tr)) {
          return table !== undefined ? prev : {};
        }

        const tableMap = TableMap.get(table.node);

        // Check if table structure changed (height or position)
        const tableStructureChanged = prev.tableHeight !== tableMap.height || prev.tableNodePos !== table.pos;

        let isStale = tableStructureChanged;

        // Only do position-based stale check if structure hasn't changed
        if (!isStale) {
          const mapped = prev.decorations?.map(tr.mapping, tr.doc);
          for (let row = 0; row < tableMap.height; row++) {
            const pos = getTableCellWidgetDecorationPos(table, tableMap, row * tableMap.width);
            if (mapped?.find(pos, pos + 1)?.length !== 1) {
              isStale = true;
              break;
            }
          }
        }

        if (!isStale) {
          const mapped = prev.decorations?.map(tr.mapping, tr.doc);
          return {
            decorations: mapped,
            tableHeight: tableMap.height,
            tableNodePos: table.pos,
            renderers: prev.renderers,
          };
        }

        // Clean up old renderers before creating new ones
        prev.renderers?.forEach((renderer) => {
          try {
            renderer.destroy();
          } catch (error) {
            console.error("Error destroying renderer:", error);
          }
        });

        // recreate all decorations
        const decorations: Decoration[] = [];
        const renderers: ReactRenderer[] = [];

        for (let row = 0; row < tableMap.height; row++) {
          const pos = getTableCellWidgetDecorationPos(table, tableMap, row * tableMap.width);

          const dragHandleComponent = new ReactRenderer(RowDragHandle, {
            props: {
              editor,
              row,
            } satisfies RowDragHandleProps,
            editor,
          });

          renderers.push(dragHandleComponent);
          decorations.push(Decoration.widget(pos, () => dragHandleComponent.element));
        }

        return {
          decorations: DecorationSet.create(newState.doc, decorations),
          tableHeight: tableMap.height,
          tableNodePos: table.pos,
          renderers,
        };
      },
    },
    props: {
      decorations(state) {
        return (TABLE_ROW_DRAG_HANDLE_PLUGIN_KEY.getState(state) as TableRowDragHandlePluginState | undefined)
          ?.decorations;
      },
    },
    destroy() {
      // Clean up all renderers when plugin is destroyed
      const state =
        editor.state &&
        (TABLE_ROW_DRAG_HANDLE_PLUGIN_KEY.getState(editor.state) as TableRowDragHandlePluginState | undefined);
      state?.renderers?.forEach((renderer: ReactRenderer) => {
        try {
          renderer.destroy();
        } catch (error) {
          console.error("Error destroying renderer:", error);
        }
      });
    },
  });
