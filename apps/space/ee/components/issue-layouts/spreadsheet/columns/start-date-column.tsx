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
import { IssueBlockDate } from "@/components/issues/issue-layouts/properties/due-date";
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetStartDateColumn = observer(function SpreadsheetStartDateColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      <IssueBlockDate
        due_date={issue.start_date ?? undefined}
        stateId={issue.state_id ?? undefined}
        shouldHighLight={false}
        shouldShowBorder={false}
      />
    </div>
  );
});
