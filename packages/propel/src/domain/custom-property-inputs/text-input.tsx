import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Input } from "../../input";
import { cn } from "../../utils";

type TTextInputProps = {
  property: TIssueProperty<EIssuePropertyType.TEXT>;
  isPreview?: boolean;
  required?: boolean;
};

export const TextInput: React.FC<TTextInputProps> = ({ property, isPreview = false, required = false }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `${property.id}`;
  const displayFormat = property.settings?.display_format || "single-line";
  const isMultiLine = displayFormat === "multi-line";
  const error = errors[fieldName];

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
        render={({ field: { value, onChange } }) =>
          isMultiLine ? (
            <textarea
              id={fieldName}
              value={value || ""}
              onChange={onChange}
              disabled={isPreview}
              placeholder={property.description || `Enter ${property.display_name?.toLowerCase()}`}
              className={cn(
                "w-full px-3 py-2 rounded-md border bg-custom-background-100 text-sm placeholder-custom-text-400 focus:outline-none min-h-[100px] resize-none",
                {
                  "border-custom-border-300": !error,
                  "border-red-500": error,
                  "cursor-not-allowed opacity-60": isPreview,
                }
              )}
            />
          ) : (
            <Input
              id={fieldName}
              type="text"
              value={value || ""}
              onChange={onChange}
              disabled={isPreview}
              placeholder={property.description || `Enter ${property.display_name?.toLowerCase()}`}
              hasError={Boolean(error)}
              className={cn("w-full text-base border-custom-border-300", {
                "cursor-not-allowed opacity-60": isPreview,
              })}
            />
          )
        }
      />
      {error && <span className="text-xs text-red-500">{error.message as string}</span>}
    </div>
  );
};
