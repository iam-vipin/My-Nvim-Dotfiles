import type { Dispatch, SetStateAction } from "react";
import React, { useState } from "react";
import { observer } from "mobx-react";
import { Pencil, Trash2 } from "lucide-react";
// plane imports
import type { TInitiativeLabel } from "@plane/types";
// components
import type { TInitiativeLabelOperationsCallbacks } from "./create-update-initiative-label-inline";
import { CreateUpdateInitiativeLabelInline } from "./create-update-initiative-label-inline";
import type { IInitiativeCustomMenuItem } from "./initiative-label-block";
import { InitiativeLabelBlock } from "./initiative-label-block";
import { InitiativeLabelDndHOC } from "./initiative-label-drag-n-drop-HOC";

type Props = {
  label: TInitiativeLabel;
  handleLabelDelete: (label: TInitiativeLabel) => void;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
  isParentDragging: boolean;
  isChild: boolean;
  isLastChild: boolean;
  onDrop: (draggingLabelId: string, droppedLabelId: string | undefined, dropAtEndOfList: boolean) => void;
  labelOperationsCallbacks: TInitiativeLabelOperationsCallbacks;
};

export const InitiativeLabelItem: React.FC<Props> = observer((props) => {
  const {
    label,
    handleLabelDelete,
    setIsUpdating,
    isParentDragging,
    isLastChild,
    onDrop,
    labelOperationsCallbacks,
  } = props;

  // states
  const [isEditLabelForm, setEditLabelForm] = useState(false);

  const customMenuItems: IInitiativeCustomMenuItem[] = [
    {
      CustomIcon: Pencil,
      onClick: () => {
        setEditLabelForm(true);
        setIsUpdating(true);
      },
      isVisible: true,
      text: "Edit label",
      key: "edit_label",
    },
    {
      CustomIcon: Trash2,
      onClick: () => {
        handleLabelDelete(label);
      },
      isVisible: true,
      text: "Delete label",
      key: "delete_label",
    },
  ];

  return (
    <InitiativeLabelDndHOC label={label} isLastChild={isLastChild} onDrop={onDrop}>
      {(isDragging: boolean, dragHandleRef: React.RefObject<HTMLButtonElement>) => (
        <div
          className={`rounded ${isDragging ? "border-[2px] border-custom-primary-100" : "border-[1.5px] border-transparent"}`}
        >
          <div
            className={`rounded text-custom-text-100 ${
              !isDragging ? "border-[0.5px] border-custom-border-200" : ""
            } ${isDragging ? "bg-custom-background-80" : "bg-custom-background-100"} ${
              isParentDragging ? "opacity-60" : ""
            }`}
          >
            <div className="py-2 px-3">
              {isEditLabelForm ? (
                <CreateUpdateInitiativeLabelInline
                  labelForm={isEditLabelForm}
                  setLabelForm={setEditLabelForm}
                  isUpdating
                  labelToUpdate={label}
                  labelOperationsCallbacks={labelOperationsCallbacks}
                  onClose={() => {
                    setEditLabelForm(false);
                    setIsUpdating(false);
                  }}
                />
              ) : (
                <InitiativeLabelBlock
                  label={label}
                  isDragging={isDragging}
                  customMenuItems={customMenuItems}
                  handleLabelDelete={handleLabelDelete}
                  dragHandleRef={dragHandleRef}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </InitiativeLabelDndHOC>
  );
});
