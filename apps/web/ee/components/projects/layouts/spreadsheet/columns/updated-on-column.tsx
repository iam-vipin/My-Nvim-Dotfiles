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
import { getDate, renderFormattedPayloadDate } from "@plane/utils";
// components
import { DateRangeDropdown } from "@/components/dropdowns/date-range";
import type { TProject } from "@/types/projects";

type Props = {
  project: TProject;
  disabled: boolean;
  onChange: (project: TProject, data: Partial<TProject>) => void;
};

export const SpreadsheetUpdatedOnColumn = observer(function SpreadsheetUpdatedOnColumn(props: Props) {
  const { project, onChange, disabled } = props;

  return (
    <div className="flex h-11 w-full items-center justify-start border-b-[0.5px] border-subtle-1 text-11 hover:bg-layer-1 group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10">
      <DateRangeDropdown
        buttonVariant="transparent-with-text"
        className="h-7"
        buttonClassName="px-4 text-left rounded-none group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10"
        minDate={new Date()}
        value={{
          from: getDate(project.start_date),
          to: getDate(project.target_date),
        }}
        onSelect={(val) => {
          console.log({ val });
          onChange(project, {
            start_date: val?.from ? renderFormattedPayloadDate(val.from)! : undefined,
            target_date: val?.to ? renderFormattedPayloadDate(val.to)! : undefined,
          });
        }}
        placeholder={{
          from: "Start date",
          to: "End date",
        }}
        hideIcon={{
          to: true,
        }}
        tabIndex={3}
        disabled={disabled}
      />
    </div>
  );
});
