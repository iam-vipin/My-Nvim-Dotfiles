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

import { ArrowRight } from "lucide-react";
import { CalendarLayoutIcon } from "@plane/propel/icons";
import { cn, renderFormattedDate } from "@plane/utils";

export function DisplayDates(props: {
  startDate: string | null | undefined;
  endDate: string | null | undefined;
  className?: string;
}) {
  const { startDate, endDate, className } = props;
  return (
    <div className={cn("flex items-center gap-1 text-tertiary flex-wrap", className)}>
      <CalendarLayoutIcon className="size-4 flex-shrink-0" />
      <div className="text-13 flex-shrink-0"> {renderFormattedDate(startDate)}</div>
      {startDate && endDate && <ArrowRight className="h-3 w-3 flex-shrink-0" />}
      <div className="text-13 flex-shrink-0"> {renderFormattedDate(endDate)}</div>
    </div>
  );
}
