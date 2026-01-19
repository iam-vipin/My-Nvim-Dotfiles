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
// types
// components
import { IssueBlockCycle } from "@/components/issues/issue-layouts/properties/cycle";
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetCycleColumn = observer(function SpreadsheetCycleColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      <IssueBlockCycle cycleId={issue.cycle_id ?? undefined} shouldShowBorder={false} />
    </div>
  );
});
