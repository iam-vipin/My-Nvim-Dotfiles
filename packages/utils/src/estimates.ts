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

// plane web constants
import { EEstimateSystem } from "@plane/constants";

export const isEstimatePointValuesRepeated = (
  estimatePoints: string[],
  estimateType: EEstimateSystem,
  newEstimatePoint?: string
) => {
  const currentEstimatePoints = estimatePoints.map((estimatePoint) => estimatePoint.trim());
  let isRepeated = false;

  if (newEstimatePoint === undefined) {
    if (estimateType === EEstimateSystem.CATEGORIES) {
      const points = new Set(currentEstimatePoints);
      if (points.size != currentEstimatePoints.length) isRepeated = true;
    } else if ([EEstimateSystem.POINTS, EEstimateSystem.TIME].includes(estimateType)) {
      currentEstimatePoints.map((point) => {
        if (Number(point) === Number(newEstimatePoint)) isRepeated = true;
      });
    }
  } else {
    if (estimateType === EEstimateSystem.CATEGORIES) {
      currentEstimatePoints.map((point) => {
        if (point === newEstimatePoint.trim()) isRepeated = true;
      });
    } else if ([EEstimateSystem.POINTS, EEstimateSystem.TIME].includes(estimateType)) {
      currentEstimatePoints.map((point) => {
        if (Number(point) === Number(newEstimatePoint.trim())) isRepeated = true;
      });
    }
  }

  return isRepeated;
};
