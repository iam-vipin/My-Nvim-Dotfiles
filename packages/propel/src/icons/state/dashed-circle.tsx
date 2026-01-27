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

interface DashedCircleProps {
  center: number;
  radius: number;
  color: string;
  percentage: number;
  totalSegments?: number;
}

export function DashedCircle({ center, color, percentage, totalSegments = 15 }: DashedCircleProps) {
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.max(0, Math.min(100, percentage));

  // Generate dashed segments for the circle
  const generateDashedCircle = () => {
    const segments = [];
    const angleIncrement = 360 / totalSegments;

    for (let i = 0; i < totalSegments; i++) {
      // Calculate the angle for this segment (starting from top/12 o'clock position)
      const angle = i * angleIncrement - 90; // -90 adjusts to start from top center

      // Calculate if this segment should be hidden based on percentage
      const segmentStartPercentage = (i / totalSegments) * 100;
      const isSegmentVisible = segmentStartPercentage >= validPercentage;

      if (isSegmentVisible) {
        segments.push(
          <g key={i} transform={`translate(${center} ${center}) rotate(${angle})`}>
            <line x1={5.75} y1="0" x2={6.5} y2="0" stroke={color} strokeWidth={1.21} strokeLinecap="round" />
          </g>
        );
      }
    }
    return segments;
  };

  return <g>{generateDashedCircle()}</g>;
}
