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

// ------------ DEPRECATED (Use re-charts and its helpers instead) ------------

export const generateYAxisTickValues = (data: number[]) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  const minValue = 0;
  const maxValue = Math.max(...data);

  const valueRange = maxValue - minValue;

  let tickInterval = 1;

  if (valueRange < 10) tickInterval = 1;
  else if (valueRange < 20) tickInterval = 2;
  else if (valueRange < 50) tickInterval = 5;
  else tickInterval = (Math.ceil(valueRange / 100) * 100) / 10;

  const tickValues: number[] = [];
  let tickValue = minValue;
  while (tickValue <= maxValue) {
    tickValues.push(tickValue);
    tickValue += tickInterval;
  }

  return tickValues;
};
