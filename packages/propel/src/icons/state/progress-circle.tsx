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

import * as React from "react";

interface ProgressCircleProps {
  center: number;
  radius: number;
  color: string;
  strokeWidth: number;
  circumference: number;
  dashOffset: number;
}

export function ProgressCircle({ center, radius, color, strokeWidth, circumference, dashOffset }: ProgressCircleProps) {
  return (
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={circumference}
      strokeDashoffset={dashOffset}
      strokeLinecap="round"
      transform={`rotate(-90 ${center} ${center})`}
    />
  );
}
