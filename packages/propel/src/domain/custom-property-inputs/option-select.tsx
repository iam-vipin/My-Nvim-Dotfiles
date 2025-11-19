import React from "react";
import { Check } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty, TIssuePropertyOption } from "@plane/types";
import { Combobox } from "../../combobox";
import { ChevronDownIcon } from "../../icons";
import { cn } from "../../utils";

type TOptionSelectProps = {
  property: TIssueProperty<EIssuePropertyType.OPTION>;
  options: TIssuePropertyOption[];
  isPreview?: boolean;
  required?: boolean;
};

export const OptionSelect: React.FC<TOptionSelectProps> = ({
  property,
  options,
  isPreview = false,
  required = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `${property.id}`;
  const error = errors[fieldName];
  const isMulti = property.is_multi;

  const activeOptions = options.filter((opt) => opt.is_active);

  return (
    <div className="w-full space-y-1">
      <label htmlFor={fieldName} className="text-sm font-medium text-custom-text-300">
        {property.display_name}
        {(required || property.is_required) && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Controller
        control={control}
        name={fieldName}
        rules={{
          required: (required || property.is_required) && `${property.display_name} is required`,
        }}
        render={({ field: { value, onChange } }) => {
          const normalizedValue = Array.isArray(value)
            ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
            : [];
          const selectedOptionIds = normalizedValue;
          const selectableOptions = activeOptions.filter((option): option is TIssuePropertyOption & { id: string } =>
            Boolean(option.id)
          );
          const selectedOptions = selectableOptions.filter((option) => selectedOptionIds.includes(option.id));

          const placeholderText = isMulti
            ? `Select ${property.display_name?.toLowerCase() || "options"}`
            : `Select a ${property.display_name?.toLowerCase() || "option"}`;

          const buttonLabel = (() => {
            if (!selectedOptions.length) return placeholderText;
            if (!isMulti) return selectedOptions[0]?.name ?? placeholderText;
            if (selectedOptions.length === 1) return selectedOptions[0]?.name ?? placeholderText;
            if (selectedOptions.length === 2) {
              return selectedOptions
                .map((option) => option.name)
                .filter((name): name is string => Boolean(name))
                .join(", ");
            }
            return `${selectedOptions.length} selected`;
          })();

          const handleValueChange = (newValue: string | string[]) => {
            if (isMulti) {
              if (Array.isArray(newValue)) {
                onChange(newValue);
              } else {
                onChange(newValue ? [newValue] : []);
              }
            } else if (typeof newValue === "string") {
              onChange(newValue ? [newValue] : []);
            } else {
              onChange([]);
            }
          };

          const comboboxValue = isMulti ? selectedOptionIds : (selectedOptionIds[0] ?? undefined);
          const showSearch = selectableOptions.length > 7;

          return (
            <Combobox
              value={comboboxValue}
              onValueChange={handleValueChange}
              multiSelect={isMulti}
              disabled={isPreview}
            >
              <Combobox.Button
                disabled={isPreview}
                className={cn("flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-base", {
                  "border-custom-border-300 focus:ring-custom-primary-100": !error,
                  "border-red-500 focus:ring-red-500": error,
                  "cursor-not-allowed opacity-60": isPreview,
                })}
              >
                <span
                  className={cn("truncate", {
                    "text-custom-text-400": !selectedOptions.length,
                    "text-custom-text-200": selectedOptions.length,
                  })}
                >
                  {buttonLabel}
                </span>
                <ChevronDownIcon className="h-3.5 w-3.5 text-custom-text-400" aria-hidden="true" />
              </Combobox.Button>
              <Combobox.Options
                showSearch={showSearch}
                searchPlaceholder={`Search ${property.display_name?.toLowerCase() || "options"}...`}
                optionsContainerClassName="py-1 min-w-48"
                positionerClassName="z-[20] align-start min-w-48"
              >
                {selectableOptions.map((option) => {
                  const isSelected = selectedOptionIds.includes(option.id);
                  return (
                    <Combobox.Option key={option.id} value={option.id} className="w-full flex items-center gap-2">
                      {isSelected && <Check className="h-4 w-4 text-custom-text-200" aria-hidden="true" />}
                      <span className="truncate">{option.name}</span>
                    </Combobox.Option>
                  );
                })}
                {!selectableOptions.length && (
                  <div className="px-2 py-1.5 text-sm text-custom-text-400">No options available</div>
                )}
              </Combobox.Options>
            </Combobox>
          );
        }}
      />
      {error && <span className="text-xs text-red-500">{error.message as string}</span>}
    </div>
  );
};
