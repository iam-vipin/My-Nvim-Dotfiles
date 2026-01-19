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
// plane imports
import { Card, ECardSpacing } from "../../card";

interface TreeMapTooltipProps {
  active: boolean | undefined;
  payload: any[] | undefined;
}

export const TreeMapTooltip = React.memo(function TreeMapTooltip({ active, payload }: TreeMapTooltipProps) {
  if (!active || !payload || !payload[0]?.payload) return null;

  const data = payload[0].payload;

  return (
    <Card className="flex flex-col space-y-1.5" spacing={ECardSpacing.SM}>
      <div className="flex items-center gap-2 border-b border-subtle pb-2.5">
        {data?.icon}
        <p className="text-11 text-primary font-medium capitalize">{data?.name}</p>
      </div>
      <span className="text-11 font-medium text-secondary">
        {data?.value.toLocaleString()}
        {data.label && ` ${data.label}`}
      </span>
    </Card>
  );
});

TreeMapTooltip.displayName = "TreeMapTooltip";
