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
import { useEditorState } from "@tiptap/react";
import { useState } from "react";
// plane imports
import { ConvertToWorkItemsIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
// types
import type { IEditorPropsExtended } from "@/types";
// local imports
import { SelectionConversionProjectsListModal } from "./modal";
import { getSelectedListItems, handleSelectionConversion } from "./utils";

type Props = {
  editor: Editor;
} & Pick<IEditorPropsExtended, "selectionConversion">;

export function BubbleMenuSelectionConversion(props: Props) {
  const { editor, selectionConversion } = props;
  // states
  const [isProjectsListModalOpen, setIsProjectsListModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // find all selected list items or mixed content
  const { selectedListItems } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      selectedListItems: getSelectedListItems(editor),
    }),
  });
  const shouldOpenModal = !!selectionConversion?.projectSelectionEnabled;

  const handleWorkItemsCreation = async (projectId?: string) => {
    setIsCreating(true);
    try {
      await handleSelectionConversion({
        editor,
        items: selectedListItems.items,
        projectId,
        selectionConversion,
        totalCount: selectedListItems.totalCount,
      });
    } catch (error) {
      console.error("Error in creating work items from selection", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedListItems.items.length || !selectionConversion?.isConversionEnabled) return null;

  return (
    <div className="relative h-full px-2">
      <SelectionConversionProjectsListModal
        handleClose={() => setIsProjectsListModalOpen(false)}
        handleSelectionConversion={handleWorkItemsCreation}
        isOpen={isProjectsListModalOpen}
        selectionConversion={selectionConversion}
      />
      <Tooltip tooltipContent={`Create work item${selectedListItems.totalCount > 1 ? "s" : ""} from selection`}>
        <button
          type="button"
          className="size-7 grid place-items-center text-tertiary hover:bg-layer-1-hover active:bg-layer-1-active rounded-sm transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (shouldOpenModal) {
              setIsProjectsListModalOpen(true);
            } else {
              handleWorkItemsCreation();
            }
          }}
          aria-label="Convert selection to work items"
          disabled={isCreating}
        >
          <ConvertToWorkItemsIcon className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
}
