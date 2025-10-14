"use client";

import type { FC } from "react";
import { observer } from "mobx-react";
import { Check } from "lucide-react";
// plane imports
import { INITIATIVE_STATES } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Combobox } from "@plane/propel/combobox";
import { InitiativeStateIcon } from "@plane/propel/icons";
import type { TInitiativeStates } from "@plane/types";
import { cn } from "@plane/utils";

// types
export type TInitiativeStateDropdownProps = {
  value: TInitiativeStates;
  onChange?: (value: TInitiativeStates) => void;
  disabled?: boolean;
  buttonVariant?:
    | "border-with-text"
    | "border-without-text"
    | "background-with-text"
    | "background-without-text"
    | "transparent-with-text"
    | "transparent-without-text";
  buttonClassName?: string;
  className?: string;
  tabIndex?: number;
  showTooltip?: boolean;
  placeholder?: string;
  readonly?: boolean;
};

export const InitiativeStateDropdown: FC<TInitiativeStateDropdownProps> = observer((props) => {
  const {
    value,
    onChange,
    disabled = false,
    buttonClassName = "",
    className = "",
    placeholder = "Select state",
    readonly = false,
  } = props;

  // plane hooks
  const { t } = useTranslation();

  const stateOptions = Object.values(INITIATIVE_STATES).map((state) => ({
    value: state.key,
    query: state.title,
    content: (
      <div className="flex items-center gap-2">
        <InitiativeStateIcon state={state.key} className="h-4 w-4 flex-shrink-0" />
        <span className="flex-grow truncate text-left text-xs">{state.title}</span>
      </div>
    ),
  }));

  const selectedState = stateOptions.find((option) => option.value === value);

  const handleValueChange = (newValue: string | string[]) => {
    if (typeof newValue === "string") {
      onChange?.(newValue as TInitiativeStates);
    }
  };

  return (
    <div className={className}>
      <Combobox value={value} onValueChange={handleValueChange} disabled={disabled || readonly}>
        <Combobox.Button
          className={cn(
            "flex h-full w-full items-center justify-between gap-1 rounded border border-custom-border-300 px-2 py-1 text-xs hover:bg-custom-background-80",
            buttonClassName
          )}
          disabled={disabled || readonly}
        >
          <div className="flex items-center gap-2">
            {selectedState ? (
              <>
                {value ? <InitiativeStateIcon state={value} className="h-4 w-4 flex-shrink-0" /> : null}
                <span className="flex-grow truncate">{selectedState.query}</span>
              </>
            ) : (
              <span className="text-custom-text-400">{placeholder}</span>
            )}
          </div>
        </Combobox.Button>
        <Combobox.Options
          showSearch
          searchPlaceholder={t("search")}
          emptyMessage={t("no_matching_results")}
          maxHeight="md"
          className="w-48 rounded border-[0.5px] border-custom-border-300 bg-custom-background-100 px-2 py-2.5 text-xs shadow-custom-shadow-rg"
          inputClassName="w-full bg-transparent py-1 text-xs text-custom-text-200 placeholder:text-custom-text-400 focus:outline-none"
          optionsContainerClassName="mt-2 space-y-1"
          positionerClassName="z-50"
        >
          {stateOptions.map((option) => (
            <Combobox.Option
              key={option.value}
              value={option.value}
              className="w-full truncate flex items-center justify-between gap-2 rounded px-1 py-1.5 cursor-pointer select-none hover:bg-custom-background-80 data-[selected]:text-custom-text-100 text-custom-text-200 "
            >
              <span className="flex-grow truncate">{option.content}</span>
              {option.value === value && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
});
