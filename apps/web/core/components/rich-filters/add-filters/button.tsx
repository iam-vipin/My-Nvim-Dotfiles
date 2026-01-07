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
import { observer } from "mobx-react";
import { ListFilter } from "lucide-react";
// plane imports
import type { TButtonSize, TButtonVariant } from "@plane/propel/button";
import { getButtonStyling } from "@plane/propel/button";
import type { IFilterInstance } from "@plane/shared-state";
import type { TExternalFilter, TFilterProperty, TSupportedOperators } from "@plane/types";
import { LOGICAL_OPERATOR } from "@plane/types";
import { cn } from "@plane/utils";
// local imports
import { AddFilterDropdown } from "./dropdown";

export type TAddFilterButtonProps<P extends TFilterProperty, E extends TExternalFilter> = {
  buttonConfig?: {
    label: string | null;
    variant?: TButtonVariant;
    size?: TButtonSize;
    className?: string;
    defaultOpen?: boolean;
    iconConfig?: {
      shouldShowIcon: boolean;
      iconComponent?: React.ElementType;
    };
    isDisabled?: boolean;
  };
  filter: IFilterInstance<P, E>;
  onFilterSelect?: (id: string) => void;
};

export const AddFilterButton = observer(function AddFilterButton<P extends TFilterProperty, E extends TExternalFilter>(
  props: TAddFilterButtonProps<P, E>
) {
  const { filter, buttonConfig, onFilterSelect } = props;
  const {
    variant = "secondary",
    size = "base",
    className,
    label,
    iconConfig = { shouldShowIcon: true },
    isDisabled = false,
  } = buttonConfig || {};
  // derived values
  const FilterIcon = iconConfig.iconComponent || ListFilter;

  const handleFilterSelect = (property: P, operator: TSupportedOperators, isNegation: boolean) => {
    filter.addCondition(
      LOGICAL_OPERATOR.AND,
      {
        property,
        operator,
        value: undefined,
      },
      isNegation
    );
    onFilterSelect?.(property);
  };

  if (isDisabled) return null;
  return (
    <AddFilterDropdown
      {...props}
      buttonConfig={{
        ...buttonConfig,
        className: cn(getButtonStyling(variant, size), "py-[5px]", className),
      }}
      handleFilterSelect={handleFilterSelect}
      customButton={
        <div className="flex items-center gap-1">
          {iconConfig.shouldShowIcon && <FilterIcon className="size-4 text-secondary" />}
          {label}
        </div>
      }
    />
  );
});
