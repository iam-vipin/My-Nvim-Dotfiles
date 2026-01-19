/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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

export function NumberInput({ property, isPreview = false, required = false }: TNumberInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldName = `property_${property.id}`;
  const error = errors[fieldName];

  return (
    <div className="w-full space-y-1">
      <label htmlFor={fieldName} className="text-13 font-medium text-tertiary">
        {property.display_name}
        {(required || property.is_required) && <span className="ml-0.5 text-danger-primary">*</span>}
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
            className={cn("w-full text-14 border-subtle-1", {
              "cursor-not-allowed opacity-60": isPreview,
            })}
          />
        )}
      />
      {error && <span className="text-11 text-danger-primary">{error.message as string}</span>}
    </div>
  );
}
