import type { MutableRefObject } from "react";
import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

// plane imports
import { useOutsideClickDetector } from "@plane/hooks";
import { CloseIcon } from "@plane/propel/icons";
import type { TInitiativeLabel } from "@plane/types";
import { CustomMenu, DragHandle } from "@plane/ui";
import { cn } from "@plane/utils";

// local imports
import { InitiativeLabelName } from "./initiative-label-name";

export interface IInitiativeCustomMenuItem {
  CustomIcon: LucideIcon;
  onClick: (label: TInitiativeLabel) => void;
  isVisible: boolean;
  text: string;
  key: string;
}

interface IInitiativeLabelBlock {
  label: TInitiativeLabel;
  isDragging: boolean;
  customMenuItems: IInitiativeCustomMenuItem[];
  handleLabelDelete: (label: TInitiativeLabel) => void;
  dragHandleRef: MutableRefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  draggable?: boolean;
}

export function InitiativeLabelBlock(props: IInitiativeLabelBlock) {
  const {
    label,
    isDragging,
    customMenuItems,
    handleLabelDelete,
    dragHandleRef,
    disabled = false,
    draggable = true,
  } = props;
  const [isMenuActive, setIsMenuActive] = useState(true);
  const actionSectionRef = useRef<HTMLDivElement | null>(null);

  useOutsideClickDetector(actionSectionRef, () => setIsMenuActive(false));

  return (
    <div className="group flex items-center  relative">
      <div className="flex items-center">
        {!disabled && draggable && (
          <DragHandle
            className={cn("opacity-0 group-hover:opacity-100", {
              "opacity-100": isDragging,
            })}
            ref={dragHandleRef}
          />
        )}
        <InitiativeLabelName color={label.color} name={label.name} />
      </div>

      {!disabled && (
        <div
          ref={actionSectionRef}
          className={`absolute right-2.5 flex items-center gap-2  ${
            isMenuActive ? "opacity-100" : "opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
          }`}
        >
          <CustomMenu ellipsis menuButtonOnClick={() => setIsMenuActive(!isMenuActive)} useCaptureForOutsideClick>
            {customMenuItems.map(
              ({ isVisible, onClick, CustomIcon, text, key }) =>
                isVisible && (
                  <CustomMenu.MenuItem key={key} onClick={() => onClick(label)}>
                    <span className="flex items-center justify-start gap-2">
                      <CustomIcon className="size-4" />
                      <span>{text}</span>
                    </span>
                  </CustomMenu.MenuItem>
                )
            )}
          </CustomMenu>
          <div className="py-0.5">
            <button
              className="flex size-5 items-center justify-center rounded hover:bg-custom-background-80"
              onClick={() => {
                handleLabelDelete(label);
              }}
            >
              <CloseIcon className="size-3.5 flex-shrink-0 text-custom-sidebar-text-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
