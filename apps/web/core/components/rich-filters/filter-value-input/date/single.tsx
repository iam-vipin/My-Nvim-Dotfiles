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
// plane imports
import type { TDateFilterFieldConfig, TFilterConditionNodeForDisplay, TFilterProperty } from "@plane/types";
import { cn, renderFormattedPayloadDate } from "@plane/utils";
import { DateDropdown } from "@/components/dropdowns/date";
import { COMMON_FILTER_ITEM_BORDER_CLASSNAME, EMPTY_FILTER_PLACEHOLDER_TEXT } from "../../shared";

type TSingleDateFilterValueInputProps<P extends TFilterProperty> = {
  config: TDateFilterFieldConfig<string>;
  condition: TFilterConditionNodeForDisplay<P, string>;
  isDisabled?: boolean;
  onChange: (value: string | null | undefined) => void;
};

export const SingleDateFilterValueInput = observer(function SingleDateFilterValueInput<P extends TFilterProperty>(
  props: TSingleDateFilterValueInputProps<P>
) {
  const { config, condition, isDisabled, onChange } = props;
  // derived values
  const conditionValue = typeof condition.value === "string" ? condition.value : null;

  return (
    <DateDropdown
      value={conditionValue}
      onChange={(value: Date | null) => {
        const formattedDate = value ? renderFormattedPayloadDate(value) : null;
        onChange(formattedDate);
      }}
      buttonClassName={cn("rounded-none", {
        [COMMON_FILTER_ITEM_BORDER_CLASSNAME]: !isDisabled,
        "text-placeholder": !conditionValue,
        "hover:bg-surface-1": isDisabled,
      })}
      minDate={config.min}
      maxDate={config.max}
      icon={null}
      placeholder={EMPTY_FILTER_PLACEHOLDER_TEXT}
      buttonVariant="transparent-with-text"
      isClearable={false}
      closeOnSelect
      defaultOpen={!conditionValue}
      disabled={isDisabled}
    />
  );
});
