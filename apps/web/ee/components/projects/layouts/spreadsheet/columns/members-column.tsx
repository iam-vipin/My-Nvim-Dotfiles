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
import { cn } from "@plane/utils";
// hooks
import type { TProject } from "@/plane-web/types/projects";

type Props = {
  project: TProject;
};

export const SpreadsheetMembersColumn = observer(function SpreadsheetMembersColumn(props: Props) {
  const { project } = props;

  // derived values
  const membersCount = project.members?.length ?? 0;

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center border-b-[0.5px] border-subtle-1 px-4 py-1 text-11 hover:bg-layer-1 group-[.selected-project-row]:bg-accent-primary/5 group-[.selected-project-row]:hover:bg-accent-primary/10"
      )}
    >
      {membersCount}
    </div>
  );
});
