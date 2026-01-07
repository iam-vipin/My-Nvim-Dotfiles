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

import { observer } from "mobx-react";
import { DueDatePropertyIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";
// helpers
import { renderFormattedDate } from "@/helpers/date-time.helper";
import { shouldHighlightIssueDueDate } from "@/helpers/issue.helper";
// hooks
import { useStates } from "@/hooks/store/use-state";

type Props = {
  due_date: string | undefined;
  stateId: string | undefined;
  shouldHighLight?: boolean;
  shouldShowBorder?: boolean;
};

export const IssueBlockDate = observer(function IssueBlockDate(props: Props) {
  const { due_date, stateId, shouldHighLight = true, shouldShowBorder = true } = props;
  const { getStateById } = useStates();

  const state = getStateById(stateId);

  const formattedDate = renderFormattedDate(due_date);

  return (
    <Tooltip tooltipHeading="Due Date" tooltipContent={formattedDate}>
      <div
        className={cn("flex h-full items-center gap-1 rounded-sm px-2.5 py-1 text-11 text-primary", {
          "text-danger-primary": shouldHighLight && due_date && shouldHighlightIssueDueDate(due_date, state?.group),
          "border-[0.5px] border-strong": shouldShowBorder,
        })}
      >
        <DueDatePropertyIcon className="size-3 flex-shrink-0" />
        {formattedDate ? formattedDate : "No Date"}
      </div>
    </Tooltip>
  );
});
