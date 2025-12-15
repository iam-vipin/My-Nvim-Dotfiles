import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Switch } from "../../switch";

type TBooleanInputProps = {
  property: TIssueProperty<EIssuePropertyType.BOOLEAN>;
  isPreview?: boolean;
  required?: boolean;
};

export function BooleanInput({ property, isPreview = false, required = false }: TBooleanInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `property_${property.id}`;
  const error = errors[fieldName];

  return (
    <div className="w-full space-y-1">
      <Controller
        control={control}
        name={fieldName}
        rules={{
          required: (required || property.is_required) && `${property.display_name} is required`,
        }}
        render={({ field: { value, onChange } }) => (
          <div className="flex items-center gap-3">
            <div>
              <label htmlFor={fieldName} className="text-13 font-medium text-tertiary">
                {property.display_name}
                {(required || property.is_required) && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              {property.description && <p className="mt-0.5 text-11 text-placeholder">{property.description}</p>}
            </div>
            <Switch
              value={value === "true" || value === true}
              onChange={(checked) => onChange(checked)}
              size="sm"
              disabled={isPreview}
            />
          </div>
        )}
      />
      {error && <span className="text-11 text-red-500">{error.message as string}</span>}
    </div>
  );
}
