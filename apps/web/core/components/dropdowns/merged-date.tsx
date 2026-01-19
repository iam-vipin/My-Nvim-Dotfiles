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
// helpers
import { formatDateRange, getDate } from "@plane/utils";

type Props = {
  startDate: Date | string | null | undefined;
  endDate: Date | string | null | undefined;
  className?: string;
};

/**
 * Formats merged date range display with smart formatting
 * - Single date: "Jan 24, 2025"
 * - Same year, same month: "Jan 24 - 28, 2025"
 * - Same year, different month: "Jan 24 - Feb 6, 2025"
 * - Different year: "Dec 28, 2024 - Jan 4, 2025"
 */
export const MergedDateDisplay = observer(function MergedDateDisplay(props: Props) {
  const { startDate, endDate, className = "" } = props;

  // Parse dates
  const parsedStartDate = getDate(startDate);
  const parsedEndDate = getDate(endDate);

  const displayText = formatDateRange(parsedStartDate, parsedEndDate);

  if (!displayText) {
    return null;
  }

  return <span className={className}>{displayText}</span>;
});
