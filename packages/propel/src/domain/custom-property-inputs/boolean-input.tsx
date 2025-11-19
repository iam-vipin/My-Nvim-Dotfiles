import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Switch } from "../../switch";

type TBooleanInputProps = {
  property: TIssueProperty<EIssuePropertyType.BOOLEAN>;
  isPreview?: boolean;
  required?: boolean;
};

export const BooleanInput: React.FC<TBooleanInputProps> = ({ property, isPreview = false, required = false }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `${property.id}`;
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
              <label htmlFor={fieldName} className="text-sm font-medium text-custom-text-300">
                {property.display_name}
                {(required || property.is_required) && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              {property.description && <p className="mt-0.5 text-xs text-custom-text-400">{property.description}</p>}
            </div>
            <Switch
              value={value === "true" || value === true}
              onChange={(checked) => onChange(checked ? "true" : "false")}
              size="sm"
              disabled={isPreview}
            />
          </div>
        )}
      />
      {error && <span className="text-xs text-red-500">{error.message as string}</span>}
    </div>
  );
};
