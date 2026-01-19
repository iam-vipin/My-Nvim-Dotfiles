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

// plane package imports
import type { ReactNode } from "react";
import React from "react";
// plane package imports
import { ANALYTICS_DURATION_FILTER_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { CalendarLayoutIcon } from "@plane/propel/icons";
import { CustomSearchSelect } from "@plane/ui";
// types
import type { TDropdownProps } from "@/components/dropdowns/types";

type Props = TDropdownProps & {
  value: string | null;
  onChange: (val: (typeof ANALYTICS_DURATION_FILTER_OPTIONS)[number]["value"]) => void;
  //optional
  button?: ReactNode;
  dropdownArrow?: boolean;
  dropdownArrowClassName?: string;
  onClose?: () => void;
  renderByDefault?: boolean;
  tabIndex?: number;
};

function DurationDropdown({ placeholder = "Duration", onChange, value }: Props) {
  useTranslation();

  const options = ANALYTICS_DURATION_FILTER_OPTIONS.map((option) => ({
    value: option.value,
    query: option.name,
    content: (
      <div className="flex max-w-[300px] items-center gap-2">
        <span className="flex-grow truncate">{option.name}</span>
      </div>
    ),
  }));
  return (
    <CustomSearchSelect
      value={value ? [value] : []}
      onChange={onChange}
      options={options}
      label={
        <div className="flex items-center gap-2 p-1 ">
          <CalendarLayoutIcon className="h-4 w-4" />
          {value ? ANALYTICS_DURATION_FILTER_OPTIONS.find((opt) => opt.value === value)?.name : placeholder}
        </div>
      }
    />
  );
}

export default DurationDropdown;
