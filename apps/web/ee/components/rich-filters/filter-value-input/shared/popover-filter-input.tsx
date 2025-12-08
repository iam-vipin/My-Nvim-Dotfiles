import type { ReactNode } from "react";
import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { CornerDownLeft } from "lucide-react";
// plane imports
import { Popover } from "@plane/propel/popover";
import { Button } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { COMMON_FILTER_ITEM_BORDER_CLASSNAME, EMPTY_FILTER_PLACEHOLDER_TEXT } from "@/components/rich-filters/shared";

// Common class names
const FILTER_BUTTON_CLASSNAMES =
  "h-full w-full px-2 text-sm font-normal transition-all duration-300 ease-in-out text-left hover:bg-custom-background-80";
const FILTER_PANEL_CLASSNAMES =
  "w-[306px] p-2 bg-custom-background-100 border border-custom-border-200 rounded-lg shadow-lg";
const FILTER_HELPER_TEXT_CLASSNAMES = "flex items-center gap-1 text-[10px] text-custom-text-300";
const FILTER_ACTIONS_CLASSNAMES = "flex items-center gap-2";
const FILTER_ACTIONS_BUTTON_CLASSNAMES = "py-1";
export const FILTER_VALIDATION_MESSAGE_CLASSNAMES = "text-custom-text-400 text-[9px] px-0.5";

type TPopoverFilterInputProps = {
  buttonClassName?: string;
  children: ReactNode;
  className?: string;
  displayValue: string | undefined;
  helperText?: ReactNode;
  isApplyDisabled?: boolean;
  isDisabled?: boolean;
  isEmpty: boolean;
  isOpen: boolean;
  onApply: () => void;
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
  panelClassName?: string;
  placeholder?: string;
};

export const PopoverFilterInput = observer(function PopoverFilterInput(props: TPopoverFilterInputProps) {
  const {
    buttonClassName,
    children,
    className,
    displayValue,
    helperText,
    isApplyDisabled,
    isDisabled,
    isEmpty,
    isOpen,
    onApply,
    onCancel,
    onOpenChange,
    panelClassName,
    placeholder = EMPTY_FILTER_PLACEHOLDER_TEXT,
  } = props;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <Popover.Button>
        <button
          className={cn(
            FILTER_BUTTON_CLASSNAMES,
            isOpen && "bg-custom-background-80",
            !isDisabled && COMMON_FILTER_ITEM_BORDER_CLASSNAME,
            isDisabled && "hover:bg-custom-background-100",
            isEmpty && "text-custom-text-400",
            buttonClassName
          )}
          disabled={isDisabled}
        >
          {displayValue || placeholder}
        </button>
      </Popover.Button>
      <Popover.Panel
        className={cn(FILTER_PANEL_CLASSNAMES, panelClassName)}
        positionerClassName="z-[15]"
        placement="bottom-start"
      >
        <div className={cn("space-y-2.5", className)}>
          {children}
          <div className="flex items-center justify-between">
            <span className={FILTER_HELPER_TEXT_CLASSNAMES}>
              {helperText ? (
                helperText
              ) : (
                <>
                  Type and press
                  <span className="flex items-center gap-1 bg-custom-background-90 px-1.5 rounded-md">
                    Enter
                    <CornerDownLeft className="size-2.5" />
                  </span>
                </>
              )}
            </span>
            <div className={FILTER_ACTIONS_CLASSNAMES}>
              <Button
                variant="neutral-primary"
                size="sm"
                onClick={onCancel}
                className={FILTER_ACTIONS_BUTTON_CLASSNAMES}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onApply}
                className={FILTER_ACTIONS_BUTTON_CLASSNAMES}
                disabled={isApplyDisabled}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  );
});

// Hook for common input behavior
export const useFilterInput = <T extends string | number>(
  initialValue: T | null | undefined,
  isEmpty: boolean,
  isDisabled: boolean
) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stringValue = initialValue !== null && initialValue !== undefined ? initialValue.toString() : "";
    setInputValue(stringValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEmpty && !isDisabled) {
      setIsOpen(true);
    }
  }, [isEmpty, isDisabled]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCancel = () => {
    const stringValue = initialValue !== null && initialValue !== undefined ? initialValue.toString() : "";
    setInputValue(stringValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return "apply";
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return "cancel";
    }
    return null;
  };

  return {
    isOpen,
    setIsOpen,
    inputValue,
    setInputValue,
    inputRef,
    handleCancel,
    handleKeyDown,
  };
};
