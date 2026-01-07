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
import { CalendarDays } from "lucide-react";
// ui
import { CalendarAfterIcon, CalendarBeforeIcon } from "@plane/propel/icons";
import { CustomSelect } from "@plane/ui";

type Props = {
  title: string;
  value: string;
  onChange: (value: string) => void;
};

type DueDate = {
  name: string;
  value: string;
  icon: any;
};

const dueDateRange: DueDate[] = [
  {
    name: "before",
    value: "before",
    icon: <CalendarBeforeIcon className="h-4 w-4" />,
  },
  {
    name: "after",
    value: "after",
    icon: <CalendarAfterIcon className="h-4 w-4" />,
  },
  {
    name: "range",
    value: "range",
    icon: <CalendarDays className="h-4 w-4" />,
  },
];

export function DateFilterSelect({ title, value, onChange }: Props) {
  return (
    <CustomSelect
      value={value}
      label={
        <div className="flex items-center gap-2 text-11">
          {dueDateRange.find((item) => item.value === value)?.icon}
          <span>
            {title} {dueDateRange.find((item) => item.value === value)?.name}
          </span>
        </div>
      }
      onChange={onChange}
    >
      {dueDateRange.map((option, index) => (
        <CustomSelect.Option key={index} value={option.value}>
          <div className="flex items-center gap-2">
            <span>{option.icon}</span>
            {title} {option.name}
          </div>
        </CustomSelect.Option>
      ))}
    </CustomSelect>
  );
}
