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

import { PriorityIcon } from "@plane/propel/icons";
import { cn } from "@plane/propel/utils";
import type { TIssuePriorities } from "@plane/types";

export function DisplayPriority(props: { priority: TIssuePriorities; className?: string }) {
  const { priority, className } = props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary", className)}>
      <PriorityIcon priority={priority} containerClassName={`size-4`} withContainer />
      <div className="capitalize truncate">{priority}</div>
    </div>
  );
}
