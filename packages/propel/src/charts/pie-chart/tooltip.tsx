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
import type { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
// plane imports
import { Card, ECardSpacing } from "../../card";

type Props = {
  dotColor?: string;
  label: string;
  payload: Payload<ValueType, NameType>[];
};

export const CustomPieChartTooltip = React.memo(function CustomPieChartTooltip(props: Props) {
  const { dotColor, label, payload } = props;

  return (
    <Card
      className="flex flex-col max-h-[40vh] w-[12rem] overflow-y-scroll vertical-scrollbar scrollbar-sm"
      spacing={ECardSpacing.SM}
    >
      <p className="flex-shrink-0 text-11 text-primary font-medium border-b border-subtle pb-2 truncate">{label}</p>
      {payload?.map((item) => (
        <div key={item?.dataKey} className="flex items-center gap-2 text-11 capitalize">
          <div className="flex items-center gap-2 truncate">
            <div
              className="flex-shrink-0 size-2 rounded-xs"
              style={{
                backgroundColor: dotColor,
              }}
            />
            <span className="text-tertiary truncate">{item?.name}:</span>
          </div>
          <span className="flex-shrink-0 font-medium text-secondary">{item?.value}</span>
        </div>
      ))}
    </Card>
  );
});
CustomPieChartTooltip.displayName = "CustomPieChartTooltip";
