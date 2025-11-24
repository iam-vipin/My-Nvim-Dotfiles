import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Input } from "../../input";
import { cn } from "../../utils";

type TNumberInputProps = {
  property: TIssueProperty<EIssuePropertyType.DECIMAL>;
  isPreview?: boolean;
  required?: boolean;
};

export const NumberInput: React.FC<TNumberInputProps> = ({ property, isPreview = false, required = false }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `property_${property.id}`;
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
          pattern: {
            value: /^-?\d*\.?\d+$/,
            message: "Please enter a valid number",
          },
        }}
        render={({ field: { value, onChange } }) => (
          <Input
            id={fieldName}
            type="number"
            value={value || ""}
            onChange={(e) => {
              const val = e.target.value;
              // Allow empty, numbers, negative sign, and decimal point
              if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
                onChange(val);
              }
            }}
            disabled={isPreview}
            placeholder={property.description || `Enter ${property.display_name?.toLowerCase()}`}
            hasError={Boolean(error)}
            className={cn("w-full text-base border-custom-border-300", {
              "cursor-not-allowed opacity-60": isPreview,
            })}
          />
        )}
      />
      {error && <span className="text-xs text-red-500">{error.message as string}</span>}
    </div>
  );
};
