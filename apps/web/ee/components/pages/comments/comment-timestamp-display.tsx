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

import { calculateTimeAgoShort, cn } from "@plane/utils";

type TimeDisplayProps = {
  timestamp: string;
  className?: string;
  showResolved?: boolean;
};

export function PageCommentTimestampDisplay({ timestamp, className = "", showResolved = false }: TimeDisplayProps) {
  return (
    <div className={cn("text-tertiary text-10 leading-3.5 overflow-hidden text-ellipsis whitespace-nowrap", className)}>
      {calculateTimeAgoShort(timestamp)}
      {showResolved && <span className="ml-2 text-success-primary">Resolved</span>}
    </div>
  );
}
