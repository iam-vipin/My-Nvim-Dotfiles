import React from "react";
import { observer } from "mobx-react";
// plane imports
import type { TFilterProperty, TFilterConditionNodeForDisplay } from "@plane/types";
import { Input } from "@plane/ui";
// local imports
import { EMPTY_FILTER_PLACEHOLDER_TEXT } from "@/components/rich-filters/shared";
import {
  FILTER_VALIDATION_MESSAGE_CLASSNAMES,
  PopoverFilterInput,
  useFilterInput,
} from "../shared/popover-filter-input";

type TTextFilterFieldConfig = {
  type: string;
  minLength?: number;
  maxLength?: number;
};

type TTextFilterValueInputProps<P extends TFilterProperty> = {
  config: TTextFilterFieldConfig;
  condition: TFilterConditionNodeForDisplay<P, string>;
  isDisabled?: boolean;
  onChange: (value: string | null) => void;
};

export const TextFilterValueInput = observer(<P extends TFilterProperty>(props: TTextFilterValueInputProps<P>) => {
  const { config, condition, onChange, isDisabled } = props;
  // derived values
  const conditionValue = condition.value?.toString();
  const isEmpty = !conditionValue;

  const { isOpen, setIsOpen, inputValue, setInputValue, inputRef, handleCancel, handleKeyDown } = useFilterInput(
    conditionValue,
    isEmpty,
    isDisabled || false
  );

  // Check if current input is valid for applying
  const trimmedInput = inputValue.trim();
  const isApplyDisabled =
    trimmedInput === "" ||
    (config.minLength !== undefined && trimmedInput.length < config.minLength) ||
    (config.maxLength !== undefined && trimmedInput.length > config.maxLength);

  const handleApply = () => {
    const trimmedValue = inputValue.trim();
    onChange(trimmedValue || null);
    setIsOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const action = handleKeyDown(e);
    if (action === "apply") {
      handleApply();
    }
  };

  return (
    <PopoverFilterInput
      displayValue={conditionValue}
      isApplyDisabled={isApplyDisabled}
      isDisabled={isDisabled}
      isEmpty={isEmpty}
      isOpen={isOpen}
      onApply={handleApply}
      onCancel={handleCancel}
      onOpenChange={setIsOpen}
      placeholder={EMPTY_FILTER_PLACEHOLDER_TEXT}
    >
      <Input
        ref={inputRef}
        type="text"
        inputSize="xs"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a value"
        className="w-full"
        minLength={config.minLength}
        maxLength={config.maxLength}
      />
      {(config.minLength !== undefined || config.maxLength !== undefined) && (
        <span className={FILTER_VALIDATION_MESSAGE_CLASSNAMES}>
          {config.minLength !== undefined && config.maxLength !== undefined
            ? `Length: ${config.minLength} - ${config.maxLength} characters`
            : config.minLength !== undefined
              ? `Min length: ${config.minLength} characters`
              : `Max length: ${config.maxLength} characters`}
        </span>
      )}
    </PopoverFilterInput>
  );
});
