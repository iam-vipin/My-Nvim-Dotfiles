import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { EIssuePropertyType, TIssueProperty } from "@plane/types";
import { Input } from "../../input";
import { cn } from "../../utils";

type TUrlInputProps = {
  property: TIssueProperty<EIssuePropertyType.URL>;
  isPreview?: boolean;
  required?: boolean;
};

export const UrlInput: React.FC<TUrlInputProps> = ({ property, isPreview = false, required = false }) => {
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
            value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
            message: "Please enter a valid URL",
          },
        }}
        render={({ field: { value, onChange } }) => (
          <Input
            id={fieldName}
            type="text"
            value={value || ""}
            onChange={onChange}
            disabled={isPreview}
            placeholder={property.description || "https://example.com"}
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
