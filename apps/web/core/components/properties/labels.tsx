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

import { cn } from "@plane/ui";
import { addSpaceIfCamelCase } from "@plane/utils";

export function DisplayLabels(props: {
  className?: string;
  labels: {
    color?: string;
    name: string;
  }[];
}) {
  const { labels, className } = props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary", className)}>
      {labels.map((label, index) => (
        <div key={index} className="flex items-center gap-1.5 max-w-[100px]">
          <div
            className={cn("flex-shrink-0 h-2 w-2 rounded-full", { "bg-layer-1": !label?.color })}
            style={{ backgroundColor: label?.color }}
          />
          <div className="truncate">{addSpaceIfCamelCase(label?.name ?? "")}</div>
        </div>
      ))}
    </div>
  );
}
