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
import type { IIssue } from "@/types/issue";

type Props = {
  issue: IIssue;
};

export const SpreadsheetLinkColumn = observer(function SpreadsheetLinkColumn(props: Props) {
  const { issue } = props;

  return (
    <div className="flex h-11 w-full items-center border-b-[0.5px] border-subtle-1 px-2.5 py-1 text-11 group-[.selected-issue-row]:bg-accent-primary/5 group-[.selected-issue-row]:hover:bg-accent-primary/10">
      {issue?.link_count} {issue?.link_count === 1 ? "link" : "links"}
    </div>
  );
});
